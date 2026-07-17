import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
import structlog
from src.core.config import settings

logger = structlog.get_logger()

class S3Storage:
    def __init__(self):
        self.bucket = settings.AWS_BUCKET_NAME
        # Use endpoint_url if provided (for MinIO or LocalStack)
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            endpoint_url=settings.AWS_ENDPOINT_URL
        )
        
    def upload_file(self, file: UploadFile, folder: str = "uploads") -> str:
        """
        Uploads a file to S3/MinIO and returns the unique object key.
        Because boto3 is synchronous, this should run in a threadpool in FastAPI.
        """
        extension = file.filename.split(".")[-1] if file.filename else "bin"
        file_key = f"{folder}/{uuid.uuid4().hex}.{extension}"
        
        try:
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket,
                file_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            return file_key
        except ClientError as e:
            logger.error("s3_upload_failed", error=str(e))
            raise e

    def get_presigned_url(self, file_key: str, expiration: int = 3600) -> str:
        """Generate a presigned URL to share an S3 object."""
        try:
            response = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": file_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logger.error("s3_presigned_url_failed", error=str(e))
            raise e

storage_client = S3Storage()
