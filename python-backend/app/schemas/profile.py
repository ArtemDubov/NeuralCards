from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from typing import Optional


class UserProfileBase(BaseModel):
    """Базовая схема профиля."""
    bio: Optional[str] = None
    avatar_type: Optional[str] = "letter"
    avatar_emoji: Optional[str] = "👤"
    avatar_color: Optional[str] = "#667eea"
    avatar_url: Optional[str] = None
    last_avatar_emoji: Optional[str] = "👤"
    last_avatar_color: Optional[str] = "#667eea"
    language_preference: Optional[str] = "ru"
    dark_mode: Optional[bool] = False
    notifications_enabled: Optional[bool] = True
    theme: Optional[str] = "minimalism"
    custom_colors: Optional[dict] = None
    custom_fonts: Optional[dict] = None
    density: Optional[str] = "normal"

    @field_validator('avatar_type')
    @classmethod
    def validate_avatar_type(cls, v):
        """Нормализуем значение avatar_type."""
        if v is None:
            return "letter"
        v_lower = str(v).lower()
        if v_lower in ["letter", "emoji", "url"]:
            return v_lower
        return "letter"


class UserProfileUpdate(UserProfileBase):
    """Схема обновления профиля."""
    pass


class UserProfileResponse(UserProfileBase):
    """Схема ответа с профилем."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    total_cards_learned: int = 0
    total_training_time: int = 0  # в минутах
    current_streak: int = 0
    best_streak: int = 0
    last_training_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserWithProfile(BaseModel):
    """Пользователь с профилем."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    name: str
    created_at: datetime
    profile: Optional[UserProfileResponse] = None
