# Project Conventions — AI Agent Rules

## Overview
Monorepo template for AI-integrated applications. Deployed via Dokploy (Application mode — each service has its own Dockerfile).

## Repository Structure Rules
- **Services** (`services/`) — Independently deployable Python/FastAPI microservices. Each has its own Dockerfile.
- **Apps** (`apps/`) — Vite+React frontend applications. Each has its own Dockerfile.
- **Packages** (`packages/`) — Shared code used by multiple services/apps.
- **Docs** (`docs/`) — Onboarding, architecture, API documentation.

## Deployment Model
- **Dokploy Application mode**: Each service is a separate Dokploy Application pointing to its Dockerfile
- **Database**: Dokploy Database Service (PostgreSQL, managed)
- **No docker-compose in production**: Dokploy manages containers, networking, SSL
- **Branch strategy**: `dev` branch → dev environment, `main` → production

## Coding Conventions

### Python (Backend Services)
- Python 3.12+
- FastAPI for all API services
- Pydantic v2 for data validation
- SQLAlchemy 2.0+ with async support for database operations
- Type hints required on all public functions
- Use `async/await` for I/O operations
- Follow PEP 8 style

### TypeScript (Frontend Apps)
- React 18+ with functional components and hooks
- TypeScript strict mode
- Vite for build tooling
- Import shared types from `packages/shared-types/`

### AI Service Specifics
- Mọi hệ thống AI Agent từ RAG đến Workflow đều **chuẩn hóa 100% sử dụng Agno**. Không dùng LangGraph để giữ kiến trúc đơn giản, tinh gọn nhất.
- All agents must implement the `BaseAgent` interface from `src/core/base_agent.py`
- All agent executions must be traced via Postgres DB
- Tools go in `src/tools/` and are shared between frameworks
- Model provider abstraction in `src/core/model_provider.py` — never hardcode model names

## Dockerfile Rules
- Each service's Dockerfile assumes **build context = repo root**
- Use multi-stage builds (builder + runtime)
- Ensure all COPY commands use paths relative to the root (e.g., `COPY services/backend/requirements.txt .`)
- Dokploy sets the Dockerfile path in UI

## File Naming
- Python: `snake_case.py`
- TypeScript: `camelCase.tsx` for components, `camelCase.ts` for utilities
- Directories: `kebab-case` or `snake_case`
- NTFS-safe: no `: ? * < > | "` in filenames

## Environment Variables
- Defined in `.env.example` as documentation
- Set via **Dokploy UI** per service in production
- Never commit secrets to Git

## Documentation
- Every service/app MUST have a `README.md`
- API changes must update `packages/shared-types/`
- Architecture changes must update `docs/ARCHITECTURE.md`

## What NOT to Modify
- `.loop_engineer/` — managed by automation
- `.env` files — contain secrets, never commit

## Antigravity & Kiro Specific Rules
- **No Placeholders**: Never write placeholder code (`// TODO: implement`, `pass`, `...`). Always write the full implementation.
- **Frontend (Vite + React)**: Use modern React practices (Hooks, Functional Components). Always run frontend linters after edits.
- **Backend (FastAPI)**: Enforce strict type hinting. Use Pydantic for validation. Rely on Dependency Injection for DB sessions.
- **Do No Harm**: Verify `git status --short` and run relevant tests (pytest/vitest) locally before calling a task done.

<!-- HARNESS:BEGIN -->
## Harness Workflow

This repo uses a robust, markdown-based workflow for Human-AI agent coordination.

**1. Communication Rule**
- You MUST respond only in English. Do not use conversational filler. Be terse.

**2. Workflow Rules**
- **Sprint 0 Auto-Onboarding**: If the user explicitly asks to start Sprint 0 (e.g., "Hãy bắt đầu Sprint 0"), you MUST run the command `make setup-sprint0` in the terminal to automatically set up their personal ideation folder. Once the folder is created, immediately transition into the `ideation-assistant` mode and start the product interview. Do NOT ask for permission to run the setup command.
- **Sprint 0 Ideation Mode**: If the user is in Sprint 0, DO NOT write technical code. Your job is to act as a product brainstormer. Follow the 4-step Diverge/Converge process defined in `docs/TEAM_WORKFLOW.md`. Use the `ideation-assistant` skill when asked to help brainstorm.
- Before starting a task, read `docs/HARNESS.md` and follow the phases outlined in `docs/TEAM_WORKFLOW.md`.
- Do NOT attempt to run any `harness-cli` commands (the system has been removed).
- Always run tests and linters before marking tasks as done in `docs/SPRINT_ACTIVE.md` using `[x]`.
- **Agent Handoff**: When finishing a complex task, you MUST copy `docs/templates/STORY_PACKET_TEMPLATE.md` to `docs/stories/<task-name>.md` and fill it out to provide context for your direct pushes to `main`.
- Major architecture changes must be logged in `docs/decisions/` using `0000-template.md`.
<!-- HARNESS:END -->
