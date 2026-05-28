from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.core.security import create_access_token, create_refresh_token
from app.services.profile_service import get_or_create_profile


def register_user(db: Session, email: str, password: str, name: str) -> User:
    """Регистрация нового пользователя."""
    # Проверяем, существует ли пользователь с таким email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    
    # Создаем нового пользователя
    hashed_password = get_password_hash(password)
    new_user = User(
        email=email,
        password_hash=hashed_password,
        name=name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Автоматически создаём профиль для нового пользователя
    get_or_create_profile(db, new_user.id)
    
    return new_user


def login_user(db: Session, email: str, password: str) -> tuple[User, dict]:
    """Вход пользователя (возвращает пользователя и токены)."""
    # Находим пользователя
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Проверяем пароль
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    
    # Создаем токены (sub должен быть строкой для jose)
    tokens = {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)})
    }

    return user, tokens


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    """Обновление access токена."""
    from app.core.security import decode_token, create_access_token, create_refresh_token

    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный refresh токен"
        )

    user_id = payload.get("sub")
    # Преобразуем в int для запроса к БД
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )

    # Создаем новую пару токенов
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer"
    }
