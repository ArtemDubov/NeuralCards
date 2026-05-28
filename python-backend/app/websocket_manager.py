"""
WebSocket менеджер для real-time чата.
Хранит активные подключения и рассылает сообщения.
"""
import asyncio
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # user_id -> set of websockets
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal(self, user_id: int, message: dict):
        """Отправить сообщение конкретному пользователю."""
        if user_id in self.active_connections:
            disconnected = set()
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.warning(f"WebSocket send failed for user {user_id}: {e}")
                    disconnected.add(ws)
            for ws in disconnected:
                self.active_connections[user_id].discard(ws)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_chat(self, user1_id: int, user2_id: int, message: dict):
        """Отправить сообщение обоим участникам чата."""
        await self.send_personal(user1_id, message)
        await self.send_personal(user2_id, message)


manager = ConnectionManager()
