from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Literal

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.card_set import CardSet
from app.services import shared_sets_service

router = APIRouter(prefix="/api/shared-sets", tags=["Общие наборы"])

VALID_ROLES = {"editor", "viewer"}


@router.post("")
def share_set(
    card_set_id: int,
    user_id: int,
    role: str = "editor",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Поделиться набором с другим пользователем."""
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимая роль: {role}. Разрешены: {', '.join(VALID_ROLES)}"
        )
    # Check ownership
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not card_set or card_set.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав на этот набор")
    
    # Can't share with yourself
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя поделиться с собой")
    
    result = shared_sets_service.share_set(db, card_set_id, user_id, current_user.id, role)
    return result


@router.get("/shared-with-me")
def get_shared_with_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Наборы, которыми поделились со мной."""
    return shared_sets_service.get_shared_sets_for_user(db, user_id=current_user.id)


@router.get("/{card_set_id}/users")
def get_shared_users(
    card_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Пользователи, с которыми поделен набор."""
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not card_set or card_set.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав")
    
    return shared_sets_service.get_shared_users(db, card_set_id)


@router.delete("/{card_set_id}/users/{user_id}")
def remove_access(
    card_set_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Убрать доступ пользователя к набору."""
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not card_set or card_set.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав")
    
    success = shared_sets_service.remove_access(db, card_set_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Доступ не найден")
    return {"message": "Доступ удалён"}
