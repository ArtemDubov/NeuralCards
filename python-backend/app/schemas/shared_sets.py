from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SharedSetCreate(BaseModel):
    card_set_id: int
    user_id: int
    role: str = "editor"


class SharedSetResponse(BaseModel):
    id: int
    card_set_id: int
    user_id: int
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SharedSetWithDetails(BaseModel):
    id: int
    card_set_id: int
    user_id: int
    role: str
    created_at: Optional[datetime] = None
    set_title: Optional[str] = None
    set_description: Optional[str] = None
    set_card_count: Optional[int] = None
    owner_name: Optional[str] = None

    class Config:
        from_attributes = True
