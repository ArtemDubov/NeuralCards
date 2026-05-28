from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/api/auth", tags=["Аутентификация"])


class PasswordStrength(BaseModel):
    """Уровень сложности пароля."""
    level: int  # 1-5
    label: str
    color: str
    suggestions: list[str] = []


class ChangeEmailRequest(BaseModel):
    """Запрос на смену email."""
    new_email: EmailStr
    current_password: str = Field(..., min_length=1)


class ChangePasswordRequest(BaseModel):
    """Запрос на смену пароля."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Пароль должен содержать минимум 6 символов')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Пароли не совпадают')
        return v


def calculate_password_strength(password: str) -> PasswordStrength:
    """Рассчитать сложность пароля по 5-балльной шкале."""
    level = 0
    suggestions = []

    # Длина пароля
    if len(password) >= 6:
        level += 1
    elif len(password) > 0:
        suggestions.append("Увеличьте длину пароля до 6+ символов")
    
    if len(password) >= 10:
        level += 1
    elif len(password) >= 6:
        suggestions.append("Для надёжности используйте 10+ символов")
    
    if len(password) >= 16:
        level += 1

    # Наличие строчных букв
    if re.search(r'[a-z]', password):
        level += 1
    elif len(password) > 0:
        suggestions.append("Добавьте строчные буквы (a-z)")

    # Наличие заглавных букв
    if re.search(r'[A-Z]', password):
        level += 1
    elif len(password) > 0:
        suggestions.append("Добавьте заглавные буквы (A-Z)")

    # Наличие цифр
    if re.search(r'\d', password):
        level += 1
    elif len(password) > 0:
        suggestions.append("Добавьте цифры (0-9)")

    # Наличие спецсимволов
    if re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;\'`~]', password):
        level += 1
    elif len(password) > 0:
        suggestions.append("Добавьте спецсимволы (!@#$%^&*)")

    # Ограничиваем уровень 5
    level = min(level, 5)

    # Определяем метку и цвет
    if level == 0:
        label = "Не введён"
        color = "#e0e0e0"
    elif level == 1:
        label = "Очень слабый"
        color = "#e74c3c"
        suggestions.append("Пароль легко взломать")
    elif level == 2:
        label = "Слабый"
        color = "#e67e22"
        suggestions.append("Добавьте больше типов символов")
    elif level == 3:
        label = "Средний"
        color = "#f39c12"
    elif level == 4:
        label = "Надёжный"
        color = "#27ae60"
    else:  # level == 5
        label = "Очень надёжный"
        color = "#2ecc71"

    return PasswordStrength(
        level=level,
        label=label,
        color=color,
        suggestions=suggestions[:3]  # Максимум 3 подсказки
    )


@router.put("/change-email")
def change_email(
    request: ChangeEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Сменить email пользователя."""
    # Проверяем текущий пароль
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )

    # Проверяем, не занят ли новый email
    existing_user = db.query(User).filter(User.email == request.new_email).first()
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Этот email уже зарегистрирован"
        )

    # Меняем email
    current_user.email = request.new_email
    db.commit()
    db.refresh(current_user)

    return {
        "message": "✅ Email успешно изменён",
        "email": current_user.email
    }


@router.put("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Сменить пароль пользователя."""
    # Проверяем текущий пароль
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )

    # Меняем пароль
    current_user.password_hash = get_password_hash(request.new_password)
    db.commit()

    return {"message": "✅ Пароль успешно изменён"}


@router.get("/check-password-strength", response_model=PasswordStrength)
def check_password_strength(password: str):
    """Проверить сложность пароля."""
    return calculate_password_strength(password)
