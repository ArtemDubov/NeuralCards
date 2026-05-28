from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class GuestSession(Base):
    """Модель сессии гостя."""
    
    __tablename__ = "guest_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(255), unique=True, nullable=False)
    card_set_id = Column(Integer, ForeignKey("card_sets.id"), nullable=False)
    mode = Column(String(50), nullable=False)
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Связь
    card_set = relationship("CardSet")
