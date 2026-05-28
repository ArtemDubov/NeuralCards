from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.shared_set import SharedSetAccess
from app.models.card_set import CardSet
from app.models.card import Card
from app.models.user import User


def share_set(db: Session, card_set_id: int, user_id: int, sharer_id: int, role: str = "editor") -> Optional[SharedSetAccess]:
    """Share a card set with another user."""
    # Check if already shared
    existing = db.query(SharedSetAccess).filter(
        SharedSetAccess.card_set_id == card_set_id,
        SharedSetAccess.user_id == user_id
    ).first()

    if existing:
        existing.role = role
        db.commit()
        db.refresh(existing)
        return existing

    access = SharedSetAccess(card_set_id=card_set_id, user_id=user_id, role=role)
    db.add(access)
    db.commit()
    db.refresh(access)
    return access


def get_shared_sets_for_user(db: Session, user_id: int) -> List[dict]:
    """Get all sets shared with a user."""
    shared = db.query(SharedSetAccess).filter(
        SharedSetAccess.user_id == user_id
    ).all()

    result = []
    for s in shared:
        card_set = db.query(CardSet).filter(CardSet.id == s.card_set_id).first()
        owner = db.query(User).filter(User.id == card_set.author_id).first() if card_set else None
        card_count = db.query(Card).filter(Card.card_set_id == s.card_set_id).count() if card_set else 0

        result.append({
            "id": s.id,
            "card_set_id": s.card_set_id,
            "user_id": s.user_id,
            "role": s.role,
            "created_at": s.created_at,
            "set_title": card_set.title if card_set else None,
            "set_description": card_set.description if card_set else None,
            "set_card_count": card_count,
            "owner_name": owner.name if owner else None,
        })

    return result


def get_shared_users(db: Session, card_set_id: int) -> List[dict]:
    """Get all users a set is shared with."""
    shared = db.query(SharedSetAccess).filter(
        SharedSetAccess.card_set_id == card_set_id
    ).all()

    result = []
    for s in shared:
        user = db.query(User).filter(User.id == s.user_id).first()
        result.append({
            "user_id": s.user_id,
            "user_name": user.name if user else None,
            "user_email": user.email if user else None,
            "role": s.role,
            "shared_at": s.created_at,
        })

    return result


def remove_access(db: Session, card_set_id: int, user_id: int) -> bool:
    """Remove shared access."""
    access = db.query(SharedSetAccess).filter(
        SharedSetAccess.card_set_id == card_set_id,
        SharedSetAccess.user_id == user_id
    ).first()

    if not access:
        return False

    db.delete(access)
    db.commit()
    return True


def can_access_set(db: Session, user_id: int, card_set_id: int) -> bool:
    """Check if user has access to a shared set."""
    # Owner always has access
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if card_set and card_set.author_id == user_id:
        return True

    # Check shared access
    access = db.query(SharedSetAccess).filter(
        SharedSetAccess.card_set_id == card_set_id,
        SharedSetAccess.user_id == user_id
    ).first()

    return access is not None
