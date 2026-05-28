from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Table, Index
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.tag import card_set_tags


class CardSet(Base):
    """Модель набора карточек."""

    __tablename__ = "card_sets"
    __table_args__ = (
        Index("ix_card_sets_official", "is_official"),
        Index("ix_card_sets_author", "author_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(64), nullable=True)
    is_public = Column(Boolean, default=True)
    is_official = Column(Boolean, default=False, index=True)  # Готовые наборы от разработчиков
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    author = relationship("User", back_populates="card_sets")
    cards = relationship("Card", back_populates="card_set", cascade="all, delete-orphan")
    training_sessions = relationship("TrainingSession", back_populates="card_set")
    tags = relationship(
        "Tag",
        secondary=card_set_tags,
        back_populates="card_sets",
        cascade="all, delete",
        lazy="joined",
    )
