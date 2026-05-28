from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List


class TrainingSessionBase(BaseModel):
    """Базовая схема сессии тренировки."""
    mode: str  # practice, quiz, marathon, dictation, matching


class TrainingSessionCreate(TrainingSessionBase):
    """Схема создания сессии."""
    card_set_id: int
    cards_count: int = Field(ge=1, le=2000, default=20)


class TrainingSessionResponse(BaseModel):
    """Схема ответа с сессией."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    card_set_id: Optional[int] = None
    mode: str
    score: float
    correct_answers: int
    total_answers: int
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None


class AnswerSubmit(BaseModel):
    """Схема отправки ответа."""
    answer: str
    is_correct: bool


class PracticeAnswer(BaseModel):
    """Ответ в режиме практики."""
    card_id: int
    knew: bool


class MarathonAnswer(BaseModel):
    """Ответ в марафоне."""
    card_id: int
    knew: bool


class DictationAnswer(BaseModel):
    """Ответ в диктанте."""
    card_id: int
    answer: str


class MatchingAnswer(BaseModel):
    """Результат сопоставления."""
    matches: List[dict]  # [{"left_id": 1, "right_id": 2}, ...]


class SessionComplete(BaseModel):
    """Завершение сессии."""
    correct_answers: int = 0
    total_answers: int = 0


class MarathonSessionCreate(BaseModel):
    """Создание марафона."""
    card_set_id: int


class MatchingSessionCreate(BaseModel):
    """Создание режима сопоставления."""
    card_set_id: int
    pair_count: int = Field(ge=1, le=50, default=8)


class TrainingResult(BaseModel):
    """Схема результата тренировки."""
    session_id: int
    score: float
    correct_answers: int
    total_answers: int
    completed_at: datetime
