import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from pydantic import BaseModel
from app.core.database import get_db
from app.models.guest_session import GuestSession
from app.models.card_set import CardSet
from app.models.card import Card
from app.schemas.guest import GuestSessionCreate, GuestSessionResponse
from app.services.card_service import get_cards

router = APIRouter(prefix="/api/guest", tags=["Режим гостя"])


class GuestPracticeRequest(BaseModel):
    card_set_id: int


@router.post("/practice", response_model=dict)
def guest_practice(
    body: GuestPracticeRequest,
    db: Session = Depends(get_db)
):
    """Начало практики для гостя. Возвращает карточки набора без авторизации."""
    card_set = db.query(CardSet).filter(CardSet.id == body.card_set_id).first()
    if not card_set:
        raise HTTPException(status_code=404, detail="Набор не найден")

    cards = db.query(Card).filter(
        Card.card_set_id == body.card_set_id
    ).order_by(Card.position.asc()).all()

    if not cards:
        raise HTTPException(status_code=404, detail="Нет карточек в наборе")

    return {
        "session_id": body.card_set_id,
        "cards": [
            {
                "id": card.id,
                "front": card.front,
                "back": card.back,
                "front_image": card.front_image,
                "front_audio": card.front_audio,
                "front_video": card.front_video,
                "back_image": card.back_image,
                "back_audio": card.back_audio,
                "back_video": card.back_video,
            }
            for card in cards
        ],
        "total": len(cards),
    }


@router.get("/sets", response_model=List[dict])
def get_guest_sets(db: Session = Depends(get_db)):
    """Получение публичных наборов для гостя."""
    sets = db.query(CardSet).filter(CardSet.is_public == True).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "cards_count": len(s.cards)
        }
        for s in sets
    ]


@router.get("/sets/{card_set_id}", response_model=dict)
def get_guest_set(card_set_id: int, db: Session = Depends(get_db)):
    """Получение набора по ID для гостя."""
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not card_set:
        raise HTTPException(status_code=404, detail="Набор не найден")
    
    return {
        "id": card_set.id,
        "title": card_set.title,
        "description": card_set.description,
        "cards": [
            {"id": c.id, "front": c.front, "back": c.back}
            for c in card_set.cards
        ]
    }


@router.post("/sessions", response_model=dict)
def create_guest_session(
    session_data: GuestSessionCreate,
    db: Session = Depends(get_db)
):
    """Создание сессии для гостя."""
    session_token = str(uuid.uuid4())
    
    session = GuestSession(
        session_token=session_token,
        card_set_id=session_data.card_set_id,
        mode=session_data.mode
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "session_token": session_token,
        "card_set_id": session.card_set_id,
        "mode": session.mode
    }


@router.post("/sessions/{session_id}/complete")
def complete_guest_session(
    session_id: int,
    score: int,
    db: Session = Depends(get_db)
):
    """Завершение сессии гостя с результатом."""
    session = db.query(GuestSession).filter(GuestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    
    session.score = score
    db.commit()
    
    return {"message": "Сессия завершена", "score": score}
