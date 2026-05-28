"""Модель избранного — универсальная для всех типов данных."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class Favorite(Base):
    """Модель избранного.

    Поддерживает любые типы данных через item_type + item_id.
    item_type: 'card_set', 'card', 'friend', 'training_mode' и т.д.
    """

    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "item_type", "item_id", name="uq_favorite_item"),
        Index("ix_favorites_user_type", "user_id", "item_type"),
        Index("ix_favorites_type_id", "item_type", "item_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False, index=True)
    item_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    user = relationship("User", back_populates="favorites")
