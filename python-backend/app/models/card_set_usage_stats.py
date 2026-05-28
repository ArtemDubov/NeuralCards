from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class CardSetUsageStats(Base):
    """Статистика использования набора карточек."""

    __tablename__ = "card_set_usage_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_set_id = Column(Integer, ForeignKey("card_sets.id", ondelete="CASCADE"), nullable=False)

    # Счётчики
    total_sessions = Column(Integer, default=0)        # Всего сессий
    total_cards_reviewed = Column(Integer, default=0)  # Всего карточек пройдено
    total_correct = Column(Integer, default=0)         # Правильных ответов
    total_time = Column(Integer, default=0)            # Общее время в минутах

    # Даты
    first_used_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    user = relationship("User", back_populates="card_set_stats")
    card_set = relationship("CardSet")

    __table_args__ = (
        UniqueConstraint('user_id', 'card_set_id', name='uq_user_set_stats'),
    )
