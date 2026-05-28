from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.friendship import Friendship, FriendshipStatus as FriendshipStatusEnum
from app.schemas.friends import (
    FriendshipCreate,
    FriendshipResponse,
    FriendRequestResponse,
    FriendResponse,
    UserSearchResult,
    FriendshipStatus,
)
from app.services import friends_service

router = APIRouter(prefix="/api/friends", tags=["Друзья"])


@router.post("/request", response_model=FriendshipResponse)
def create_friend_request(
    data: FriendshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Отправить запрос в друзья."""
    try:
        friendship = friends_service.send_friend_request(
            db=db,
            requester_id=current_user.id,
            addressee_id=data.addressee_id
        )
        return friendship
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/request/{user_id}/accept", response_model=FriendshipResponse)
def accept_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Принять запрос в друзья."""
    try:
        # Находим запись дружбы по user_id
        friendship = db.query(Friendship).filter(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == current_user.id,
            Friendship.status == FriendshipStatusEnum.PENDING
        ).first()
        
        if not friendship:
            raise HTTPException(status_code=404, detail="Заявка в друзья не найдена")
        
        friendship = friends_service.accept_friend_request(
            db=db,
            friendship_id=friendship.id,
            user_id=current_user.id
        )
        return friendship
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/request/{user_id}/reject", response_model=FriendshipResponse)
def reject_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Отклонить запрос в друзья."""
    try:
        # Находим запись дружбы по user_id
        friendship = db.query(Friendship).filter(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == current_user.id,
            Friendship.status == FriendshipStatusEnum.PENDING
        ).first()
        
        if not friendship:
            raise HTTPException(status_code=404, detail="Заявка в друзья не найдена")
        
        friendship = friends_service.reject_friend_request(
            db=db,
            friendship_id=friendship.id,
            user_id=current_user.id
        )
        return friendship
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/request/{user_id}/cancel", response_model=FriendshipResponse)
def cancel_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Отменить отправленный запрос в друзья."""
    try:
        # Находим запись дружбы по target user_id
        friendship = db.query(Friendship).filter(
            Friendship.requester_id == current_user.id,
            Friendship.addressee_id == user_id,
            Friendship.status == FriendshipStatusEnum.PENDING
        ).first()
        
        if not friendship:
            raise HTTPException(status_code=404, detail="Заявка в друзья не найдена")
        
        friendship = friends_service.cancel_friend_request(
            db=db,
            friendship_id=friendship.id,
            user_id=current_user.id
        )
        return friendship
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{friend_id}", status_code=204)
def remove_friend(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить друга."""
    try:
        friends_service.remove_friend(
            db=db,
            user_id=current_user.id,
            friend_id=friend_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{friend_id}/block", response_model=FriendshipResponse)
def block_friend(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Заблокировать пользователя."""
    try:
        friendship = friends_service.block_friend(
            db=db,
            user_id=current_user.id,
            friend_id=friend_id
        )
        return friendship
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[FriendResponse])
def get_friends_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить список друзей."""
    from app.models.user_profile import UserProfile
    
    friendships = friends_service.get_friends(db=db, user_id=current_user.id)
    
    # Получаем профили одним запросом
    friend_ids = []
    for friendship in friendships:
        friend_user = friendship.requester if friendship.addressee_id == current_user.id else friendship.addressee
        friend_ids.append(friend_user.id)
    
    # Принудительно обновляем session чтобы получить свежие данные из БД
    db.expire_all()
    
    profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(friend_ids)).all()
    profile_map = {p.user_id: p for p in profiles}
    
    print(f"[API FRIENDS] Found {len(profiles)} profiles for {len(friend_ids)} friends")
    for p in profiles:
        print(f"[API FRIENDS] Profile user_id={p.user_id}: type={p.avatar_type}, emoji={p.avatar_emoji}, color={p.avatar_color}")
    
    friends = []
    for friendship in friendships:
        # Определяем, кто является другом
        friend_user = friendship.requester if friendship.addressee_id == current_user.id else friendship.addressee
        
        profile = profile_map.get(friend_user.id)
        friend_data = {
            "id": friend_user.id,
            "email": friend_user.email,
            "name": friend_user.name,
            "avatar_type": profile.avatar_type if profile and profile.avatar_type else "letter",
            "avatar_emoji": profile.avatar_emoji if profile and profile.avatar_emoji else "👤",
            "avatar_color": profile.avatar_color if profile and profile.avatar_color else "#667eea",
            "avatar_url": profile.avatar_url if profile else None,
            "created_at": friend_user.created_at,
            "friendship_id": friendship.id,
            "friendship_status": friendship.status,
            "friendship_created_at": friendship.created_at,
        }
        print(f"[API FRIENDS] Friend {friend_user.name}: avatar_type={friend_data['avatar_type']}, avatar_emoji={friend_data['avatar_emoji']}, avatar_color={friend_data['avatar_color']}")
        friends.append(friend_data)
    
    return friends


@router.get("/requests", response_model=List[FriendRequestResponse])
def get_friend_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить входящие запросы в друзья."""
    from app.models.user_profile import UserProfile
    
    requests = friends_service.get_friend_requests(db=db, user_id=current_user.id)
    
    # Получаем профили requesters
    requester_ids = [req.requester_id for req in requests]
    print(f"[API FRIEND REQUESTS] Fetching profiles for requester_ids: {requester_ids}")
    
    # Принудительно обновляем session чтобы получить свежие данные из БД
    db.expire_all()
    
    profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(requester_ids)).all()
    print(f"[API FRIEND REQUESTS] Found {len(profiles)} profiles")
    
    profile_map = {p.user_id: p for p in profiles}
    
    # Логируем каждый профиль для отладки
    for p in profiles:
        print(f"[API FRIEND REQUESTS] Profile user_id={p.user_id}: avatar_type={p.avatar_type}, avatar_emoji={p.avatar_emoji}, avatar_color={p.avatar_color}")
    
    result = []
    for req in requests:
        profile = profile_map.get(req.requester_id)
        result.append({
            "id": req.id,
            "requester_id": req.requester_id,
            "addressee_id": req.addressee_id,
            "status": req.status,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "requester_name": req.requester.name,
            "requester_avatar_type": profile.avatar_type if profile and profile.avatar_type else "letter",
            "requester_avatar_emoji": profile.avatar_emoji if profile and profile.avatar_emoji else "👤",
            "requester_avatar_color": profile.avatar_color if profile and profile.avatar_color else "#667eea",
            "requester_avatar_url": profile.avatar_url if profile else None,
        })
    
    return result


@router.get("/requests/sent", response_model=List[FriendRequestResponse])
def get_sent_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить отправленные запросы в друзья."""
    from app.models.user_profile import UserProfile
    
    requests = friends_service.get_sent_requests(db=db, user_id=current_user.id)
    
    # Получаем профили addressees
    addressee_ids = [req.addressee_id for req in requests]
    
    # Принудительно обновляем session чтобы получить свежие данные из БД
    db.expire_all()
    
    profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(addressee_ids)).all()
    profile_map = {p.user_id: p for p in profiles}
    
    print(f"[API SENT REQUESTS] Found {len(profiles)} profiles for {len(addressee_ids)} addressees")
    for p in profiles:
        print(f"[API SENT REQUESTS] Profile user_id={p.user_id}: type={p.avatar_type}, emoji={p.avatar_emoji}, color={p.avatar_color}")
    
    result = []
    for req in requests:
        profile = profile_map.get(req.addressee_id)
        result.append({
            "id": req.id,
            "requester_id": req.requester_id,
            "addressee_id": req.addressee_id,
            "status": req.status,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "target_name": req.addressee.name,
            "target_avatar_type": profile.avatar_type if profile and profile.avatar_type else "letter",
            "target_avatar_emoji": profile.avatar_emoji if profile and profile.avatar_emoji else "👤",
            "target_avatar_color": profile.avatar_color if profile and profile.avatar_color else "#667eea",
            "target_avatar_url": profile.avatar_url if profile else None,
        })
    
    return result


@router.get("/search", response_model=List[UserSearchResult])
def search_users(
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    limit: int = Query(20, ge=1, le=100, description="Ограничение количества"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Поиск пользователей."""
    from app.models.user_profile import UserProfile
    
    print(f"[API SEARCH] Received query: '{q}', limit: {limit}, current_user: {current_user.name} (ID: {current_user.id})")
    
    try:
        users = friends_service.search_users(
            db=db,
            query=q,
            current_user_id=current_user.id,
            limit=limit
        )
        
        # Получаем профили для avatar_color и avatar_url
        user_ids = [u.id for u in users]
        
        # Принудительно обновляем session чтобы получить свежие данные из БД
        db.expire_all()
        
        profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(user_ids)).all()
        profile_map = {p.user_id: p for p in profiles}
        
        print(f"[API SEARCH] Found {len(profiles)} profiles for {len(user_ids)} users")
        for p in profiles:
            print(f"[API SEARCH] Profile user_id={p.user_id}: type={p.avatar_type}, emoji={p.avatar_emoji}, color={p.avatar_color}")
        
        result = []
        for user in users:
            profile = profile_map.get(user.id)
            result.append({
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "avatar_type": profile.avatar_type if profile and profile.avatar_type else "letter",
                "avatar_emoji": profile.avatar_emoji if profile and profile.avatar_emoji else "👤",
                "avatar_color": profile.avatar_color if profile and profile.avatar_color else "#667eea",
                "avatar_url": profile.avatar_url if profile else None,
                "created_at": user.created_at,
            })
        
        print(f"[API SEARCH] Returning {len(result)} users")
        return result
    except Exception as e:
        print(f"[API SEARCH ERROR] {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка поиска: {str(e)}")


@router.get("/check/{user_id}", response_model=dict)
def check_friendship(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Проверить, являются ли пользователи друзьями."""
    is_friend = friends_service.is_friend(
        db=db,
        user_id=current_user.id,
        other_user_id=user_id
    )
    
    return {"is_friend": is_friend}
