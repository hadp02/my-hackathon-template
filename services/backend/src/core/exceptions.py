"""
Exception classes and global exception handlers.

All API errors are returned in the ``StandardResponse`` envelope format.
"""

from typing import Any, Optional

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import structlog

from src.schemas.error_codes import ErrorCode
from src.schemas.response import StandardResponse

logger = structlog.get_logger()


class AppException(Exception):
    """
    Application-level exception that maps to a StandardResponse.

    Usage::

        raise AppException(
            status_code=404,
            error_code=ErrorCode.NOT_FOUND,
            message="Item not found",
        )
    """

    def __init__(
        self,
        status_code: int,
        error_code: ErrorCode,
        message: str,
        data: Optional[Any] = None,
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.data = data
        super().__init__(message)


async def app_exception_handler(request: Request, exc: AppException):
    """Handle AppException with standardized JSON response."""
    logger.warning(
        "App exception",
        error_code=exc.error_code,
        message=exc.message,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(
            success=False,
            message=exc.message,
            error_code=exc.error_code,
            data=exc.data,
        ).model_dump(),
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle FastAPI HTTPException with standardized JSON response."""
    # Map common HTTP status codes to ErrorCode
    code_map = {
        400: ErrorCode.BAD_REQUEST,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        429: ErrorCode.RATE_LIMITED,
    }
    error_code = code_map.get(exc.status_code, ErrorCode.INTERNAL_ERROR)

    return JSONResponse(
        status_code=exc.status_code,
        content=StandardResponse(
            success=False,
            message=exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            error_code=error_code,
        ).model_dump(),
    )


async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to return a standardized JSON format.
    """
    logger.error("Unhandled server error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content=StandardResponse(
            success=False,
            message="Internal Server Error",
            error_code=ErrorCode.INTERNAL_ERROR,
        ).model_dump(),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors in a standard format.
    """
    logger.warning("Validation error", errors=exc.errors(), path=request.url.path)
    return JSONResponse(
        status_code=422,
        content=StandardResponse(
            success=False,
            message="Validation Error",
            error_code=ErrorCode.VALIDATION_ERROR,
            data=exc.errors(),
        ).model_dump(),
    )
