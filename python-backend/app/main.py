from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db
from app.data.seed_data import seed_database

# Импорт роутов
from app.api.auth import router as auth_router
from app.api.card_sets import router as card_sets_router
from app.api.training import router as training_router
from app.api.guest import router as guest_router
from app.api.import_export import router as import_export_router
from app.api.profile import router as profile_router
from app.api.friends import router as friends_router
from app.api.account import router as account_router
from app.api.media import router as media_router
from app.api.speech import router as speech_router
from app.api.favorites import router as favorites_router
from app.api.stats import router as stats_router
from app.api.shared_sets import router as shared_sets_router
from app.api.chat import router as chat_router
from app.api.websocket_chat import router as ws_router

# Импорт моделей для регистрации таблиц SQLAlchemy
from app.models import SharedSetAccess, Message
from app.models import user, card, card_set, training_session, tag, favorite, card_set_usage_stats


def create_app() -> FastAPI:
    """Создание и настройка FastAPI приложения."""

    app = FastAPI(
        title="NeuralTrident API",
        description="API для приложения тренировки памяти NeuralTrident",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Настройка CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Инициализация БД
    init_db()
    # Логируем путь к БД при старте
    import os
    db_path = settings.DATABASE_URL.replace("sqlite:///", "").replace("sqlite:///", "")
    abs_path = os.path.abspath(db_path) if not os.path.isabs(db_path) else db_path
    print(f"[DB] DATABASE_URL={settings.DATABASE_URL}")
    print(f"[DB] Absolute path={abs_path}")
    print(f"[DB] File exists={os.path.exists(abs_path)}")

    # Заполнение стартовыми данными
    seed_database()

    # Подключение роутов
    app.include_router(auth_router)
    app.include_router(card_sets_router)
    app.include_router(training_router)
    app.include_router(guest_router)
    app.include_router(import_export_router)
    app.include_router(profile_router)
    app.include_router(friends_router)
    app.include_router(account_router)
    app.include_router(media_router)
    app.include_router(speech_router)
    app.include_router(favorites_router)
    app.include_router(stats_router)
    app.include_router(shared_sets_router)
    app.include_router(chat_router)
    app.include_router(ws_router)

    # Подключение статических файлов (аватары)
    static_dir = Path(__file__).parent.parent / "static"
    static_dir.mkdir(exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    
    # Подключение медиафайлов (карточки)
    media_dir = settings.MEDIA_ROOT
    media_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

    @app.get("/")
    def root():
        """Корневой эндпоинт."""
        return {
            "message": "NeuralTrident API",
            "docs": "/docs",
            "redoc": "/redoc"
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
