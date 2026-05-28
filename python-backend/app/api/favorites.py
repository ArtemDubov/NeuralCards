"""API для работы с избранным."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.favorite import Favorite

router = APIRouter(prefix="/api/favorites", tags=["Избранное"])


# ===== Schemas =====

class FavoriteCreate(BaseModel):
    item_type: str  # 'card_set', 'card', 'friend', ...
    item_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    item_type: str
    item_id: int

    class Config:
        from_attributes = True


# ===== Endpoints =====

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_to_favorite(
    data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Добавить элемент в избранное."""
    # Проверка допустимых типов
    allowed_types = ["card_set", "card", "friend", "training_mode"]
    if data.item_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип. Разрешены: {', '.join(allowed_types)}",
        )

    # Проверка дубликата
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == data.item_type,
        Favorite.item_id == data.item_id,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Уже в избранном",
        )

    favorite = Favorite(
        user_id=current_user.id,
        item_type=data.item_type,
        item_id=data.item_id,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@router.delete("/{item_type}/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorite(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить элемент из избранного."""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
        Favorite.item_id == item_id,
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Не найдено в избранном",
        )

    db.delete(favorite)
    db.commit()


@router.get("/check/{item_type}/{item_id}")
def check_favorite(
    item_type: str,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Проверить, есть ли элемент в избранном."""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
        Favorite.item_id == item_id,
    ).first()

    return {"is_favorite": favorite is not None}


@router.get("/list/{item_type}", response_model=List[int])
def get_favorite_ids(
    item_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить ID всех избранных элементов указанного типа."""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
    ).all()

    return [f.item_id for f in favorites]
