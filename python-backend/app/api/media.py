import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.card import Card
from app.models.card_set import CardSet
from app.schemas.card_set import CardMediaUploadResponse
from app.core.config import settings

router = APIRouter(prefix="/api/media", tags=["Медиафайлы"])

# Допустимые типы файлов
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/webm"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"]

# Максимальные размеры файлов (в байтах)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


def get_media_type_category(file_type: str) -> Optional[str]:
    """Определяет категорию медиафайла по MIME-типу."""
    if any(file_type.startswith(t.split('/')[0]) for t in ALLOWED_IMAGE_TYPES):
        return "image"
    elif any(file_type.startswith(t.split('/')[0]) for t in ALLOWED_AUDIO_TYPES):
        return "audio"
    elif any(file_type.startswith(t.split('/')[0]) for t in ALLOWED_VIDEO_TYPES):
        return "video"
    return None


def save_uploaded_file(file: UploadFile, media_type: str) -> str:
    """
    Сохраняет загруженный файл и возвращает путь к нему.
    
    Args:
        file: Загруженный файл
        media_type: Тип медиа (image, audio, video)
    
    Returns:
        Путь к файлу относительно медиа-директории
    """
    # Создаём директорию для медиа
    media_dir = os.path.join(settings.MEDIA_ROOT, media_type)
    os.makedirs(media_dir, exist_ok=True)
    
    # Генерируем уникальное имя файла
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(media_dir, unique_filename)
    
    # Сохраняем файл
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    # Возвращаем относительный путь
    return f"{media_type}/{unique_filename}"


@router.post("/upload/image", response_model=CardMediaUploadResponse)
async def upload_image(
    file: UploadFile = File(..., description="Изображение для загрузки"),
    side: str = Form(..., description="Сторона карточки (front/back)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Загрузка изображения для карточки."""
    # Проверка типа файла
    # Если content_type пустой или None, определяем по расширению файла
    ct = (file.content_type or "").split(";")[0].strip() if file.content_type else ""
    
    # Если content_type не определен, пытаемся определить по расширению
    if not ct and file.filename:
        ext = file.filename.lower().split(".")[-1] if "." in file.filename else ""
        ext_to_mime = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp",
        }
        ct = ext_to_mime.get(ext, "")
    
    if not any(ct == t for t in ALLOWED_IMAGE_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип изображения. Разрешены: {', '.join(ALLOWED_IMAGE_TYPES)}. Получен: {ct or 'не определен'}"
        )
    
    # Проверка размера
    file.file.seek(0, 2)  # Перемещаемся в конец файла
    file_size = file.file.tell()
    file.file.seek(0)  # Возвращаемся в начало
    
    if file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум {MAX_IMAGE_SIZE // 1024 // 1024} MB"
        )
    
    # Проверка стороны
    if side not in ["front", "back"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сторона должна быть 'front' или 'back'"
        )
    
    # Сохраняем файл
    file_path = save_uploaded_file(file, "image")
    
    return CardMediaUploadResponse(
        file_url=file_path,
        file_type="image",
        side=side
    )


@router.post("/upload/audio", response_model=CardMediaUploadResponse)
async def upload_audio(
    file: UploadFile = File(..., description="Аудиофайл для загрузки"),
    side: str = Form(..., description="Сторона карточки (front/back)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Загрузка аудио для карточки."""
    # Проверка типа файла (с учётом параметров, напр. audio/webm;codecs=opus)
    ct = (file.content_type or "").split(";")[0].strip() if file.content_type else ""
    
    # Если content_type не определен, пытаемся определить по расширению
    if not ct and file.filename:
        ext = file.filename.lower().split(".")[-1] if "." in file.filename else ""
        ext_to_mime = {
            "mp3": "audio/mpeg",
            "mpeg": "audio/mpeg",
            "wav": "audio/wav",
            "ogg": "audio/ogg",
            "webm": "audio/webm",
        }
        ct = ext_to_mime.get(ext, "")
    
    if not any(ct == t for t in ALLOWED_AUDIO_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип аудио. Разрешены: {', '.join(ALLOWED_AUDIO_TYPES)}. Получен: {ct or 'не определен'}"
        )
    
    # Проверка размера
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум {MAX_AUDIO_SIZE // 1024 // 1024} MB"
        )
    
    # Проверка стороны
    if side not in ["front", "back"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сторона должна быть 'front' или 'back'"
        )
    
    # Сохраняем файл
    file_path = save_uploaded_file(file, "audio")
    
    return CardMediaUploadResponse(
        file_url=file_path,
        file_type="audio",
        side=side
    )


@router.post("/upload/video", response_model=CardMediaUploadResponse)
async def upload_video(
    file: UploadFile = File(..., description="Видеофайл для загрузки"),
    side: str = Form(..., description="Сторона карточки (front/back)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Загрузка видео для карточки."""
    # Проверка типа файла
    ct = (file.content_type or "").split(";")[0].strip() if file.content_type else ""
    
    # Если content_type не определен, пытаемся определить по расширению
    if not ct and file.filename:
        ext = file.filename.lower().split(".")[-1] if "." in file.filename else ""
        ext_to_mime = {
            "mp4": "video/mp4",
            "webm": "video/webm",
            "ogg": "video/ogg",
        }
        ct = ext_to_mime.get(ext, "")
    
    if not any(ct == t for t in ALLOWED_VIDEO_TYPES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип видео. Разрешены: {', '.join(ALLOWED_VIDEO_TYPES)}. Получен: {ct or 'не определен'}"
        )
    
    # Проверка размера
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум {MAX_VIDEO_SIZE // 1024 // 1024} MB"
        )
    
    # Проверка стороны
    if side not in ["front", "back"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сторона должна быть 'front' или 'back'"
        )
    
    # Сохраняем файл
    file_path = save_uploaded_file(file, "video")
    
    return CardMediaUploadResponse(
        file_url=file_path,
        file_type="video",
        side=side
    )


@router.delete("/files/{file_path:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_file(
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление медиафайла."""
    # Защита от Path Traversal: разрешаем только файлы внутри MEDIA_ROOT
    full_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, file_path))
    real_root = os.path.realpath(settings.MEDIA_ROOT)
    real_full_path = os.path.realpath(full_path)

    # Проверяем, что файл действительно внутри MEDIA_ROOT
    if not real_full_path.startswith(real_root + os.sep) and real_full_path != real_root:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещён: недопустимый путь"
        )

    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )

    os.remove(full_path)
