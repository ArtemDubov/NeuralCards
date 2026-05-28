from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime

VALID_GUEST_MODES = {"practice", "quiz"}


class GuestSessionCreate(BaseModel):
    """Схема создания сессии гостя."""
    card_set_id: int
    mode: str

    @field_validator('mode')
    @classmethod
    def validate_mode(cls, v):
        if v not in VALID_GUEST_MODES:
            raise ValueError(f"Недопустимый режим: {v}. Разрешены: {', '.join(VALID_GUEST_MODES)}")
        return v


class GuestSessionResponse(BaseModel):
    """Схема ответа с сессией гостя."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    session_token: str
    card_set_id: int
    mode: str
    score: int
    created_at: datetime
