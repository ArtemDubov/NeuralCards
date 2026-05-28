from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict
from datetime import datetime
from app.models.message import Message
from app.models.user import User

MAX_MESSAGES_IN_CHAT = 100
MAX_CONTENT_LENGTH = 256


def send_message(db: Session, sender_id: int, receiver_id: int, content: str) -> Message:
    """Отправить сообщение. Удаляет старые если превышен лимит."""
    # Обрезаем контент
    content = content[:MAX_CONTENT_LENGTH]

    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
    )
    db.add(message)
    db.flush()  # получаем ID

    # Удаляем старые сообщения если превышен лимит
    _trim_old_messages(db, sender_id, receiver_id)

    db.commit()
    db.refresh(message)
    return message


def _trim_old_messages(db: Session, sender_id: int, receiver_id: int):
    """Оставить только MAX_MESSAGES_IN_CHAT последних сообщений."""
    all_msgs = db.query(Message.id).filter(
        (
            (Message.sender_id == sender_id) & (Message.receiver_id == receiver_id)
        ) | (
            (Message.sender_id == receiver_id) & (Message.receiver_id == sender_id)
        )
    ).order_by(Message.created_at.desc()).all()

    if len(all_msgs) > MAX_MESSAGES_IN_CHAT:
        ids_to_delete = [m.id for m in all_msgs[MAX_MESSAGES_IN_CHAT:]]
        db.query(Message).filter(Message.id.in_(ids_to_delete)).delete(synchronize_session=False)
        db.commit()


def get_conversations(db: Session, user_id: int) -> List[dict]:
    """Получить список диалогов. Batch-fetch пользователей для избежания N+1."""
    from app.models.user_profile import UserProfile
    
    messages = db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.created_at.desc()).all()

    # Собираем все уникальные partner_id
    partner_ids = set()
    for msg in messages:
        partner_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        partner_ids.add(partner_id)

    # Один batch-запрос для пользователей
    users = db.query(User).filter(User.id.in_(partner_ids)).all()
    user_map = {u.id: u.name for u in users}
    
    # Принудительно обновляем session чтобы получить свежие данные из БД
    db.expire_all()
    
    # Один batch-запрос для профилей
    profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(partner_ids)).all()
    profile_map = {p.user_id: p for p in profiles}
    
    print(f"[CHAT SERVICE] Found {len(profiles)} profiles for {len(partner_ids)} partners")
    for p in profiles:
        print(f"[CHAT SERVICE] Profile user_id={p.user_id}: type={p.avatar_type}, emoji={p.avatar_emoji}, color={p.avatar_color}")

    conversations = {}
    for msg in messages:
        partner_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id

        if partner_id not in conversations:
            profile = profile_map.get(partner_id)
            conversations[partner_id] = {
                "user_id": partner_id,
                "user_name": user_map.get(partner_id, "Unknown"),
                "avatar_type": profile.avatar_type if profile and profile.avatar_type else "letter",
                "avatar_emoji": profile.avatar_emoji if profile and profile.avatar_emoji else "👤",
                "avatar_color": profile.avatar_color if profile and profile.avatar_color else "#667eea",
                "avatar_url": profile.avatar_url if profile else None,
                "last_message": msg.content,
                "last_message_at": msg.created_at,
                "unread_count": 0,
            }

        if msg.receiver_id == user_id and not msg.is_read:
            conversations[partner_id]["unread_count"] += 1

    return sorted(conversations.values(), key=lambda x: x["last_message_at"] or datetime(1970, 1, 1), reverse=True)


def _serialize_message(msg, current_user_id, user_cache: dict = None) -> dict:
    """Сериализовать сообщение в dict. user_cache — dict {id: name} для избежания доп. запросов."""
    sender = msg.sender
    sender_name = sender.name if sender else (user_cache.get(msg.sender_id, "Unknown") if user_cache else "Unknown")

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "sender_name": sender_name,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


def get_messages(db: Session, user_id: int, partner_id: int, limit: int = 100) -> List[dict]:
    """Получить историю сообщений."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        messages = db.query(Message).options(
            joinedload(Message.sender),
        ).filter(
            (
                (Message.sender_id == user_id) & (Message.receiver_id == partner_id)
            ) | (
                (Message.sender_id == partner_id) & (Message.receiver_id == user_id)
            )
        ).order_by(Message.created_at.desc()).limit(limit).all()

        for msg in messages:
            if msg.receiver_id == user_id and not msg.is_read:
                msg.is_read = True

        db.commit()

        result = []
        for msg in reversed(messages):
            result.append(_serialize_message(msg, user_id))

        return result
    except Exception as e:
        logger.error(f"Failed to get messages for users {user_id} and {partner_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ошибка загрузки сообщений"
        )


def mark_all_read(db: Session, user_id: int, partner_id: int):
    """Отметить все сообщения как прочитанные."""
    db.query(Message).filter(
        Message.sender_id == partner_id,
        Message.receiver_id == user_id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()


def get_unread_count(db: Session, user_id: int) -> int:
    """Получить количество непрочитанных сообщений для пользователя."""
    count = db.query(Message).filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).count()
    return count


def delete_message(db: Session, user_id: int, message_id: int) -> bool:
    """Удалить сообщение. Только автор может удалить."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        return False
    
    # Проверяем что пользователь - автор сообщения
    if msg.sender_id != user_id:
        return False
    
    db.delete(msg)
    db.commit()
    return True

