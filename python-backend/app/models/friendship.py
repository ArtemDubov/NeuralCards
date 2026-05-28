from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class FriendshipStatus(enum.Enum):
    """Статусы дружбы."""
    PENDING = "pending"      # Запрос отправлен
    ACCEPTED = "accepted"    # Друзья
    REJECTED = "rejected"    # Отклонено
    BLOCKED = "blocked"      # Заблокировано


class Friendship(Base):
    """Модель дружбы между пользователями."""

    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    
    # Пользователь, который отправил запрос
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Пользователь, которому отправлен запрос
    addressee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Статус дружбы
    status = Column(SQLEnum(FriendshipStatus), default=FriendshipStatus.PENDING, nullable=False)
    
    # Дата создания и обновления
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Уникальное ограничение на пару пользователей
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friendship_pair"),
    )
    
    # Связи
    requester = relationship("User", foreign_keys=[requester_id], backref="friendships_sent")
    addressee = relationship("User", foreign_keys=[addressee_id], backref="friendships_received")
