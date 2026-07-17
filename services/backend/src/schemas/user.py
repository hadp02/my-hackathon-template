"""
Pydantic schemas for User serialization and validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    """Full user profile returned by API."""

    id: UUID
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Fields that a user can update on their own profile."""

    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class CurrentUser(BaseModel):
    """Lightweight auth context — used in dependency injection."""

    id: UUID
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)
