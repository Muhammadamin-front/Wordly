"""Real-time multiplayer quiz — WebSocket transport.

`Room` (services/multiplayer.py) is pure game logic with no I/O. This module
is the thin adapter around it: load a room from the store, mutate it through
a Room method, save it back (retrying on a CAS conflict), and publish the
resulting message so every API worker with a live connection into this room
delivers it to its own sockets — this connection included, since it also
subscribes to the room's channel rather than being written to directly. That
symmetry is also why a per-player message (the mistake review at game end)
is folded into the room-wide `finished` broadcast, keyed by user_id, instead
of being sent to one socket directly: whichever worker's timer happens to
finish the game may not be the worker holding that player's connection.

Phase auto-advance (countdown -> question, a question's timer running out,
question_result/leaderboard auto-advancing) is server-driven, not triggered
by any client message — see services/multiplayer_timers.py.
"""
import asyncio
import time
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.config import get_settings
from app.core.rate_limit import client_ip, parse_rule, ws_connect_allowed
from app.core.security import decode_access_token, utcnow
from app.db.session import get_session_factory
from app.models.multiplayer import MPAnswer, MPPlayer, MPQuestion, MPSession
from app.models.user import Profile, User
from app.services import games
from app.services.multiplayer import DEFAULT_QUESTION_COUNT, Player, Room, generate_room_code
from app.services.multiplayer_store import room_version
from app.services.multiplayer_timers import schedule_phase_timer

router = APIRouter(tags=["multiplayer"])

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
MAX_CODE_ATTEMPTS = 5


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


def _ms(epoch_seconds: float) -> int:
    return round(epoch_seconds * 1000)


def _phase_message(room: Room) -> Optional[dict]:
    """The message a client should see right now for whatever phase the
    room is in — used both for normal broadcasts and to resume a
    reconnecting player straight into the live game."""
    now_ms = _ms(time.time())
    if room.phase == "countdown":
        return {"type": "countdown", "ends_at": _ms(room.countdown_ends_at), "server_now": now_ms}
    if room.phase == "question":
        q = room.current_question()
        return {**q, "type": "question", "ends_at": _ms(q["ends_at"]), "started_at": _ms(q["started_at"]), "server_now": now_ms} if q else None
    if room.phase == "question_result":
        r = room.question_result_payload()
        return {**r, "type": "question_result", "ends_at": _ms(r["ends_at"]), "server_now": now_ms}
    if room.phase == "leaderboard":
        b = room.leaderboard_payload()
        return {**b, "type": "leaderboard", "ends_at": _ms(b["ends_at"]), "server_now": now_ms}
    if room.phase == "finished":
        return _finished_message(room)
    return {"type": "lobby", **room.lobby_state()}


def _finished_message(room: Room) -> dict:
    board = room.scoreboard()
    return {
        "type": "finished",
        "board": board,
        "summaries": room.summaries(),
        "review": {str(uid): room.mistakes_review(uid) for uid in room.players},
    }


async def _write_game_start(db_factory, room: Room, code: str, level: str) -> None:
    """Durable history, written once at countdown start — never on the
    per-answer hot path. `room.session_db_id` is set here so later writes
    (per-question answers, final results) know which session row to use."""
    async with db_factory() as db:
        session = MPSession(
            room_code=code,
            host_user_id=room.host_id,
            mode=room.mode,
            cefr_level=level,
            timer_seconds=room.timer_seconds,
            question_count=len(room.questions),
            player_count=len(room.players),
            started_at=utcnow(),
        )
        db.add(session)
        await db.flush()
        for index, q in enumerate(room.questions):
            db.add(
                MPQuestion(
                    session_id=session.id,
                    question_index=index,
                    category=q.get("category", room.mode),
                    prompt=q["prompt"],
                    options=q["options"],
                    answer_index=q["answer_index"],
                    explanation=q.get("explanation"),
                )
            )
        await db.commit()
        room.session_db_id = str(session.id)


async def _write_round_answers(db_factory, room: Room, question_index: int) -> None:
    """Bulk-insert this question's answers — at most one per player, once
    per question, right when the round closes (not per answer)."""
    if room.session_db_id is None:
        return
    round_answers = [a for a in room.answers if a.question_index == question_index]
    if not round_answers:
        return
    async with db_factory() as db:
        question_id = await db.scalar(
            select(MPQuestion.id).where(
                MPQuestion.session_id == UUID(room.session_db_id),
                MPQuestion.question_index == question_index,
            )
        )
        if question_id is None:
            return
        for a in round_answers:
            db.add(
                MPAnswer(
                    session_id=UUID(room.session_db_id),
                    question_id=question_id,
                    user_id=a.user_id,
                    option_index=a.option_index,
                    is_correct=a.correct,
                    points_awarded=a.points,
                    streak_at_answer=a.streak_after,
                    response_ms=a.response_ms,
                )
            )
        await db.commit()


async def _write_game_finished(db_factory, room: Room, *, abandoned: bool = False) -> None:
    if room.session_db_id is None:
        return
    async with db_factory() as db:
        session = await db.get(MPSession, UUID(room.session_db_id))
        if session is None or session.status != "in_progress":
            return
        session.status = "abandoned" if abandoned else "finished"
        session.finished_at = utcnow()
        summaries = room.summaries()
        for player in room.players.values():
            summary = summaries.get(str(player.user_id))
            if summary is None:
                continue
            db.add(
                MPPlayer(
                    session_id=session.id,
                    user_id=player.user_id,
                    display_name_snapshot=player.name,
                    final_score=summary["score"],
                    final_rank=summary["rank"] or 0,
                    correct_count=summary["correct_count"],
                    answered_count=len([a for a in room.answers if a.user_id == player.user_id and a.option_index is not None]),
                    best_streak=summary["best_streak"],
                    avg_response_ms=summary["avg_response_ms"],
                    fastest_response_ms=summary["fastest_response_ms"],
                    left_early=not player.connected,
                )
            )
        await db.commit()


@router.websocket("/ws/quiz")
async def quiz_socket(websocket: WebSocket):
    await websocket.accept()

    settings = get_settings()
    if settings.RATE_LIMIT_ENABLED and not await ws_connect_allowed(
        websocket, websocket.app.state.rate_limit_storage, settings.RATE_LIMIT_WS_CONNECT
    ):
        await websocket.send_json({"type": "error", "error": "rate_limited"})
        await websocket.close()
        return

    token = websocket.query_params.get("token", "")
    user_id, name = await _resolve_user(token)
    if user_id is None:
        await websocket.send_json({"type": "error", "error": "unauthorized"})
        await websocket.close()
        return

    app_state = websocket.app.state
    store = app_state.mp_store
    pubsub = app_state.mp_pubsub
    lock = app_state.mp_lock
    db_factory = get_session_factory()

    code: Optional[str] = None

    async def deliver(message: dict) -> None:
        try:
            await websocket.send_json(message)
        except Exception:
            pass  # the disconnect handler below deals with a dead socket

    async def enter_phase(room: Room, this_code: str) -> None:
        """Publishes whatever `room.phase` implies right now, and — if that
        phase has a deadline — schedules the single-flight timer that will
        fire the next transition. Called after every mutation that can
        change phase, so it's the one place new timers get spawned."""
        message = _phase_message(room)
        if message is not None:
            await pubsub.publish(this_code, message)
        deadline = room.next_deadline()
        if deadline is not None:
            asyncio.create_task(
                schedule_phase_timer(lock, this_code, room.phase, deadline, lambda: fire(this_code, room.phase, deadline))
            )

    async def fire(this_code: str, expected_phase: str, expected_deadline: float) -> None:
        """A scheduled phase timer firing. Reloads first — the game may
        already have moved on (e.g. every player answered before the timer
        did, or the host used `skip`) — and no-ops if so."""
        room = await store.load(this_code)
        if room is None or room.phase != expected_phase or room.next_deadline() != expected_deadline:
            return
        closing_question = room.current if room.phase == "question" else None
        room.force_advance()
        became_result = closing_question is not None and room.phase == "question_result"
        became_finished = room.phase == "finished"
        # Write history only once the save has actually won — otherwise a
        # concurrent loser (see below) would attempt the same insert twice
        # and collide with mp_answers'/mp_players' unique constraints.
        ok = await store.save(room, expected_version=room_version(room))
        if ok:
            if became_result:
                await _write_round_answers(db_factory, room, closing_question)
            if became_finished:
                await _write_game_finished(db_factory, room)
            await enter_phase(room, this_code)
        # A CAS loss here means another worker's timer already performed
        # this exact transition (both raced the same lock and only one
        # could win it upstream) — its enter_phase() already published.

    async def update_room(mutate, target_code: Optional[str]) -> Optional[Room]:
        """The load -> mutate -> save retry loop every mutating action uses.
        `mutate(room)` is applied to a freshly loaded room on every attempt,
        so a CAS conflict genuinely re-applies the intended change against
        the latest state rather than clobbering a concurrent writer.
        `target_code` is passed explicitly rather than closing over the
        connection's `code` — `join` calls this before `code` is set (it's
        what *establishes* code for a first-time joiner)."""
        if target_code is None:
            return None
        for _ in range(5):
            room = await store.load(target_code)
            if room is None:
                return None
            mutate(room)
            if await store.save(room, expected_version=room_version(room)):
                return room
        return room

    async def handle_disconnect_grace(this_code: str, target_user_id: UUID, deadline: float) -> None:
        room = await store.load(this_code)
        if room is None:
            return
        player = room.players.get(target_user_id)
        if player is None or player.connected:
            return  # already reconnected, or already removed
        new_host = room.remove_player(target_user_id)
        if not room.players:
            await store.delete(this_code)
            if room.session_db_id is not None:
                await _write_game_finished(db_factory, room, abandoned=True)
            return
        if await store.save(room, expected_version=room_version(room)):
            await pubsub.publish(
                this_code,
                {"type": "lobby", **room.lobby_state()}
                if room.phase == "lobby"
                else {"type": "player_status", "user_id": str(target_user_id), "connected": False},
            )
            if new_host is not None:
                await pubsub.publish(this_code, {"type": "host_changed", "host_id": str(new_host), "reason": "disconnected"})

    async def pubsub_handler(message: dict) -> None:
        await deliver(message)

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "create":
                settings = get_settings()
                if settings.RATE_LIMIT_ENABLED:
                    limit, window = parse_rule(settings.RATE_LIMIT_MULTIPLAYER)
                    ip = client_ip(websocket)
                    allowed, _ = await websocket.app.state.rate_limit_storage.hit(
                        "mp_create:{}".format(ip), limit, window
                    )
                    if not allowed:
                        await deliver({"type": "error", "error": "rate_limited"})
                        continue

                created_room = None
                for _ in range(MAX_CODE_ATTEMPTS):
                    candidate = Room(generate_room_code(), user_id)
                    candidate.add_player(Player(user_id, name))
                    if await store.create(candidate):
                        created_room = candidate
                        break
                if created_room is None:
                    await deliver({"type": "error", "error": "room_not_found"})
                    continue
                code = created_room.code
                await pubsub.subscribe(code, pubsub_handler)
                await deliver({"type": "lobby", **created_room.lobby_state()})

            elif action == "join":
                join_code = str(data.get("code", "")).strip().upper()
                existing = await store.load(join_code)
                if existing is None:
                    await deliver({"type": "error", "error": "room_not_found"})
                    continue
                is_known_player = user_id in existing.players
                if existing.phase != "lobby" and not is_known_player:
                    await deliver({"type": "error", "error": "already_started"})
                    continue

                result = {"ok": True}

                def mutate(room: Room, result=result) -> None:
                    result["ok"] = room.add_player(Player(user_id, name))

                room = await update_room(mutate, join_code)
                if room is None:
                    await deliver({"type": "error", "error": "room_not_found"})
                    continue
                if not result["ok"]:
                    await deliver({"type": "error", "error": "room_full"})
                    continue

                code = join_code
                await pubsub.subscribe(code, pubsub_handler)
                if room.phase == "lobby":
                    await pubsub.publish(code, {"type": "lobby", **room.lobby_state()})
                else:
                    # Reconnecting mid-game: everyone else just needs the
                    # presence update; this connection resumes straight into
                    # the live phase.
                    await pubsub.publish(
                        code, {"type": "player_status", "user_id": str(user_id), "connected": True}
                    )
                    resume = _phase_message(room)
                    if resume is not None:
                        await deliver(resume)

            elif action == "leave" and code is not None:
                leave_code = code
                result: dict = {"new_host": None}

                def mutate(room: Room, result=result) -> None:
                    result["new_host"] = room.remove_player(user_id)

                room = await update_room(mutate, leave_code)
                code = None
                if room is None:
                    continue
                if not room.players:
                    await store.delete(leave_code)
                    if room.session_db_id is not None:
                        await _write_game_finished(db_factory, room, abandoned=True)
                else:
                    await pubsub.publish(
                        leave_code,
                        {"type": "lobby", **room.lobby_state()}
                        if room.phase == "lobby"
                        else {"type": "player_status", "user_id": str(user_id), "connected": False},
                    )
                    if result["new_host"] is not None:
                        await pubsub.publish(
                            leave_code,
                            {"type": "host_changed", "host_id": str(result["new_host"]), "reason": "left"},
                        )
                await pubsub.unsubscribe(leave_code, pubsub_handler)

            elif action == "start" and code is not None:
                room = await store.load(code)
                if room is None or room.host_id != user_id or room.phase != "lobby":
                    await deliver({"type": "error", "error": "forbidden"})
                    continue
                level = data.get("level", "A1")
                if level not in CEFR_LEVELS:
                    level = "A1"
                mode = data.get("mode", "vocab")
                if mode not in games.QUIZ_MODES:
                    mode = "vocab"
                timer_seconds = data.get("timer_seconds", 15)

                async with db_factory() as db:
                    questions = await games.build_quiz(db, mode, level, count=DEFAULT_QUESTION_COUNT)
                if not questions:
                    await deliver({"type": "error", "error": "not_enough_words"})
                    continue

                await _write_game_start(db_factory, room, code, level)
                room.start(questions, mode, timer_seconds)
                if await store.save(room, expected_version=room_version(room)):
                    await enter_phase(room, code)

            elif action == "answer" and code is not None:
                answer_index = int(data.get("index", -1))
                option = int(data.get("option", -1))
                result = {"all_answered": False}

                def mutate(room: Room, result=result) -> None:
                    result["all_answered"] = room.submit_answer(user_id, answer_index, option)

                room = await update_room(mutate, code)
                if room is not None and result["all_answered"] and room.phase == "question":
                    closing_question = room.current
                    room.force_advance()
                    became_result = room.phase == "question_result"
                    if await store.save(room, expected_version=room_version(room)):
                        if became_result:
                            await _write_round_answers(db_factory, room, closing_question)
                        await enter_phase(room, code)

            elif action == "skip" and code is not None:
                room = await store.load(code)
                if room is None or room.host_id != user_id or room.phase in ("lobby", "finished"):
                    await deliver({"type": "error", "error": "forbidden"})
                    continue
                closing_question = room.current if room.phase == "question" else None
                room.force_advance()
                became_result = closing_question is not None and room.phase == "question_result"
                became_finished = room.phase == "finished"
                if await store.save(room, expected_version=room_version(room)):
                    if became_result:
                        await _write_round_answers(db_factory, room, closing_question)
                    if became_finished:
                        await _write_game_finished(db_factory, room)
                    await enter_phase(room, code)

    except WebSocketDisconnect:
        pass
    finally:
        if code is not None:
            settings = get_settings()

            def mutate(room: Room) -> None:
                room.mark_disconnected(user_id)

            room = await update_room(mutate, code)
            if room is not None:
                await pubsub.publish(
                    code,
                    {"type": "lobby", **room.lobby_state()}
                    if room.phase == "lobby"
                    else {"type": "player_status", "user_id": str(user_id), "connected": False},
                )
                deadline = time.time() + settings.MULTIPLAYER_RECONNECT_GRACE_SECONDS
                asyncio.create_task(
                    schedule_phase_timer(
                        lock,
                        code,
                        "disconnect:{}".format(user_id),
                        deadline,
                        lambda: handle_disconnect_grace(code, user_id, deadline),
                    )
                )
            await pubsub.unsubscribe(code, pubsub_handler)
