from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services import chat_service, friends_service
from app.schemas.chat import MessageCreate, MessageResponse, ChatConversation

router = APIRouter(prefix="/api/chat", tags=["Чат"])


@router.post("", response_model=MessageResponse)
def send_message(
    msg_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отправить сообщение (только друзьям)."""
    if msg_data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя отправить себе")

    if not friends_service.is_friend(db, current_user.id, msg_data.receiver_id):
        raise HTTPException(status_code=403, detail="Сообщения можно отправлять только друзьям")

    if len(msg_data.content) > 256:
        raise HTTPException(status_code=400, detail="Максимум 256 символов")

    message = chat_service.send_message(
        db, current_user.id, msg_data.receiver_id, msg_data.content
    )

    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "is_read": message.is_read,
        "created_at": message.created_at,
        "sender_name": current_user.name,
    }


@router.get("/conversations", response_model=List[ChatConversation])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Список диалогов."""
    return chat_service.get_conversations(db, user_id=current_user.id)


@router.get("/{partner_id}")
def get_messages(
    partner_id: int,
    limit: int = Query(default=100, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """История сообщений с пользователем."""
    return chat_service.get_messages(db, current_user.id, partner_id, limit=limit)


@router.post("/{partner_id}/read")
def mark_all_read(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отметить все сообщения как прочитанные."""
    chat_service.mark_all_read(db, current_user.id, partner_id)
    return {"message": "Все сообщения отмечены как прочитанные"}


@router.get("/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Количество непрочитанных сообщений."""
    count = chat_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}
