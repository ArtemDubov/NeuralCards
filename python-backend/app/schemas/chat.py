from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    receiver_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: Optional[datetime] = None
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True


class ChatConversation(BaseModel):
    user_id: int
    user_name: str
    avatar_type: Optional[str] = "letter"
    avatar_emoji: Optional[str] = "👤"
    avatar_color: Optional[str] = "#667eea"
    avatar_url: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
