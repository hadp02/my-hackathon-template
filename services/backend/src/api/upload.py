from fastapi import APIRouter, Depends, UploadFile, File
from starlette.concurrency import run_in_threadpool
import structlog

from src.core.deps import get_current_user
from src.core.exceptions import AppException
from src.core.storage import storage_client
from src.models.user import User
from src.schemas.response import StandardResponse
from src.schemas.error_codes import ErrorCode

logger = structlog.get_logger()
router = APIRouter(prefix="/upload", tags=["Uploads"])

@router.post("/", response_model=StandardResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file to S3/MinIO. 
    Runs the synchronous boto3 upload in a threadpool to prevent blocking the event loop.
    """
    if not file.filename:
        raise AppException(400, ErrorCode.VALIDATION_ERROR, "No filename provided")
        
    try:
        # Run synchronous boto3 code in a threadpool
        file_key = await run_in_threadpool(storage_client.upload_file, file, "hackathon")
        
        # Optionally generate a URL immediately
        url = await run_in_threadpool(storage_client.get_presigned_url, file_key)
        
        logger.info("file_uploaded", user_id=str(current_user.id), file_key=file_key)
        return StandardResponse(success=True, data={"file_key": file_key, "url": url}, message="File uploaded successfully")
    except Exception as e:
        logger.error("upload_endpoint_failed", error=str(e))
        raise AppException(500, ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload file")
