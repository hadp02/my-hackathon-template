"""
User profile API endpoints.

Provides authenticated endpoints for viewing and updating
the current user's profile.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.core.deps import get_current_user, get_db
from src.models.user import User
from src.schemas.response import StandardResponse
from src.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])
logger = structlog.get_logger()


@router.get("/me", response_model=StandardResponse[UserRead])
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's profile."""
    return StandardResponse(
        success=True,
        data=UserRead.model_validate(current_user),
    )


@router.patch("/me", response_model=StandardResponse[UserRead])
async def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's profile fields."""
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return StandardResponse(
            success=True,
            data=UserRead.model_validate(current_user),
            message="No fields to update",
        )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    logger.info("User profile updated", user_id=str(current_user.id), fields=list(update_data.keys()))

    return StandardResponse(
        success=True,
        data=UserRead.model_validate(current_user),
        message="Profile updated",
    )
