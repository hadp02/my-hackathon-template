import argparse
import asyncio
import sys
import subprocess
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import func, select, delete
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import structlog

from src.core.config import settings
from src.models.user import User
from src.models.example import Item
from src.models.agent_trace import AgentTrace

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ]
)
logger = structlog.get_logger()

# ----- SEED -----
SEED_USERS = [
    {
        "email": "admin@example.com",
        "display_name": "Admin",
        "role": "admin",
        "is_active": True,
        "auth_provider_id": "seed-admin-001",
    },
    {
        "email": "user1@example.com",
        "display_name": "Demo User 1",
        "role": "user",
        "is_active": True,
        "auth_provider_id": "seed-user-001",
    },
    {
        "email": "user2@example.com",
        "display_name": "Demo User 2",
        "role": "user",
        "is_active": True,
        "auth_provider_id": "seed-user-002",
    },
]

SEED_ITEMS = [
    {
        "title": "Getting Started Guide",
        "description": "A sample item to demonstrate the CRUD pattern.",
        "is_published": True,
    },
    {
        "title": "Draft Document",
        "description": "An unpublished draft item.",
        "is_published": False,
    },
]

def run_alembic(*alembic_args: str) -> None:
    cmd = [sys.executable, "-m", "alembic", *alembic_args]
    print(f"$ {' '.join(cmd[2:])}")
    result = subprocess.run(cmd, cwd=BACKEND_DIR)
    if result.returncode != 0:
        raise SystemExit(f"alembic {' '.join(alembic_args)} failed ({result.returncode})")

async def do_seed():
    run_alembic("upgrade", "head")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        created_users = []
        for user_data in SEED_USERS:
            result = await db.execute(select(User).where(User.email == user_data["email"]))
            existing = result.scalar_one_or_none()
            if existing:
                created_users.append(existing)
                continue
            user = User(**user_data)
            db.add(user)
            await db.flush()
            created_users.append(user)
        admin_user = created_users[0] if created_users else None
        for item_data in SEED_ITEMS:
            result = await db.execute(select(Item).where(Item.title == item_data["title"]))
            if result.scalar_one_or_none(): continue
            item = Item(**item_data, owner_id=admin_user.id if admin_user else None)
            db.add(item)
        await db.commit()
    await engine.dispose()
    print("Seed complete.")
    await do_status()

def cmd_seed(args):
    asyncio.run(do_seed())

# ----- STATUS -----
async def do_status():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    tables = [("users", User), ("items", Item), ("agent_traces", AgentTrace)]
    try:
        async with session_factory() as db:
            print(f"\nDatabase: {settings.POSTGRES_DB} @ {settings.POSTGRES_SERVER}")
            for label, model in tables:
                count = await db.scalar(select(func.count()).select_from(model))
                print(f"  {label:<20} {count:>8,}")
    finally:
        await engine.dispose()

def cmd_status(args):
    asyncio.run(do_status())

# ----- RESET -----
async def do_reset_scoped():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    try:
        async with session_factory() as db, db.begin():
            await db.execute(delete(Item).where(Item.title.in_([i["title"] for i in SEED_ITEMS])))
            await db.execute(delete(User).where(User.email.in_([u["email"] for u in SEED_USERS])))
    finally:
        await engine.dispose()
    print("Scoped reset complete.")

def do_reset_hard(assume_yes: bool):
    if not assume_yes:
        answer = input(f"Type '{settings.POSTGRES_DB}' to drop everything: ")
        if answer.strip() != settings.POSTGRES_DB:
            raise SystemExit("Aborted.")
    run_alembic("downgrade", "base")
    run_alembic("upgrade", "head")
    print("Hard reset complete. Schema is empty.")

def cmd_reset(args):
    if args.hard:
        do_reset_hard(args.yes)
    else:
        asyncio.run(do_reset_scoped())

# ----- MAIN -----
def main():
    parser = argparse.ArgumentParser(prog="python -m scripts.db")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("seed").set_defaults(func=cmd_seed)
    sub.add_parser("status").set_defaults(func=cmd_status)
    p_reset = sub.add_parser("reset")
    p_reset.add_argument("--hard", action="store_true")
    p_reset.add_argument("--yes", action="store_true")
    p_reset.set_defaults(func=cmd_reset)
    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
