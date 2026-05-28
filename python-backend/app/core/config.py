import os
import sys
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Настройки приложения."""

    # База данных — единый источник, ТОЛЬКО из .env файла
    DATABASE_URL: str = "sqlite:///./dev.db"

    # Безопасность — ОБЯЗАТЕЛЬНО из .env, без умолчаний
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Директория проекта
    BASE_DIR: Path = Path(__file__).resolve().parent.parent

    # Медиафайлы
    MEDIA_ROOT: Path = BASE_DIR / "media"
    MEDIA_URL: str = "/media"

    class Config:
        env_file = ".env"
        # НЕ читаем переменные окружения ОС — только .env файл
        env_file_encoding = "utf-8"


settings = Settings()

# Проверяем, что SECRET_KEY установлен и имеет достаточную длину
if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
    raise ValueError(
        "SECRET_KEY должен быть не менее 32 символов. "
        "Установите его в файле .env"
    )
