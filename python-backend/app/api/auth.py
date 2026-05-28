from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services import auth_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Аутентификация"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя."""
    return auth_service.register_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        name=user_data.name
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Вход пользователя."""
    user, tokens = auth_service.login_user(
        db=db,
        email=user_data.email,
        password=user_data.password
    )
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Обновление access токена."""
    return auth_service.refresh_access_token(db=db, refresh_token=refresh_token)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Выход пользователя (на клиенте нужно удалить токены)."""
    return {"message": "Успешный выход"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Получение данных текущего пользователя."""
    return current_user
