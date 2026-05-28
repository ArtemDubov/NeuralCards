from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserProfile(Base):
    """Модель профиля пользователя (расширение User)."""

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Расширенная информация
    bio = Column(Text, nullable=True)  # О себе
    avatar_type = Column(String(20), default="letter")  # letter, emoji, url
    avatar_emoji = Column(String(50), default="👤")  # Выбранный эмодзи
    avatar_color = Column(String(20), default="#667eea")  # Цвет аватара
    avatar_url = Column(String(500), nullable=True)  # URL загруженного изображения
    
    # Сохраняем последние настройки для восстановления при удалении фото
    last_avatar_emoji = Column(String(50), default="👤")  # Последний выбранный эмодзи
    last_avatar_color = Column(String(20), default="#667eea")  # Последний выбранный цвет

    # Настройки
    language_preference = Column(String(10), default="ru")  # Предпочитаемый язык
    dark_mode = Column(Boolean, default=False)  # Тёмная тема
    notifications_enabled = Column(Boolean, default=True)  # Уведомления

    # Тема оформления
    theme = Column(String(50), default="minimalism")  # minimalism, game
    custom_colors = Column(Text, nullable=True)  # JSON с кастомными цветами
    custom_fonts = Column(Text, nullable=True)  # JSON с кастомными шрифтами
    density = Column(String(20), default="normal")  # compact, normal, spacious

    # Статистика (кэшированная для производительности)
    total_cards_learned = Column(Integer, default=0)  # Всего изучено карточек
    total_training_time = Column(Integer, default=0)  # Общее время тренировок (минуты)
    current_streak = Column(Integer, default=0)  # Текущая серия дней
    best_streak = Column(Integer, default=0)  # Лучшая серия дней
    last_training_date = Column(DateTime, nullable=True)  # Дата последней тренировки

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь (backref удалён, т.к. используется backref в User)
    user = relationship("User")
