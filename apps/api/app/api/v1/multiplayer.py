from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.config import get_settings
from app.core.rate_limit import parse_rule
from app.core.security import decode_access_token
from app.db.session import get_session_factory
from app.models.user import Profile, User
from app.services import games
from app.services.multiplayer import Player, Room, broadcast, manager

router = APIRouter(tags=["multiplayer"])

CEFR_PATTERN = ("A1", "A2", "B1", "B2", "C1", "C2")


async def _resolve_user(token: str):
    user_id = decode_access_token(token)
    if user_id is None:
        return None, None
    async with get_session_factory()() as db:
        user = await db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
        if user is None:
            return None, None
        profile = await db.scalar(select(Profile).where(Profile.user_id == user_id))
        return user_id, (profile.display_name if profile else "Learner")


@router.websocket("/ws/quiz")
async def quiz_socket(websocket: WebSocket):
    await websocket.accept()
    token = websocket.query_params.get("token", "")
    user_id, name = await _resolve_user(token)
    if user_id is None:
        await websocket.send_json({"type": "error", "error": "unauthorized"})
        await websocket.close()
        return

    async def send(message: dict) -> None:
        await websocket.send_json(message)

    player = Player(user_id, name, send)
    room: Room = None

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "create":
                settings = get_settings()
                if settings.RATE_LIMIT_ENABLED:
                    limit, window = parse_rule(settings.RATE_LIMIT_MULTIPLAYER)
                    ip = websocket.client.host if websocket.client else "unknown"
                    allowed, _ = await websocket.app.state.rate_limit_storage.hit(
                        "mp_create:{}".format(ip), limit, window
                    )
                    if not allowed:
                        await send({"type": "error", "error": "rate_limited"})
                        continue
                room = manager.create(user_id)
                room.add_player(player)
                await send({"type": "created", **room.lobby_state()})

            elif action == "join":
                room = manager.get(str(data.get("code", "")))
                if room is None or room.phase != "lobby":
                    await send({"type": "error", "error": "room_not_found"})
                    room = None
                    continue
                room.add_player(player)
                await broadcast(room, {"type": "lobby", **room.lobby_state()})

            elif action == "start" and room is not None and room.host_id == user_id:
                level = data.get("level", "A1")
                if level not in CEFR_PATTERN:
                    level = "A1"
                async with get_session_factory()() as db:
                    questions = await games.build_public_quiz(db, level, count=8)
                if not questions:
                    await send({"type": "error", "error": "not_enough_words"})
                    continue
                room.start(questions)
                await broadcast(room, {"type": "question", **room.current_question()})

            elif action == "answer" and room is not None:
                all_done = room.submit_answer(
                    user_id, int(data.get("index", -1)), int(data.get("option", -1))
                )
                if all_done:
                    await broadcast(
                        room,
                        {
                            "type": "reveal",
                            "answer_index": room.reveal(),
                            "scoreboard": room.scoreboard(),
                        },
                    )

            elif action == "next" and room is not None and room.host_id == user_id:
                if room.advance():
                    await broadcast(room, {"type": "question", **room.current_question()})
                else:
                    await broadcast(
                        room, {"type": "finished", "scoreboard": room.scoreboard()}
                    )
    except WebSocketDisconnect:
        pass
    finally:
        if room is not None:
            room.remove_player(user_id)
            if room.players:
                await broadcast(room, {"type": "lobby", **room.lobby_state()})
            else:
                manager.drop(room.code)
