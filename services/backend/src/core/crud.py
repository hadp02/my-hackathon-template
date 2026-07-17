"""
Generic CRUD service base class.

Subclass or instantiate directly to get standard database
operations with pagination and filtering support.

Usage::

    from src.core.crud import CRUDService
    from src.models.item import Item

    item_service = CRUDService(Item)
    items, total = await item_service.get_multi(db, page=1, page_size=20)
"""

from typing import Generic, List, Optional, Type, TypeVar
from uuid import UUID

import structlog
from pydantic import BaseModel as PydanticBaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.base import BaseModel

logger = structlog.get_logger()

ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=PydanticBaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=PydanticBaseModel)


class CRUDService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Generic CRUD operations for any SQLAlchemy model.

    Instantiate with a model class::

        service = CRUDService(MyModel)
    """

    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: UUID) -> Optional[ModelType]:
        """Get a single record by primary key."""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[dict] = None,
    ) -> tuple[List[ModelType], int]:
        """
        Get a paginated list of records with optional key-value filters.

        Returns:
            Tuple of (items, total_count).
        """
        query = select(self.model)
        count_query = select(func.count()).select_from(self.model)

        # Apply simple key-value filters
        if filters:
            for field_name, value in filters.items():
                column = getattr(self.model, field_name, None)
                if column is not None:
                    query = query.where(column == value)
                    count_query = count_query.where(column == value)

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(self.model.created_at.desc())

        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def create(self, db: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        """Create a new record from a Pydantic schema."""
        db_obj = self.model(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, id: UUID, obj_in: UpdateSchemaType
    ) -> Optional[ModelType]:
        """
        Update a record. Only non-None fields from ``obj_in`` are applied.
        Returns None if the record doesn't exist.
        """
        db_obj = await self.get(db, id)
        if db_obj is None:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, id: UUID) -> bool:
        """Delete a record by ID. Returns True if deleted, False if not found."""
        db_obj = await self.get(db, id)
        if db_obj is None:
            return False

        await db.delete(db_obj)
        await db.commit()
        return True
