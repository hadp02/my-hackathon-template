"""
User model for authentication and profile management.

Maps to the ``users`` table.
"""

from sqlalchemy import Boolean, Column, String

from src.models.base import BaseModel


class User(BaseModel):
    """Application user."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    display_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(20), nullable=False, default="user")  # user | admin
    is_active = Column(Boolean, nullable=False, default=True)
