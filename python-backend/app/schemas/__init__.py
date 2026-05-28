# Импорт всех схем
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
)
from app.schemas.card_set import (
    CardBase,
    CardCreate,
    CardUpdate,
    CardResponse,
    CardSetBase,
    CardSetCreate,
    CardSetUpdate,
    CardSetResponse,
)
from app.schemas.training import (
    TrainingSessionBase,
    TrainingSessionCreate,
    TrainingSessionResponse,
    AnswerSubmit,
    TrainingResult,
)
from app.schemas.guest import (
    GuestSessionCreate,
    GuestSessionResponse,
)
from app.schemas.shared_sets import (
    SharedSetCreate,
    SharedSetResponse,
    SharedSetWithDetails,
)
from app.schemas.chat import (
    MessageCreate,
    MessageResponse,
    ChatConversation,
)
from app.schemas.stats import (
    LeaderboardEntry,
    WeeklyReport,
    HourlyHeatmapData,
    TrainingForecast,
)

__all__ = [
    # Auth
    "UserRegister",
    "UserLogin",
    "TokenResponse",
    "UserResponse",
    # CardSet & Card
    "CardBase",
    "CardCreate",
    "CardUpdate",
    "CardResponse",
    "CardSetBase",
    "CardSetCreate",
    "CardSetUpdate",
    "CardSetResponse",
    # Training
    "TrainingSessionBase",
    "TrainingSessionCreate",
    "TrainingSessionResponse",
    "AnswerSubmit",
    "TrainingResult",
    # Guest
    "GuestSessionCreate",
    "GuestSessionResponse",
    # Shared Sets
    "SharedSetCreate",
    "SharedSetResponse",
    "SharedSetWithDetails",
    # Chat
    "MessageCreate",
    "MessageResponse",
    "ChatConversation",
    # Stats
    "LeaderboardEntry",
    "WeeklyReport",
    "HourlyHeatmapData",
    "TrainingForecast",
]
