from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.card import Card
from app.schemas.card_set import (
    CardSetCreate,
    CardSetUpdate,
    CardSetResponse,
    CardCreate,
    CardUpdate,
    CardResponse,
    CardReorder,
    CardSetWithCount,
    CardSetDetail,
)
from app.services.import_export_service import MAX_CARDS_PER_SET
from app.services import card_service

router = APIRouter(prefix="/api/card-sets", tags=["Наборы карточек"])


# ===== CardSet Endpoints =====

@router.post("", response_model=CardSetResponse, status_code=status.HTTP_201_CREATED)
def create_card_set(
    card_set_data: CardSetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание нового набора карточек."""
    return card_service.create_card_set(
        db=db,
        title=card_set_data.title,
        description=card_set_data.description,
        is_public=card_set_data.is_public,
        author_id=current_user.id,
        tag_names=card_set_data.tags or []
    )


@router.get("", response_model=List[CardSetResponse])
def get_card_sets(
    include_public: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение всех наборов (мои + публичные)."""
    return card_service.get_card_sets(db, user_id=current_user.id, include_public=include_public)


@router.get("/{card_set_id}", response_model=CardSetResponse)
def get_card_set(
    card_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение набора по ID."""
    return card_service.get_card_set(db, card_set_id=card_set_id, user_id=current_user.id)


@router.put("/{card_set_id}", response_model=CardSetResponse)
def update_card_set(
    card_set_id: int,
    card_set_data: CardSetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление набора."""
    return card_service.update_card_set(
        db=db,
        card_set_id=card_set_id,
        title=card_set_data.title,
        description=card_set_data.description,
        is_public=card_set_data.is_public,
        tag_names=card_set_data.tags,
        user_id=current_user.id
    )


@router.delete("/{card_set_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card_set(
    card_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление набора."""
    card_service.delete_card_set(db, card_set_id=card_set_id, user_id=current_user.id)


@router.post("/{card_set_id}/copy", response_model=CardSetResponse, status_code=status.HTTP_201_CREATED)
def copy_card_set(
    card_set_id: int,
    new_title: Optional[str] = Body(None, embed=True),
    is_public: Optional[bool] = Body(None, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Копировать набор (свой или чужой) к себе."""
    new_set = card_service.copy_card_set(
        db=db,
        card_set_id=card_set_id,
        user_id=current_user.id,
        new_title=new_title,
        is_public=is_public,
    )
    return new_set


# ===== Card Endpoints =====

@router.get("/{card_set_id}/cards", response_model=List[CardResponse])
def get_cards(
    card_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение всех карточек набора."""
    return card_service.get_cards(db, card_set_id=card_set_id, user_id=current_user.id)


@router.post("/{card_set_id}/cards", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    card_set_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание карточки в наборе."""
    # Проверка лимита
    existing = db.query(Card).filter(Card.card_set_id == card_set_id).count()
    if existing >= MAX_CARDS_PER_SET:
        raise HTTPException(status_code=400, detail=f"Достигнут лимит: {MAX_CARDS_PER_SET} карточек на набор")
    return card_service.create_card(
        db=db,
        card_set_id=card_set_id,
        front=card_data.front,
        back=card_data.back,
        position=card_data.position,
        # Языки
        front_lang=card_data.front_lang,
        back_lang=card_data.back_lang,
        # Медиа
        front_image=card_data.front_image,
        front_audio=card_data.front_audio,
        front_video=card_data.front_video,
        back_image=card_data.back_image,
        back_audio=card_data.back_audio,
        back_video=card_data.back_video,
        # Настройки
        auto_play_enabled=card_data.auto_play_enabled,
        play_front=card_data.play_front,
        play_back=card_data.play_back,
        user_id=current_user.id
    )


@router.post("/{card_set_id}/cards/batch", response_model=List[CardResponse], status_code=status.HTTP_201_CREATED)
def create_cards_batch(
    card_set_id: int,
    cards_data: List[CardCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Массовое создание карточек."""
    # Проверка лимита
    existing = db.query(Card).filter(Card.card_set_id == card_set_id).count()
    if existing + len(cards_data) > MAX_CARDS_PER_SET:
        raise HTTPException(
            status_code=400,
            detail=f"Лимит: {MAX_CARDS_PER_SET} карточек. Сейчас {existing}, хотите добавить {len(cards_data)}. Доступно: {MAX_CARDS_PER_SET - existing}"
        )
    cards = [card.model_dump() for card in cards_data]
    return card_service.create_cards_batch(
        db=db,
        card_set_id=card_set_id,
        cards_data=cards,
        user_id=current_user.id
    )


@router.post("/{card_set_id}/cards/reorder")
def reorder_cards(
    card_set_id: int,
    reorder_data: CardReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Переупорядочить карточки в наборе (drag & drop)."""
    card_service.reorder_cards(
        db=db,
        card_set_id=card_set_id,
        user_id=current_user.id,
        card_ids=reorder_data.card_ids
    )
    return {"ok": True, "message": "Карточки переупорядочены"}


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_data: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление карточки."""
    return card_service.update_card(
        db=db,
        card_id=card_id,
        front=card_data.front,
        back=card_data.back,
        # Языки
        front_lang=card_data.front_lang,
        back_lang=card_data.back_lang,
        # Медиа
        front_image=card_data.front_image,
        front_audio=card_data.front_audio,
        front_video=card_data.front_video,
        back_image=card_data.back_image,
        back_audio=card_data.back_audio,
        back_video=card_data.back_video,
        # Настройки
        auto_play_enabled=card_data.auto_play_enabled,
        play_front=card_data.play_front,
        play_back=card_data.play_back,
        user_id=current_user.id
    )


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление карточки."""
    card_service.delete_card(db, card_id=card_id, user_id=current_user.id)


@router.get("/official/list", response_model=List[CardSetWithCount])
def get_official_sets(
    db: Session = Depends(get_db),
):
    """Получение готовых наборов от разработчиков (is_official=True). Доступно без авторизации."""
    from app.models.card_set import CardSet
    from app.models.card import Card
    from sqlalchemy import func

    sets = db.query(CardSet).filter(
        CardSet.is_official == True
    ).all()

    result = []
    for card_set in sets:
        count = db.query(func.count(Card.id)).filter(
            Card.card_set_id == card_set.id
        ).scalar()
        result.append(CardSetWithCount(
            id=card_set.id,
            title=card_set.title,
            description=card_set.description,
            author_id=card_set.author_id,
            is_public=card_set.is_public,
            is_official=True,
            cards_count=count,
            created_at=card_set.created_at,
            updated_at=card_set.updated_at,
            tags=card_set.tags or [],
        ))

    return result
