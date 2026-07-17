import asyncio
import structlog
import sys
from src.core.config import settings

# Initialize structlog
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger(__name__)

from src.ai.workers.evaluator import run_evaluator_loop

async def main():
    logger.info(
        "Starting background worker",
        service=settings.PROJECT_NAME,
        env=settings.ENVIRONMENT,
    )
    
    # Run the evaluator loop infinitely
    try:
        await run_evaluator_loop()
    except asyncio.CancelledError:
        logger.info("Worker gracefully shutting down")
    except Exception as e:
        logger.error("Worker failed", error=str(e))
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
