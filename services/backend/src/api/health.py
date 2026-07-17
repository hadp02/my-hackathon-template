from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.schemas.response import StandardResponse
from src.core.database import get_db
from src.core.limiter import limiter
import structlog

router = APIRouter()
logger = structlog.get_logger()

@router.get("/health", response_model=StandardResponse[dict])
@limiter.limit("5/minute")
async def health_check(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint for Docker/Dokploy.
    Verifies DB connection as well.
    """
    logger.info("Health check requested")
    try:
        # Simple DB ping
        await db.execute(text("SELECT 1"))
        return StandardResponse(
            success=True,
            message="Service is healthy",
            data={"database": "connected"}
        )
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return StandardResponse(
            success=False,
            message="Service is unhealthy",
            data={"database": "disconnected"}
        )
