from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class FriendshipStatus(str, Enum):
    """Статусы дружбы."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    BLOCKED = "blocked"


class FriendshipBase(BaseModel):
    """Базовая схема дружбы."""
    status: FriendshipStatus = FriendshipStatus.PENDING


class FriendshipCreate(FriendshipBase):
    """Схема создания дружбы."""
    addressee_id: int


class FriendshipResponse(FriendshipBase):
    """Схема ответа с дружбой."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    requester_id: int
    addressee_id: int
    created_at: datetime
    updated_at: datetime


class FriendRequestResponse(FriendshipResponse):
    """Схема ответа с запросом дружбы и информацией о пользователе."""
    requester: Optional[dict] = None
    addressee: Optional[dict] = None


class FriendResponse(BaseModel):
    """Схема ответа с другом."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    avatar_color: Optional[str] = "#667eea"
    avatar_url: Optional[str] = None
    created_at: datetime
    friendship_id: int
    friendship_status: FriendshipStatus
    friendship_created_at: datetime


class UserSearchResult(BaseModel):
    """Результат поиска пользователей."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    avatar_color: Optional[str] = "#667eea"
    avatar_url: Optional[str] = None
    created_at: datetime
