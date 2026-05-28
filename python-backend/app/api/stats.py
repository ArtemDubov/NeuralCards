from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services import stats_service

router = APIRouter(prefix="/api/stats", tags=["Статистика и рейтинги"])


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = 50,
    period_days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Глобальный рейтинг пользователей."""
    return stats_service.get_leaderboard(db, limit=limit, period_days=period_days)


@router.get("/weekly-report")
def get_weekly_report(
    weeks: int = 4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Еженедельный отчёт по тренировкам."""
    return stats_service.get_weekly_report(db, user_id=current_user.id, weeks=weeks)


@router.get("/hourly-heatmap")
def get_hourly_heatmap(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Тепловая карта активности по часам (0-23)."""
    return stats_service.get_hourly_heatmap(db, user_id=current_user.id, days=days)


@router.get("/forecast")
def get_training_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Прогноз обучения — когда выучишь все оставшиеся карточки."""
    return stats_service.get_training_forecast(db, user_id=current_user.id)


@router.get("/export")
def get_stats_for_export(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Полная статистика для экспорта в PDF."""
    from app.services.profile_service import get_user_stats
    
    stats = get_user_stats(db, current_user.id)
    forecast = stats_service.get_training_forecast(db, current_user.id)
    weekly = stats_service.get_weekly_report(db, current_user.id, weeks=4)
    hourly = stats_service.get_hourly_heatmap(db, current_user.id, days=30)
    leaderboard = stats_service.get_leaderboard(db, limit=50, period_days=30)
    
    # Find current user's rank
    user_rank = None
    for entry in leaderboard:
        if entry["user_id"] == current_user.id:
            user_rank = entry
            break
    
    return {
        "user_name": current_user.name,
        "user_email": current_user.email,
        "stats": stats,
        "forecast": forecast,
        "weekly_reports": weekly,
        "hourly_heatmap": hourly,
        "my_rank": user_rank
    }
