"""
Example Item model for template demonstration.

TEMPLATE: Replace this model with your business domain model.
This file shows the standard pattern for creating a new SQLAlchemy model.
"""

from sqlalchemy import Boolean, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from src.models.base import BaseModel


class Item(BaseModel):
    """
    Example domain model.

    TEMPLATE: Rename and modify this model for your use case.
    """

    __tablename__ = "items"

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, nullable=False, default=False)
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
