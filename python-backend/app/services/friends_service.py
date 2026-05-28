from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional

from app.models.friendship import Friendship, FriendshipStatus
from app.models.user import User


def send_friend_request(db: Session, requester_id: int, addressee_id: int) -> Friendship:
    """Отправить запрос в друзья."""
    # Проверяем, не существует ли уже запрос
    existing = db.query(Friendship).filter(
        ((Friendship.requester_id == requester_id) & (Friendship.addressee_id == addressee_id)) |
        ((Friendship.requester_id == addressee_id) & (Friendship.addressee_id == requester_id))
    ).first()
    
    if existing:
        raise ValueError("Запрос дружбы уже существует")
    
    # Проверяем, что пользователь не добавляет сам себя
    if requester_id == addressee_id:
        raise ValueError("Нельзя добавить себя в друзья")
    
    # Создаём новый запрос
    friendship = Friendship(
        requester_id=requester_id,
        addressee_id=addressee_id,
        status=FriendshipStatus.PENDING
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    
    return friendship


def accept_friend_request(db: Session, friendship_id: int, user_id: int) -> Friendship:
    """Принять запрос в друзья."""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.addressee_id == user_id
    ).first()
    
    if not friendship:
        raise ValueError("Запрос дружбы не найден")
    
    if friendship.status != FriendshipStatus.PENDING:
        raise ValueError("Запрос дружбы уже обработан")
    
    friendship.status = FriendshipStatus.ACCEPTED
    db.commit()
    db.refresh(friendship)
    
    return friendship


def reject_friend_request(db: Session, friendship_id: int, user_id: int) -> Friendship:
    """Отклонить запрос в друзья."""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.addressee_id == user_id
    ).first()
    
    if not friendship:
        raise ValueError("Запрос дружбы не найден")
    
    if friendship.status != FriendshipStatus.PENDING:
        raise ValueError("Запрос дружбы уже обработан")
    
    friendship.status = FriendshipStatus.REJECTED
    db.commit()
    db.refresh(friendship)
    
    return friendship


def cancel_friend_request(db: Session, friendship_id: int, user_id: int) -> bool:
    """Отменить отправленный запрос в друзья."""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.requester_id == user_id
    ).first()
    
    if not friendship:
        raise ValueError("Запрос дружбы не найден")
    
    if friendship.status != FriendshipStatus.PENDING:
        raise ValueError("Нельзя отменить обработанный запрос")
    
    db.delete(friendship)
    db.commit()
    
    return True


def remove_friend(db: Session, user_id: int, friend_id: int) -> bool:
    """Удалить друга."""
    friendship = db.query(Friendship).filter(
        Friendship.status == FriendshipStatus.ACCEPTED,
        or_(
            (Friendship.requester_id == user_id) & (Friendship.addressee_id == friend_id),
            (Friendship.requester_id == friend_id) & (Friendship.addressee_id == user_id)
        )
    ).first()
    
    if not friendship:
        raise ValueError("Дружба не найдена")
    
    db.delete(friendship)
    db.commit()
    
    return True


def block_friend(db: Session, user_id: int, friend_id: int) -> Friendship:
    """Заблокировать пользователя."""
    friendship = db.query(Friendship).filter(
        or_(
            (Friendship.requester_id == user_id) & (Friendship.addressee_id == friend_id),
            (Friendship.requester_id == friend_id) & (Friendship.addressee_id == user_id)
        )
    ).first()
    
    if not friendship:
        # Если дружбы не было, создаём блокировку
        friendship = Friendship(
            requester_id=user_id,
            addressee_id=friend_id,
            status=FriendshipStatus.BLOCKED
        )
        db.add(friendship)
    else:
        friendship.status = FriendshipStatus.BLOCKED
    
    db.commit()
    db.refresh(friendship)
    
    return friendship


def get_friends(db: Session, user_id: int) -> List[Friendship]:
    """Получить список друзей."""
    friendships = db.query(Friendship).filter(
        Friendship.status == FriendshipStatus.ACCEPTED,
        or_(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == user_id
        )
    ).options(
        joinedload(Friendship.requester),
        joinedload(Friendship.addressee)
    ).all()
    
    return friendships


def get_friend_requests(db: Session, user_id: int) -> List[Friendship]:
    """Получить входящие запросы в друзья."""
    requests = db.query(Friendship).filter(
        Friendship.status == FriendshipStatus.PENDING,
        Friendship.addressee_id == user_id
    ).options(
        joinedload(Friendship.requester)
    ).all()
    
    return requests


def get_sent_requests(db: Session, user_id: int) -> List[Friendship]:
    """Получить отправленные запросы в друзья."""
    requests = db.query(Friendship).filter(
        Friendship.status == FriendshipStatus.PENDING,
        Friendship.requester_id == user_id
    ).options(
        joinedload(Friendship.addressee)
    ).all()
    
    return requests


def search_users(db: Session, query: str, current_user_id: int, limit: int = 20) -> List[User]:
    """Поиск пользователей по email или имени."""
    from app.models.user_profile import UserProfile
    
    search_pattern = f"%{query}%"
    
    print(f"[SEARCH] Query: '{query}', Pattern: '{search_pattern}', Current User ID: {current_user_id}")
    
    # Исключаем текущего пользователя и системные аккаунты
    users = db.query(User).filter(
        User.id != current_user_id,
        User.email.notlike("%@system.local"),  # Исключаем системных пользователей
        User.email.notlike("test%@%"),  # Исключаем тестовых пользователей
        or_(
            User.name.ilike(search_pattern),
            User.email.ilike(search_pattern)
        )
    ).limit(limit).all()
    
    print(f"[SEARCH] Found {len(users)} users: {[u.name for u in users]}")
    
    return users


def is_friend(db: Session, user_id: int, other_user_id: int) -> bool:
    """Проверить, являются ли пользователи друзьями."""
    friendship = db.query(Friendship).filter(
        Friendship.status == FriendshipStatus.ACCEPTED,
        or_(
            (Friendship.requester_id == user_id) & (Friendship.addressee_id == other_user_id),
            (Friendship.requester_id == other_user_id) & (Friendship.addressee_id == user_id)
        )
    ).first()
    
    return friendship is not None
