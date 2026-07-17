"""
Example CRUD resource endpoints.

TEMPLATE: Copy this file as a starting point for new resources.
Replace Item with your business model and adjust schemas accordingly.

This demonstrates the full CRUD pattern using:
- ``CRUDService`` for database operations
- ``PaginationParams`` for list pagination
- ``get_current_user`` for auth-protected writes
- ``StandardResponse`` / ``PaginatedResponse`` for consistent responses
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.core.crud import CRUDService
from src.core.deps import PaginationParams, get_current_user, get_db
from src.core.exceptions import AppException
from src.models.example import Item
from src.models.user import User
from src.schemas.error_codes import ErrorCode
from src.schemas.pagination import build_paginated_response
from src.schemas.response import StandardResponse

logger = structlog.get_logger()

# --- Schemas (TEMPLATE: move to src/schemas/item.py for larger projects) ---


class ItemRead(BaseModel):
    """Item response schema."""

    id: UUID
    title: str
    description: Optional[str] = None
    is_published: bool
    owner_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ItemCreate(BaseModel):
    """Item creation payload."""

    title: str
    description: Optional[str] = None
    is_published: bool = False


class ItemUpdate(BaseModel):
    """Item update payload — only set fields are applied."""

    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None


# --- Service instance ---

item_service = CRUDService[Item, ItemCreate, ItemUpdate](Item)

# --- Router ---

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("/")
async def list_items(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """List items with pagination. Public endpoint."""
    items, total = await item_service.get_multi(
        db, page=pagination.page, page_size=pagination.page_size
    )
    return build_paginated_response(items, total, pagination.page, pagination.page_size, ItemRead)


@router.get("/{item_id}", response_model=StandardResponse[ItemRead])
async def get_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single item by ID."""
    item = await item_service.get(db, item_id)
    if item is None:
        raise AppException(
            status_code=404,
            error_code=ErrorCode.NOT_FOUND,
            message="Item not found",
        )
    return StandardResponse(success=True, data=ItemRead.model_validate(item))


@router.post("/", response_model=StandardResponse[ItemRead], status_code=201)
async def create_item(
    payload: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new item. Requires authentication."""
    # Attach owner
    db_obj = Item(**payload.model_dump(), owner_id=current_user.id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    logger.info("Item created", item_id=str(db_obj.id), owner_id=str(current_user.id))
    return StandardResponse(success=True, data=ItemRead.model_validate(db_obj), message="Item created")


@router.patch("/{item_id}", response_model=StandardResponse[ItemRead])
async def update_item(
    item_id: UUID,
    payload: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an item. Requires authentication."""
    updated = await item_service.update(db, item_id, payload)
    if updated is None:
        raise AppException(
            status_code=404,
            error_code=ErrorCode.NOT_FOUND,
            message="Item not found",
        )
    return StandardResponse(success=True, data=ItemRead.model_validate(updated), message="Item updated")


@router.delete("/{item_id}", response_model=StandardResponse)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an item. Requires authentication."""
    deleted = await item_service.delete(db, item_id)
    if not deleted:
        raise AppException(
            status_code=404,
            error_code=ErrorCode.NOT_FOUND,
            message="Item not found",
        )
    return StandardResponse(success=True, message="Item deleted")
