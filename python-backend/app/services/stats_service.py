from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.training_session import TrainingSession
from app.models.card import Card
from app.models.card_set import CardSet


def get_leaderboard(db: Session, limit: int = 50, period_days: int = 30) -> List[dict]:
    """Get global leaderboard ranked by training activity.
    
    Возвращает только активных пользователей (с тренировками или изученными карточками).
    """
    result = []

    # Получаем профили с JOIN к User и фильтрацией по активности
    profiles = db.query(UserProfile).join(User).filter(
        # Пользователь должен иметь хотя бы одну сессию ИЛИ изученные карточки
        or_(
            UserProfile.total_cards_learned > 0,
            UserProfile.total_training_time > 0,
            UserProfile.current_streak > 0
        )
    ).order_by(
        UserProfile.total_cards_learned.desc(),
        UserProfile.current_streak.desc(),
        UserProfile.total_training_time.desc()
    ).limit(limit).all()

    for rank, profile in enumerate(profiles, 1):
        # Date range for period filtering
        if period_days > 0:
            cutoff = datetime.utcnow() - timedelta(days=period_days)
            sessions_count = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id,
                TrainingSession.created_at >= cutoff
            ).count()
            # First and last session in period
            first_in_period = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id,
                TrainingSession.created_at >= cutoff
            ).order_by(TrainingSession.created_at.asc()).first()
            last_in_period = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id,
                TrainingSession.created_at >= cutoff
            ).order_by(TrainingSession.created_at.desc()).first()
        else:
            # All time
            sessions_count = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id
            ).count()
            first_in_period = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id
            ).order_by(TrainingSession.created_at.asc()).first()
            last_in_period = db.query(TrainingSession).filter(
                TrainingSession.user_id == profile.user_id
            ).order_by(TrainingSession.created_at.desc()).first()

        result.append({
            "user_id": profile.user_id,
            "user_name": profile.user.name if profile.user else "Unknown",
            "total_training_time": profile.total_training_time or 0,
            "total_cards_learned": profile.total_cards_learned or 0,
            "current_streak": profile.current_streak or 0,
            "total_sessions": sessions_count,
            "rank": rank,
            "first_session": first_in_period.created_at.isoformat() if first_in_period and first_in_period.created_at else None,
            "last_session": last_in_period.created_at.isoformat() if last_in_period and last_in_period.created_at else None,
        })

    return result


def get_weekly_report(db: Session, user_id: int, weeks: int = 4) -> List[dict]:
    """Get weekly training reports for the past N weeks."""
    reports = []

    for week_offset in range(weeks):
        week_end = datetime.utcnow() - timedelta(weeks=week_offset)
        # Monday of current week
        week_start = week_end - timedelta(days=week_end.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)

        # Sessions this week
        sessions = db.query(TrainingSession).filter(
            TrainingSession.user_id == user_id,
            TrainingSession.created_at >= week_start,
            TrainingSession.created_at < week_end
        ).all()

        total_sessions = len(sessions)
        total_correct = sum(s.correct_answers or 0 for s in sessions)
        total_answers = sum(s.total_answers or 0 for s in sessions)
        total_time = sum(1 for s in sessions)  # ~1 min per session estimate
        accuracy = round((total_correct / total_answers * 100), 1) if total_answers > 0 else 0

        reports.append({
            "week_start": week_start.strftime("%Y-%m-%d"),
            "week_end": (week_end - timedelta(days=1)).strftime("%Y-%m-%d"),
            "cards_reviewed": total_answers,
            "training_sessions": total_sessions,
            "training_time_minutes": total_time,
            "accuracy": accuracy,
            "cards_learned": 0,  # Would need more complex logic
        })

    return reports


def get_hourly_heatmap(db: Session, user_id: int, days: int = 30) -> List[dict]:
    """Get training activity by hour of day (0-23) for heatmap."""
    cutoff = datetime.utcnow() - timedelta(days=days)

    sessions = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.created_at >= cutoff
    ).all()

    hour_counts = {h: 0 for h in range(24)}

    for session in sessions:
        if session.created_at:
            hour_counts[session.created_at.hour] += 1

    return [{"hour": h, "count": c} for h, c in hour_counts.items()]


def get_training_forecast(db: Session, user_id: int) -> dict:
    """Predict when user will learn all remaining cards based on current rate."""
    # Get total cards user has
    total_cards = db.query(Card).join(CardSet).filter(
        (CardSet.author_id == user_id) | (CardSet.is_public == True)
    ).count()

    # Get learned cards from training sessions
    learned = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id
    ).with_entities(func.sum(TrainingSession.correct_answers)).scalar() or 0

    remaining = max(0, total_cards - learned)

    # Get learning rate (cards per day in last 30 days)
    cutoff = datetime.utcnow() - timedelta(days=30)
    sessions_in_period = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.created_at >= cutoff
    ).all()
    
    cards_in_period = sum(s.correct_answers or 0 for s in sessions_in_period)
    daily_rate = cards_in_period / 30.0 if cards_in_period > 0 else 0

    estimated_days = int(remaining / daily_rate) if daily_rate > 0 else -1
    estimated_date = None
    if estimated_days > 0:
        estimated_date = (datetime.utcnow() + timedelta(days=estimated_days)).strftime("%Y-%m-%d")

    return {
        "current_rate": round(daily_rate, 1),
        "remaining_cards": remaining,
        "learned_cards": learned,
        "total_cards": total_cards,
        "estimated_days": estimated_days,
        "estimated_date": estimated_date,
    }


