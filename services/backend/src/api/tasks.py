from fastapi import APIRouter, Depends, BackgroundTasks
import asyncio
import structlog

from src.core.deps import get_current_user
from src.models.user import User
from src.schemas.response import StandardResponse

logger = structlog.get_logger()
router = APIRouter(prefix="/tasks", tags=["Tasks"])

async def mock_ai_process(task_id: str, user_id: str):
    """
    A mock long-running task (e.g. calling an LLM or processing a document).
    In a real app, this might update a database record when finished.
    """
    logger.info("background_task_started", task_id=task_id, user_id=user_id)
    await asyncio.sleep(5)  # Simulate 5 seconds of work
    logger.info("background_task_completed", task_id=task_id, user_id=user_id)

@router.post("/run", response_model=StandardResponse, status_code=202)
async def run_background_task(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Triggers a long-running process in the background.
    Returns 202 Accepted immediately.
    """
    import uuid
    task_id = str(uuid.uuid4())
    
    # Add the function to the background tasks queue
    background_tasks.add_task(mock_ai_process, task_id, str(current_user.id))
    
    return StandardResponse(success=True, data={"task_id": task_id}, message="Task queued successfully")
