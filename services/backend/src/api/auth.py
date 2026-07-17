
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.security import create_token
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Dummy login for Hackathon.
    Provide any email. If it doesn't exist, it creates a User on the fly.
    Returns a JWT token.
    """
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user:
        # Auto-create user
        user = User(
            email=req.email,
            display_name=req.email.split("@")[0],
            role="user"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Generate dummy JWT token
    token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})

    return LoginResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role
        }
    )
