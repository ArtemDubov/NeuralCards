from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.card import Card
from app.schemas.training import (
    TrainingSessionCreate,
    TrainingSessionResponse,
    AnswerSubmit,
    TrainingResult,
    PracticeAnswer,
    MarathonAnswer,
    MarathonSessionCreate,
    DictationAnswer,
    MatchingAnswer,
    MatchingSessionCreate,
    SessionComplete,
)
from app.services import training_service
from app.services.card_service import get_cards

router = APIRouter(prefix="/api/training", tags=["Тренировки"])


@router.post("/sessions", response_model=TrainingSessionResponse)
def create_session(
    session_data: TrainingSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание новой сессии тренировки."""
    return training_service.create_training_session(
        db=db,
        user_id=current_user.id,
        card_set_id=session_data.card_set_id,
        mode=session_data.mode
    )


@router.get("/sessions/{session_id}", response_model=TrainingSessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение сессии по ID."""
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    return session


@router.post("/sessions/{session_id}/answer", response_model=TrainingSessionResponse)
def submit_answer(
    session_id: int,
    answer_data: AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отправка ответа в сессии."""
    return training_service.submit_answer(
        db=db,
        session_id=session_id,
        is_correct=answer_data.is_correct
    )


@router.post("/sessions/{session_id}/complete", response_model=TrainingResult)
def complete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Завершение сессии тренировки."""
    session = training_service.complete_session(db=db, session_id=session_id)
    return {
        "session_id": session.id,
        "score": session.score,
        "correct_answers": session.correct_answers,
        "total_answers": session.total_answers,
        "completed_at": session.completed_at
    }


# ===== Practice Mode (режим запоминания) =====

class PracticeSessionRequest(BaseModel):
    card_set_id: int


@router.post("/practice/sessions")
def create_practice_session(
    body: PracticeSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание сессии практики. Возвращает карточки набора."""
    cards = get_cards(db, body.card_set_id, user_id=current_user.id)
    if not cards:
        raise HTTPException(status_code=404, detail="Нет карточек в наборе")

    return {
        "session_id": body.card_set_id,
        "cards": [
            {
                "id": card.id,
                "front": card.front,
                "back": card.back,
                "front_lang": card.front_lang,
                "back_lang": card.back_lang,
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


@router.post("/practice/{session_id}/answer")
def submit_practice_answer(
    session_id: int,
    body: PracticeAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отправка ответа в практике. knew=True → карточка уходит, knew=False → возвращается."""
    card_id = body.card_id
    knew = body.knew
    # Находим сессию тренировки
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    # Обновляем статистику сессии
    session.total_answers = (session.total_answers or 0) + 1
    if knew:
        session.correct_answers = (session.correct_answers or 0) + 1

    # Пересчитываем score
    if session.total_answers and session.total_answers > 0:
        correct = session.correct_answers or 0
        session.score = round((correct / session.total_answers) * 100, 2)

    db.commit()

    return {
        "card_id": card_id,
        "knew": knew,
        "message": "Карточка запомнена" if knew else "Карточка появится снова",
        "session_stats": {
            "total_answers": session.total_answers,
            "correct_answers": session.correct_answers,
            "score": session.score,
        },
    }


# ===== Marathon Mode =====

@router.post("/marathon/sessions")
def create_marathon_session(
    body: MarathonSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание марафона — пройти ВСЕ карточки набора без перерыва."""
    from app.services.card_service import get_cards

    cards = get_cards(db, body.card_set_id, user_id=current_user.id)
    if not cards:
        raise HTTPException(status_code=404, detail="Нет карточек в наборе")

    # Создаём TrainingSession
    session = training_service.TrainingSession(
        user_id=current_user.id,
        card_set_id=body.card_set_id,
        mode="marathon",
        total_answers=0,
        correct_answers=0,
        score=0.0,
        completed=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "cards": [
            {
                "id": card.id,
                "front": card.front,
                "back": card.back,
                "front_lang": card.front_lang,
                "back_lang": card.back_lang,
                "front_image": card.front_image,
                "front_audio": card.front_audio,
                "back_image": card.back_image,
                "back_audio": card.back_audio,
            }
            for card in cards
        ],
        "total": len(cards),
    }


@router.post("/marathon/{session_id}/answer")
def submit_marathon_answer(
    session_id: int,
    body: MarathonAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ответ в марафоне."""
    card_id = body.card_id
    knew = body.knew
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    session.total_answers = (session.total_answers or 0) + 1
    if knew:
        session.correct_answers = (session.correct_answers or 0) + 1

    if session.total_answers and session.total_answers > 0:
        correct = session.correct_answers or 0
        session.score = round((correct / session.total_answers) * 100, 2)

    db.commit()

    return {
        "card_id": card_id,
        "knew": knew,
        "session_stats": {
            "total_answers": session.total_answers,
            "correct_answers": session.correct_answers,
            "score": session.score,
        },
    }


@router.post("/marathon/{session_id}/complete")
def complete_marathon(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Завершение марафона."""
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    session.completed = True
    session.completed_at = datetime.utcnow()

    # Обновляем статистику
    cards_count = session.total_answers or 0
    from app.services.profile_service import update_training_stats
    update_training_stats(db, current_user.id, cards_count, max(1, cards_count))

    if session.card_set_id:
        from app.services.card_set_stats_service import increment_set_stats
        increment_set_stats(
            db, current_user.id, session.card_set_id,
            cards_count, session.correct_answers or 0, max(1, cards_count)
        )

    db.commit()

    return {
        "session_id": session.id,
        "total_answers": session.total_answers,
        "correct_answers": session.correct_answers,
        "score": session.score,
        "completed_at": session.completed_at,
    }


# ===== Dictation Mode =====

class DictationSessionRequest(BaseModel):
    card_set_id: int


@router.post("/dictation/sessions")
def create_dictation_session(
    body: DictationSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание диктанта — слышишь аудио, пишешь слово."""
    from app.services.card_service import get_cards

    cards = get_cards(db, body.card_set_id, user_id=current_user.id)
    if not cards:
        raise HTTPException(status_code=404, detail="Нет карточек в наборе")

    session = training_service.TrainingSession(
        user_id=current_user.id,
        card_set_id=body.card_set_id,
        mode="dictation",
        total_answers=0,
        correct_answers=0,
        score=0.0,
        completed=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "cards": [
            {
                "id": card.id,
                "back": card.back,
                "back_lang": card.back_lang,  # ДОБАВЛЕНО: язык обратной стороны (для диктовки)
                "back_audio": card.back_audio,
                "front": card.front,  # Правильный ответ для проверки
                "front_lang": card.front_lang,  # ДОБАВЛЕНО: язык лицевой стороны
            }
            for card in cards
        ],
        "total": len(cards),
    }


@router.post("/dictation/{session_id}/answer")
def submit_dictation_answer(
    session_id: int,
    body: DictationAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ответ в диктанте — проверка текста."""
    card_id = body.card_id
    answer = body.answer
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Карточка не найдена")

    # Нечувствительное сравнение
    knew = answer.strip().lower() == card.front.strip().lower()

    session.total_answers = (session.total_answers or 0) + 1
    if knew:
        session.correct_answers = (session.correct_answers or 0) + 1

    if session.total_answers and session.total_answers > 0:
        correct = session.correct_answers or 0
        session.score = round((correct / session.total_answers) * 100, 2)

    db.commit()

    return {
        "card_id": card_id,
        "correct": knew,
        "correct_answer": card.front,
        "session_stats": {
            "total_answers": session.total_answers,
            "correct_answers": session.correct_answers,
            "score": session.score,
        },
    }


@router.post("/dictation/{session_id}/complete")
def complete_dictation(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Завершение диктанта."""
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    session.completed = True
    session.completed_at = datetime.utcnow()

    cards_count = session.total_answers or 0
    from app.services.profile_service import update_training_stats
    update_training_stats(db, current_user.id, cards_count, max(1, cards_count))

    if session.card_set_id:
        from app.services.card_set_stats_service import increment_set_stats
        increment_set_stats(
            db, current_user.id, session.card_set_id,
            cards_count, session.correct_answers or 0, max(1, cards_count)
        )

    db.commit()

    return {
        "session_id": session.id,
        "total_answers": session.total_answers,
        "correct_answers": session.correct_answers,
        "score": session.score,
        "completed_at": session.completed_at,
    }


# ===== Matching Mode =====

@router.post("/matching/sessions")
def create_matching_session(
    body: MatchingSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание режима сопоставления — случайные пары для matching."""
    from app.services.card_service import get_cards
    import random

    cards = get_cards(db, body.card_set_id, user_id=current_user.id)
    if not cards:
        raise HTTPException(status_code=404, detail="Нет карточек в наборе")

    # Берём случайные пары
    count = min(body.pair_count, len(cards))
    selected = random.sample(list(cards), count)

    session = training_service.TrainingSession(
        user_id=current_user.id,
        card_set_id=body.card_set_id,
        mode="matching",
        total_answers=0,
        correct_answers=0,
        score=0.0,
        completed=False,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Перемешиваем front и back отдельно
    left_items = [{"id": c.id, "text": c.front} for c in selected]
    right_items = [{"id": c.id, "text": c.back} for c in selected]
    random.shuffle(right_items)

    return {
        "session_id": session.id,
        "pairs": [{"left": l, "right": r} for l, r in zip(left_items, right_items)],
        "total_pairs": count,
    }


@router.post("/matching/{session_id}/answer")
def submit_matching_answer(
    session_id: int,
    body: MatchingAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Результат сопоставления — массив пар."""
    matches = body.matches
    session = db.query(training_service.TrainingSession).filter(
        training_service.TrainingSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещён: это не ваша сессия")

    correct_count = sum(1 for m in matches if m["left_id"] == m["right_id"])
    total = len(matches)

    session.total_answers = total
    session.correct_answers = correct_count
    session.score = round((correct_count / total) * 100, 2) if total > 0 else 0
    session.completed = True
    session.completed_at = datetime.utcnow()

    db.commit()

    cards_count = total
    from app.services.profile_service import update_training_stats
    update_training_stats(db, current_user.id, cards_count, max(1, cards_count))

    if session.card_set_id:
        from app.services.card_set_stats_service import increment_set_stats
        increment_set_stats(
            db, current_user.id, session.card_set_id,
            cards_count, correct_count, max(1, cards_count)
        )

    return {
        "session_id": session.id,
        "total_pairs": total,
        "correct_pairs": correct_count,
        "score": session.score,
        "completed_at": session.completed_at,
    }
