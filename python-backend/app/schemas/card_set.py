from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Optional, List


# ===== Tag Schemas =====

class TagBase(BaseModel):
    """Базовая схема тега."""
    name: str


class TagResponse(TagBase):
    """Схема ответа с тегом."""
    model_config = ConfigDict(from_attributes=True)
    id: int


# ===== Card Schemas =====

class CardMediaBase(BaseModel):
    """Базовая схема для медиа карточки."""
    image: Optional[str] = None
    audio: Optional[str] = None
    video: Optional[str] = None


class CardPlaySettings(BaseModel):
    """Настройки воспроизведения для карточки."""
    auto_play_enabled: bool = False
    play_front: bool = True
    play_back: bool = True


class CardBase(BaseModel):
    """Базовая схема карточки (для ответа)."""
    front: str
    back: str
    position: int = 0
    # Языки сторон
    front_lang: Optional[str] = "ru"
    back_lang: Optional[str] = "ru"
    # Медиа для лицевой стороны
    front_image: Optional[str] = None
    front_audio: Optional[str] = None
    front_video: Optional[str] = None
    # Медиа для обратной стороны
    back_image: Optional[str] = None
    back_audio: Optional[str] = None
    back_video: Optional[str] = None
    # Настройки воспроизведения
    auto_play_enabled: bool = False
    play_front: bool = True
    play_back: bool = True


class CardCreate(BaseModel):
    """Схема создания карточки."""
    front: str = Field(..., max_length=256)
    back: str = Field(..., max_length=256)
    card_set_id: Optional[int] = None
    position: Optional[int] = None  # Если None — добавляется в конец
    # Языки сторон
    front_lang: Optional[str] = "ru"
    back_lang: Optional[str] = "ru"
    # Медиа
    front_image: Optional[str] = None
    front_audio: Optional[str] = None
    front_video: Optional[str] = None
    back_image: Optional[str] = None
    back_audio: Optional[str] = None
    back_video: Optional[str] = None
    # Настройки воспроизведения
    auto_play_enabled: Optional[bool] = False
    play_front: Optional[bool] = True
    play_back: Optional[bool] = True


class CardReorder(BaseModel):
    """Схема для переупорядочивания карточек."""
    card_ids: list[int]  # Новый порядок ID


class CardUpdate(BaseModel):
    """Схема обновления карточки."""
    front: Optional[str] = Field(None, max_length=256)
    back: Optional[str] = Field(None, max_length=256)
    # Языки сторон
    front_lang: Optional[str] = None
    back_lang: Optional[str] = None
    # Медиа
    front_image: Optional[str] = None
    front_audio: Optional[str] = None
    front_video: Optional[str] = None
    back_image: Optional[str] = None
    back_audio: Optional[str] = None
    back_video: Optional[str] = None
    # Настройки воспроизведения
    auto_play_enabled: Optional[bool] = None
    play_front: Optional[bool] = None
    play_back: Optional[bool] = None


class CardResponse(CardBase):
    """Схема ответа с карточкой."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_set_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CardMediaUploadResponse(BaseModel):
    """Ответ после загрузки медиа."""
    file_url: str
    file_type: str  # image, audio, video
    side: str  # front, back


# ===== CardSet Schemas =====

class CardSetBase(BaseModel):
    """Базовая схема набора карточек (для ответа)."""
    title: str
    description: Optional[str] = None


class CardSetCreate(BaseModel):
    """Схема создания набора."""
    title: str = Field(..., min_length=1, max_length=32)
    description: Optional[str] = Field(None, max_length=128)
    is_public: bool = True
    tags: Optional[List[str]] = []

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        if v is None:
            return []
        if len(v) > 8:
            raise ValueError("Максимум 8 тегов")
        for tag in v:
            if len(tag) > 20:
                raise ValueError(f"Тег '{tag}' слишком длинный (макс. 20 символов)")
            if not tag.strip():
                raise ValueError("Тег не может быть пустым")
        return v


class CardSetUpdate(BaseModel):
    """Схема обновления набора."""
    title: Optional[str] = Field(None, min_length=1, max_length=32)
    description: Optional[str] = Field(None, max_length=128)
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        if v is None:
            return v
        if len(v) > 8:
            raise ValueError("Максимум 8 тегов")
        for tag in v:
            if len(tag) > 20:
                raise ValueError(f"Тег '{tag}' слишком длинный (макс. 20 символов)")
            if not tag.strip():
                raise ValueError("Тег не может быть пустым")
        return v


class CardSetResponse(CardSetBase):
    """Схема ответа с набором."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    is_public: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    cards: list[CardResponse] = []
    tags: List[TagResponse] = []


class CardSetWithCount(CardSetBase):
    """Схема набора со счётчиком карточек."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    is_public: bool
    is_official: bool = False
    cards_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []


class CardSetDetail(CardSetBase):
    """Детальная схема набора с полной информацией."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    is_public: bool
    is_official: bool = False
    cards_count: int
    author_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tags: List[TagResponse] = []
    cards: list[CardResponse] = []
