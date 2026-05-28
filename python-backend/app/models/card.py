from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class Card(Base):
    """Модель карточки с поддержкой медиа."""

    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    card_set_id = Column(Integer, ForeignKey("card_sets.id"), nullable=False)
    position = Column(Integer, default=0)  # Позиция карточки в наборе (для drag & drop)

    # Текст
    front = Column(String(256), nullable=False)  # Лицевая сторона (вопрос)
    back = Column(String(256), nullable=False)   # Обратная сторона (ответ)

    # Языки сторон
    front_lang = Column(String(10), default="ru")  # Язык лицевой стороны
    back_lang = Column(String(10), default="ru")   # Язык обратной стороны

    # Медиа для лицевой стороны (front)
    front_image = Column(String(512), nullable=True)  # Путь к изображению
    front_audio = Column(String(512), nullable=True)  # Путь к аудио
    front_video = Column(String(512), nullable=True)  # Путь к видео
    
    # Медиа для обратной стороны (back)
    back_image = Column(String(512), nullable=True)   # Путь к изображению
    back_audio = Column(String(512), nullable=True)   # Путь к аудио
    back_video = Column(String(512), nullable=True)   # Путь к видео

    # Настройки воспроизведения
    auto_play_enabled = Column(Boolean, default=False)
    play_front = Column(Boolean, default=True)
    play_back = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    card_set = relationship("CardSet", back_populates="cards")
