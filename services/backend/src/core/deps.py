"""
Consolidated FastAPI dependencies.

Import all reusable dependencies from here to keep endpoint files clean.
"""

from fastapi import Query

from src.core.database import get_db  # noqa: F401 — re-export
from src.core.security import get_current_user, optional_auth  # noqa: F401 — re-export


class PaginationParams:
    """
    FastAPI dependency for pagination query parameters.

    Usage::

        @router.get("/items")
        async def list_items(pagination: PaginationParams = Depends()):
            ...
    """

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.page_size = page_size
