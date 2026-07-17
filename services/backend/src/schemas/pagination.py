"""
Pagination schemas and utilities.

Provides ``PaginatedData`` for list endpoints and
``PaginationParams`` as a FastAPI dependency.
"""

import math
from typing import Generic, List, TypeVar

from pydantic import BaseModel

from src.schemas.response import StandardResponse

T = TypeVar("T")


class PaginatedData(BaseModel, Generic[T]):
    """Paginated list payload."""

    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginatedResponse(StandardResponse[PaginatedData[T]], Generic[T]):
    """StandardResponse wrapping paginated data."""
    # Inherits fields directly from StandardResponse


def build_paginated_response(
    items: list,
    total: int,
    page: int,
    page_size: int,
    item_schema,
) -> PaginatedResponse:
    """
    Helper to build a PaginatedResponse from raw query results.

    Args:
        items: List of SQLAlchemy model instances.
        total: Total record count (before pagination).
        page: Current page number.
        page_size: Items per page.
        item_schema: Pydantic model class to serialize each item.
    """
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    serialized = [item_schema.model_validate(item) for item in items]

    return PaginatedResponse(
        success=True,
        data=PaginatedData(
            items=serialized,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        ),
    )
