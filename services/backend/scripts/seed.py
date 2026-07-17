"""
Database seeder script.

Creates initial admin user and sample data for development.
Run from services/backend/:

    python -m scripts.seed

Idempotent — safe to run multiple times.
"""

import asyncio
import sys
from pathlib import Path

# Add parent to path so we can import src.*
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import structlog

from src.core.config import settings
from src.models.base import Base
from src.models.user import User
from src.models.example import Item

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ]
)
logger = structlog.get_logger()


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


async def seed():
    """Run the database seeder."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)



    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Seed users
        created_users = []
        for user_data in SEED_USERS:
            result = await db.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                logger.info("User already exists, skipping", email=user_data["email"])
                created_users.append(existing)
                continue

            user = User(**user_data)
            db.add(user)
            await db.flush()
            created_users.append(user)
            logger.info("Created user", email=user_data["email"], role=user_data["role"])

        # Seed items (owned by admin)
        admin_user = created_users[0] if created_users else None
        for item_data in SEED_ITEMS:
            result = await db.execute(
                select(Item).where(Item.title == item_data["title"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                logger.info("Item already exists, skipping", title=item_data["title"])
                continue

            item = Item(**item_data, owner_id=admin_user.id if admin_user else None)
            db.add(item)
            logger.info("Created item", title=item_data["title"])

        await db.commit()

    await engine.dispose()
    logger.info("Seeding complete")


if __name__ == "__main__":
    asyncio.run(seed())
