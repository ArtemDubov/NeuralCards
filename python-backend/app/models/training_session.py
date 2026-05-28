from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class TrainingSession(Base):
    """Модель сессии тренировки."""

    __tablename__ = "training_sessions"
    __table_args__ = (
        Index("ix_training_sessions_user", "user_id"),
        Index("ix_training_sessions_user_set", "user_id", "card_set_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    card_set_id = Column(Integer, ForeignKey("card_sets.id"), nullable=True, index=True)
    mode = Column(String(50), nullable=False)  # practice, quiz, marathon, dictation, matching
    score = Column(Float, default=0.0)  # Процент правильных ответов
    correct_answers = Column(Integer, default=0)
    total_answers = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Связи
    user = relationship("User", back_populates="training_sessions")
    card_set = relationship("CardSet", back_populates="training_sessions")
