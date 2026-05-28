from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Message(Base):
    """Сообщение в чате между друзьями."""
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_sender_receiver", "sender_id", "receiver_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(String(256), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])