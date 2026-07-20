#!/usr/bin/env python3
"""
Scan git-tracked files for credentials that look real (PLAT-11).

The point is to catch a secret *before* it reaches a commit, because once it is
pushed, deleting it from the file does not remove it from history — the only
real remedy is rotating the value. See docs/SECRETS.md.

Usage:
    python scripts/check_secrets.py            # scan every tracked file
    python scripts/check_secrets.py --staged   # scan only staged changes (git hook)

Exit code 0 = clean, 1 = findings, 2 = could not run.

Deliberately conservative: it flags shapes that are unambiguous (provider key
prefixes, PEM blocks) plus assignments to secret-ish names whose value does not
look like a placeholder. Lock files and this script's own patterns are skipped.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Files that legitimately contain high-entropy strings that are not secrets.
SKIP_SUFFIXES = (".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".pdf", ".woff", ".woff2")
SKIP_NAMES = {"package-lock.json", "check_secrets.py", "SECRETS.md", "config.py"}
SKIP_DIR_PARTS = {"node_modules", "venv", ".git", "dist", "build", "__pycache__", ".ruff_cache"}

# A value that is obviously a stand-in rather than a live credential.
# Matched as a whole value...
PLACEHOLDER_EXACT = re.compile(
    r"^(|xxx+|placeholder|example|dummy|mock|fake|sample|secret|password|postgres|"
    r"minioadmin|localhost|todo|n/?a)$",
    re.IGNORECASE,
)
# ...or by a tell-tale marker appearing anywhere inside it, so compound
# placeholders like `sk-your-openai-key` and
# `dev-only-jwt-secret-change-before-production` are recognised too.
PLACEHOLDER_MARKER = re.compile(
    r"(your[_-]|change[_-]?me|change[_-]before|change[_-]in[_-]|dev[_-]only|"
    r"placeholder|redacted|\bexample\b|dummy|\bmock\b|\bfake\b|sample|xin[_-]tu|"
    r"ask[_-]team|todo|<[^>]*>|\$\{)",
    re.IGNORECASE,
)


def _is_placeholder(value: str) -> bool:
    return bool(PLACEHOLDER_EXACT.match(value) or PLACEHOLDER_MARKER.search(value))

PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    # Covers both the classic `sk-<blob>` and the newer `sk-proj-<blob>` shapes.
    ("OpenAI API key", re.compile(r"sk-(?:proj-|svcacct-)?[A-Za-z0-9]{20,}")),
    ("Anthropic API key", re.compile(r"sk-ant-[A-Za-z0-9_\-]{20,}")),
    ("AWS access key id", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[0-9A-Za-z\-]{10,}\b")),
    ("Private key block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("Connection string with password", re.compile(r"://[^\s:/@]+:[^\s:/@]{6,}@[^\s/]+")),
]

# NAME=VALUE assignments to secret-ish names.
#
# Only applied to config and documentation files. In real source code an
# assignment like `prompt_tokens = Column(Integer)` or `token = create_token()`
# is ordinary code, not a credential — running this heuristic over .py/.ts turns
# the scanner into noise, and a noisy scanner gets ignored. Source files are
# still covered by PATTERNS above, which match credential *shapes* and do not
# depend on the variable name.
CONFIG_LIKE_SUFFIXES = {".env", ".example", ".yml", ".yaml", ".json", ".md", ".sh", ".ini",
                        ".toml", ".cfg", ".conf", ".properties", ".tf", ".tfvars"}

ASSIGNMENT = re.compile(
    r"""(?<![A-Za-z0-9_])"""
    r"""(?P<name>(?:[A-Za-z0-9]+_)*(?:PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|ACCESS_?KEY)"""
    r"""(?:_[A-Za-z0-9]+)*)"""
    r"""\s*[=:]\s*["']?(?P<value>[^\s"',;}#]+)["']?""",
    re.IGNORECASE,
)

# Names that contain a secret-ish word but denote something harmless.
BENIGN_NAMES = re.compile(
    r"^(.*_tokens|tokens?_.*|token_type|hashed_password|password_hash|.*_token_expire.*|"
    r"secret_name|.*_secret_ref|jwt_algorithm)$",
    re.IGNORECASE,
)


def _is_config_like(path: Path) -> bool:
    return path.suffix.lower() in CONFIG_LIKE_SUFFIXES or path.name.startswith(".env")


def tracked_files(staged: bool) -> list[Path]:
    cmd = ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"] if staged \
        else ["git", "ls-files"]
    out = subprocess.run(cmd, cwd=REPO_ROOT, capture_output=True, text=True)
    if out.returncode != 0:
        print(f"error: {' '.join(cmd)} failed:\n{out.stderr}", file=sys.stderr)
        raise SystemExit(2)
    paths = []
    for line in out.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        path = REPO_ROOT / line
        if not path.is_file():
            continue
        if path.name in SKIP_NAMES or path.suffix.lower() in SKIP_SUFFIXES:
            continue
        if SKIP_DIR_PARTS.intersection(path.parts):
            continue
        paths.append(path)
    return paths


def scan_line(line: str, path: Path) -> list[str]:
    """Return a list of reasons this line looks like it contains a secret."""
    findings = []
    for label, pattern in PATTERNS:
        match = pattern.search(line)
        if not match:
            continue
        matched = match.group(0)
        if label == "Connection string with password":
            # Judge a connection string by its *password* only. Running the
            # whole-match placeholder check here would skip
            # `postgresql://admin:R7xK9mQ2wL5n@db.production.example.com/prod`
            # merely because the hostname contains "example" — a real leak
            # hidden by a marker meant for placeholder values.
            creds = re.search(r"://([^\s:/@]+):([^\s:/@]+)@([^\s/:]+)", matched)
            if creds:
                _, password, host = creds.groups()
                if _is_placeholder(password) or host in {"localhost", "127.0.0.1", "db", "postgres"}:
                    continue
        elif _is_placeholder(matched):
            # `sk-your-openai-key` style placeholders are fine.
            continue
        findings.append(label)

    if not _is_config_like(path):
        return findings

    assignment = ASSIGNMENT.search(line)
    if assignment:
        value = assignment.group("value")
        name = assignment.group("name")
        if (
            len(value) >= 8
            and not BENIGN_NAMES.match(name)
            and not _is_placeholder(value)
            and not value.startswith(("${", "<", "$(", "os.", "settings.", "process.env"))
            # A function call or expression, not a literal credential.
            and "(" not in value
            # Reference to another variable (ALL_CAPS), not a literal.
            and not re.fullmatch(r"[A-Z][A-Z0-9_]*", value)
        ):
            findings.append(f"{name} assigned a non-placeholder value")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--staged", action="store_true",
                        help="Scan only staged files (for use in a pre-commit hook).")
    args = parser.parse_args()

    findings: list[tuple[Path, int, str, str]] = []
    for path in tracked_files(args.staged):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for lineno, line in enumerate(text.splitlines(), start=1):
            if len(line) > 500:  # minified bundles produce noise, not secrets
                continue
            for reason in scan_line(line, path):
                findings.append((path.relative_to(REPO_ROOT), lineno, reason, line.strip()[:110]))

    if not findings:
        print("check-secrets: clean — no credential-shaped strings found.")
        return 0

    print(f"check-secrets: {len(findings)} potential secret(s) found\n")
    for path, lineno, reason, snippet in findings:
        print(f"  {path}:{lineno}")
        print(f"    {reason}")
        print(f"    {snippet}")
        print()
    print("If a finding is a real credential: rotate it (docs/SECRETS.md §4).")
    print("If it is a false positive: use an obvious placeholder, or add the file to SKIP_NAMES.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
