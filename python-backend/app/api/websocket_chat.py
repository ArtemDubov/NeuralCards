"""
WebSocket роутер для чата — professional real-time messaging.
"""
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Dict, Set
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


# Simple connection manager: user_id -> set of websockets
_connections: Dict[int, Set[WebSocket]] = {}


def _get_user_id(token: str) -> int | None:
    payload = decode_token(token)
    if not payload:
        return None
    uid = payload.get("sub") or payload.get("user_id")
    try:
        return int(uid)
    except (TypeError, ValueError):
        return None


async def _broadcast(user1: int, user2: int, data: dict):
    for uid in (user1, user2):
        if uid in _connections:
            dead = []
            for ws in _connections[uid]:
                try:
                    await ws.send_json(data)
                except Exception as e:
                    logger.warning(f"WebSocket send failed: {e}")
                    dead.append(ws)
            for ws in dead:
                _connections[uid].discard(ws)
            if not _connections[uid]:
                del _connections[uid]


@router.websocket("/ws/chat")
async def chat_ws(
    ws: WebSocket,
    token: str = Query(...),
):
    uid = _get_user_id(token)
    if uid is None:
        await ws.close(code=4001)
        return

    _connections.setdefault(uid, set()).add(ws)
    await ws.accept()

    db: Session | None = None
    try:
        while True:
            data = await ws.receive_json()
            action = data.get("action")

            if db is None:
                db = next(get_db())

            if action == "send":
                receiver = data.get("receiver_id")
                content = (data.get("content") or "")[:256]
                if not content or not receiver:
                    logger.warning(f"WebSocket: Missing content or receiver")
                    continue

                from app.services import chat_service as cs, friends_service as fs
                
                # Проверяем дружбу
                are_friends = fs.is_friend(db, uid, receiver)
                logger.info(f"WebSocket: User {uid} sending to {receiver}, are_friends={are_friends}")
                
                if not are_friends:
                    logger.warning(f"WebSocket: Users {uid} and {receiver} are not friends")
                    continue

                msg = cs.send_message(db, uid, receiver, content)
                logger.info(f"WebSocket: Message {msg.id} saved to DB")

                from app.models.message import Message
                payload = {
                    "type": "msg",
                    "id": msg.id,
                    "sender_id": msg.sender_id,
                    "receiver_id": msg.receiver_id,
                    "content": msg.content,
                    "sender_name": db.query(User).filter(User.id == uid).first().name,
                    "is_read": False,
                    "created_at": msg.created_at.isoformat() if msg.created_at else None,
                }
                logger.info(f"WebSocket: Broadcasting message {msg.id} to users {uid} and {receiver}")
                await _broadcast(uid, receiver, payload)
                logger.info(f"WebSocket: Message {msg.id} broadcasted successfully")

            # Read receipts
            elif action == "read":
                partner = data.get("partner_id")
                if partner:
                    from app.services import chat_service as cs
                    cs.mark_all_read(db, uid, partner)
                    await _broadcast(uid, partner, {
                        "type": "read",
                        "user_id": uid,
                    })

            # Delete message
            elif action == "delete":
                mid = data.get("message_id")
                partner = data.get("partner_id")
                if mid and partner:
                    try:
                        cs.delete_message(db, uid, mid, partner)
                        await _broadcast(uid, partner, {
                            "type": "delete",
                            "message_id": mid,
                        })
                    except Exception as e:
                        logger.warning(f"Delete action failed: {e}")

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}", exc_info=True)
    finally:
        if db:
            db.close()
        if uid in _connections:
            _connections[uid].discard(ws)
            if not _connections[uid]:
                del _connections[uid]
