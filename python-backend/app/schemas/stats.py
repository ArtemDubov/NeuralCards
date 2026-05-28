from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class LeaderboardEntry(BaseModel):
    user_id: int
    user_name: str
    total_training_time: int
    total_cards_learned: int
    current_streak: int
    total_sessions: int
    rank: int


class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    cards_reviewed: int
    training_sessions: int
    training_time_minutes: int
    accuracy: float
    cards_learned: int
    compared_to_prev_week: Dict[str, float]  # percentage changes


class HourlyHeatmapData(BaseModel):
    hour: int  # 0-23
    count: int  # number of training sessions


class TrainingForecast(BaseModel):
    current_rate: float  # cards per day
    remaining_cards: int
    estimated_days: int
    estimated_date: Optional[str] = None
