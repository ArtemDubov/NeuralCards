from datetime import datetime
from sqlalchemy.orm import Session

from app.models.card_set_usage_stats import CardSetUsageStats


def increment_set_stats(
    db: Session,
    user_id: int,
    card_set_id: int,
    cards_reviewed: int = 0,
    correct: int = 0,
    training_time: int = 0
):
    """Увеличить счётчики использования набора."""
    if card_set_id is None:
        return  # Interval-repeat без набора

    stats = db.query(CardSetUsageStats).filter(
        CardSetUsageStats.user_id == user_id,
        CardSetUsageStats.card_set_id == card_set_id
    ).first()

    if not stats:
        stats = CardSetUsageStats(
            user_id=user_id,
            card_set_id=card_set_id,
            total_sessions=0,
            total_cards_reviewed=0,
            total_correct=0,
            total_time=0,
            first_used_at=datetime.utcnow(),
            last_used_at=datetime.utcnow()
        )
        db.add(stats)
        db.flush()

    stats.total_sessions += 1
    stats.total_cards_reviewed += cards_reviewed
    stats.total_correct += correct
    stats.total_time += training_time
    stats.last_used_at = datetime.utcnow()

    db.commit()
    db.refresh(stats)
    return stats
