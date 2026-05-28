from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.profile import (
    UserProfileResponse,
    UserProfileUpdate,
    UserWithProfile,
)
from app.services import profile_service

router = APIRouter(prefix="/api/profile", tags=["Профиль"])


@router.get("", response_model=UserWithProfile)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить профиль пользователя."""
    profile = profile_service.get_or_create_profile(db, current_user.id)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at,
        "profile": profile
    }


@router.put("", response_model=UserWithProfile)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить профиль пользователя."""
    profile = profile_service.update_profile(
        db=db,
        user_id=current_user.id,
        bio=profile_data.bio,
        avatar_type=profile_data.avatar_type,
        avatar_emoji=profile_data.avatar_emoji,
        avatar_color=profile_data.avatar_color,
        avatar_url=profile_data.avatar_url,
        last_avatar_emoji=profile_data.last_avatar_emoji,
        last_avatar_color=profile_data.last_avatar_color,
        language_preference=profile_data.language_preference,
        dark_mode=profile_data.dark_mode,
        notifications_enabled=profile_data.notifications_enabled
    )
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at,
        "profile": profile
    }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить статистику пользователя."""
    return profile_service.get_user_stats(db, current_user.id)


@router.get("/progress")
def get_progress(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить прогресс по дням (для графика)."""
    progress = profile_service.get_progress_by_days(db, current_user.id, days)
    return progress


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Загрузить аватар (изображение) с автоматической обработкой.
    
    Поддерживаемые форматы: JPEG, PNG, WebP, GIF, BMP
    Автоматически обрезает в квадрат и масштабирует до 256x256
    """
    import uuid
    from pathlib import Path
    from PIL import Image
    import io
    
    # Проверяем тип файла
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Неподдерживаемый формат. Разрешены: JPEG, PNG, WebP, GIF, BMP"
        )

    try:
        # Читаем содержимое файла
        contents = await file.read()
        
        # Проверяем размер (максимум 5MB)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Изображение слишком большое (максимум 5MB)")
        
        # Открываем изображение с помощью Pillow
        img = Image.open(io.BytesIO(contents))
        
        # Конвертируем в RGB если необходимо (для PNG с прозрачностью, GIF, WebP)
        if img.mode in ('RGBA', 'P', 'LA'):
            # Создаём белый фон для прозрачных изображений
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Обрезаем в квадрат (берём центральную часть)
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        
        img_cropped = img.crop((left, top, right, bottom))
        
        # Масштабируем до стандартного размера аватара (256x256)
        # Используем LANCZOS для лучшего качества
        img_resized = img_cropped.resize((256, 256), Image.LANCZOS)
        
        # Создаём директорию для аватаров
        avatars_dir = Path(__file__).parent.parent.parent / "static" / "avatars"
        avatars_dir.mkdir(parents=True, exist_ok=True)
        
        # Удаляем старые аватарки пользователя (опционально)
        old_avatars = list(avatars_dir.glob(f"avatar_{current_user.id}_*.jpg"))
        for old_avatar in old_avatars:
            try:
                old_avatar.unlink()
            except:
                pass
        
        # Генерируем уникальное имя файла
        unique_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex}.jpg"
        file_path = avatars_dir / unique_filename
        
        # Сохраняем обработанное изображение с оптимизацией
        img_resized.save(
            file_path, 
            "JPEG", 
            quality=85,  # Баланс между качеством и размером
            optimize=True,  # Оптимизация размера файла
            progressive=True  # Прогрессивная загрузка
        )
        
        # Обновляем профиль - сохраняем фото и текущие настройки как последние
        avatar_url = f"/static/avatars/{unique_filename}"
        
        # Получаем текущий профиль чтобы сохранить emoji/color перед установкой фото
        current_profile = profile_service.get_or_create_profile(db, current_user.id)
        
        profile = profile_service.update_profile(
            db=db,
            user_id=current_user.id,
            avatar_type="url",
            avatar_url=avatar_url,
            # Передаём текущие значения чтобы они сохранились как last_*
            last_avatar_emoji=current_profile.avatar_emoji if current_profile.avatar_type == "emoji" else current_profile.last_avatar_emoji,
            last_avatar_color=current_profile.avatar_color if current_profile.avatar_type in ["emoji", "letter"] else current_profile.last_avatar_color
        )

        return {
            "message": "Аватар загружен и обработан",
            "avatar_url": avatar_url,
            "avatar_type": "url"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[upload_avatar ERROR]: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обработке изображения: {str(e)}"
        )


@router.delete("/avatar")
def reset_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить фото аватара и восстановить последние настройки."""
    profile = profile_service.remove_avatar_photo(db, current_user.id)

    return {
        "message": "Фото удалено, восстановлены последние настройки",
        "avatar_type": profile.avatar_type,
        "avatar_emoji": profile.avatar_emoji,
        "avatar_color": profile.avatar_color
    }


@router.get("/public/{user_id}")
def get_public_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Публичный профиль пользователя — доступен авторизованным пользователям."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    profile = profile_service.get_or_create_profile(db, user_id)

    stats = profile_service.get_user_stats(db, user_id)
    
    # Получаем детальную аналитику для дашборда
    analytics = profile_service.get_detailed_analytics(db, user_id)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at,
        "bio": profile.bio,
        "avatar_type": profile.avatar_type if profile.avatar_type else "letter",
        "avatar_url": profile.avatar_url,
        "avatar_color": profile.avatar_color if profile.avatar_color else "#667eea",
        "avatar_emoji": profile.avatar_emoji if profile.avatar_emoji else "👤",
        "theme": profile.theme,
        "joined_date": user.created_at.strftime('%d.%m.%Y') if user.created_at else None,
        "stats": stats,
        "activity_calendar": analytics.get('activity_calendar', []),
        "mode_distribution": analytics.get('mode_distribution', {}),
        "favorite_sets": analytics.get('top_sets', [])[:5],  # Топ 5 наборов
    }


@router.post("/delete-account")
def delete_account(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удалить аккаунт пользователя и все связанные данные."""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password = request_data.get("password", "")
    
    # Проверяем пароль
    if not pwd_context.verify(password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль"
        )
    
    try:
        profile_service.delete_user_account(db, current_user.id)
        return {"message": "Аккаунт успешно удален"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении аккаунта: {str(e)}"
        )
