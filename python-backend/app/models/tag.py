"""Модель тега для наборов карточек."""

from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

# Many-to-many связь между card_sets и tags
card_set_tags = Table(
    "card_set_tags",
    Base.metadata,
    Column("card_set_id", Integer, ForeignKey("card_sets.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    """Модель тега."""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)

    # Связи
    card_sets = relationship(
        "CardSet",
        secondary=card_set_tags,
        back_populates="tags",
    )
