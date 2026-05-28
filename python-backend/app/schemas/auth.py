from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from app.schemas.profile import UserProfileResponse


class UserRegister(BaseModel):
    """Схема регистрации пользователя."""
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """Схема входа пользователя."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Схема ответа с токенами."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Схема ответа с данными пользователя."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    name: str
    created_at: datetime
    profile: Optional[UserProfileResponse] = None
