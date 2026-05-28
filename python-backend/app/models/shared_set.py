from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class SharedSetAccess(Base):
    """Доступ к общему набору карточек."""
    __tablename__ = "shared_set_access"
    __table_args__ = (
        Index("ix_shared_set_access_user", "user_id"),
        Index("ix_shared_set_access_set", "card_set_id"),
        Index("ix_shared_set_access_both", "card_set_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    card_set_id = Column(Integer, ForeignKey("card_sets.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, default="editor")  # editor, viewer
    created_at = Column(DateTime, server_default=func.now())

    card_set = relationship("CardSet")
    user = relationship("User")
