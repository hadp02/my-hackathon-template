# How to Add a New CRUD Resource

This guide walks through adding a new business resource to the backend service.
The template provides a `CRUDService` base class and an example resource to copy from.

**Time: ~5 minutes per resource.**

## Step 1: Create the Model

Copy `services/backend/src/models/example.py` and modify:

```python
# services/backend/src/models/product.py

from sqlalchemy import Boolean, Column, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from src.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = "products"

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
```

## Step 2: Create Schemas

```python
# services/backend/src/schemas/product.py

from typing import Optional
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProductRead(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    price: Decimal
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    is_active: Optional[bool] = None
```

## Step 3: Create the Router

Copy `services/backend/src/api/example_resource.py` and modify:

```python
# services/backend/src/api/products.py

from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.crud import CRUDService
from src.core.deps import PaginationParams, get_current_user, get_db
from src.models.product import Product
from src.schemas.pagination import build_paginated_response
from src.schemas.response import StandardResponse
from src.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])
product_service = CRUDService[Product, ProductCreate, ProductUpdate](Product)


@router.get("/")
async def list_products(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
):
    items, total = await product_service.get_multi(db, page=pagination.page, page_size=pagination.page_size)
    return build_paginated_response(items, total, pagination.page, pagination.page_size, ProductRead)


@router.post("/", status_code=201)
async def create_product(
    payload: ProductCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db_obj = Product(**payload.model_dump(), owner_id=current_user.id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return StandardResponse(success=True, data=ProductRead.model_validate(db_obj))
```

## Step 4: Register the Router

Add to `services/backend/src/api/__init__.py`:

```python
from src.api.products import router as products_router
api_router.include_router(products_router)
```

## Step 5: Generate Migration

```bash
cd services/backend
alembic revision --autogenerate -m "add_products_table"
alembic upgrade head
```

## That's it!

Your new resource has:
- ✅ Full CRUD endpoints (list with pagination, get, create, update, delete)
- ✅ Auth-protected writes
- ✅ Standardized error responses
- ✅ Database migration
