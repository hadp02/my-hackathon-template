from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.config import settings

# Create the async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
    pool_size=10,
    max_overflow=20,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get a database session.
    Automatically closes the session after the request is finished.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # We don't auto-commit here to give endpoints explicit control,
            # but yielding within the context manager ensures it closes.
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
