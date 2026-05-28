from datetime import datetime
import math

from sqlalchemy.orm import Session

from app.models.training_session import TrainingSession


def create_training_session(
    db: Session,
    user_id: int,
    card_set_id: int,
    mode: str
) -> TrainingSession:
    """Создание сессии тренировки."""
    session = TrainingSession(
        user_id=user_id,
        card_set_id=card_set_id,
        mode=mode
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def submit_answer(
    db: Session,
    session_id: int,
    is_correct: bool
) -> TrainingSession:
    """Отправка ответа в сессии."""
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise ValueError("Сессия не найдена")
    
    session.total_answers += 1
    if is_correct:
        session.correct_answers += 1
    
    # Обновляем процент
    if session.total_answers > 0:
        session.score = (session.correct_answers / session.total_answers) * 100
    
    db.commit()
    db.refresh(session)
    return session


def complete_session(db: Session, session_id: int) -> TrainingSession:
    """Завершение сессии тренировки."""
    from app.services.profile_service import update_training_stats
    from app.services.card_set_stats_service import increment_set_stats

    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise ValueError("Сессия не найдена")

    session.completed = True
    session.completed_at = datetime.utcnow()

    # Вычисляем длительность сессии в минутах
    session_duration_minutes = 0
    if session.created_at and session.completed_at:
        duration = (session.completed_at - session.created_at).total_seconds() / 60
        session_duration_minutes = max(1, int(math.ceil(duration)))  # Округление вверх

    db.commit()
    db.refresh(session)

    # Обновляем статистику пользователя
    update_training_stats(
        db=db,
        user_id=session.user_id,
        cards_count=session.total_answers,
        training_time=session_duration_minutes
    )

    # Обновляем статистику набора
    increment_set_stats(
        db=db,
        user_id=session.user_id,
        card_set_id=session.card_set_id,
        cards_reviewed=session.total_answers,
        correct=session.correct_answers,
        training_time=session_duration_minutes
    )

    return session
