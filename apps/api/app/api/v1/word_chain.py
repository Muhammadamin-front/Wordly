"""Real-time transport for the server-authoritative word-chain game."""

from __future__ import annotations

import asyncio
import random
import time
from datetime import timedelta
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import client_ip, parse_rule, rate_limit, ws_connect_allowed
from app.core.security import decode_access_token, utcnow
from app.db.session import get_db, get_session_factory
from app.models.user import Profile, User
from app.models.word_chain import WordChainInvitation
from app.schemas.social import MessageOut
from app.schemas.word_chain import (
    WordChainInvitationCreate,
    WordChainInvitationJoinOut,
    WordChainInvitationOut,
)
from app.services.multiplayer_timers import schedule_phase_timer
from app.services.social import friend_ids
from app.services.word_chain import (
    WordChainConfig,
    WordChainPlayer,
    WordChainRoom,
    bot_choice,
    generate_word_chain_code,
)
from app.services.word_chain_dictionary import CorpusDictionaryService
from app.services.word_chain_store import word_chain_room_version

router = APIRouter(tags=["word-chain"])

MAX_CODE_ATTEMPTS = 5
MAX_CAS_ATTEMPTS = 5
AUTH_TIMEOUT_SECONDS = 5


def _room_accepts_private_invite(room: Optional[WordChainRoom], sender_id: UUID) -> bool:
    return bool(
        room is not None
        and room.status == "waiting"
        and not room.online_match
        and room.host_id == sender_id
    )


def _invitation_out(invitation: WordChainInvitation, sender_name: str) -> WordChainInvitationOut:
    return WordChainInvitationOut(
        invitation_id=invitation.id,
        sender_id=invitation.sender_id,
        sender_name=sender_name,
        room_code=invitation.room_code,
        expires_at=invitation.expires_at,
        created_at=invitation.created_at,
    )


async def _sender_names(db: AsyncSession, invitations: list[WordChainInvitation]) -> dict[UUID, str]:
    sender_ids = {invitation.sender_id for invitation in invitations}
    if not sender_ids:
        return {}
    rows = await db.execute(select(Profile.user_id, Profile.display_name).where(Profile.user_id.in_(sender_ids)))
    return {user_id: display_name for user_id, display_name in rows}


@router.post(
    "/word-chain/invitations",
    response_model=WordChainInvitationOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("multiplayer"))],
)
async def create_word_chain_invitation(
    payload: WordChainInvitationCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Invite one accepted friend to the caller's waiting private game."""

    room_code = payload.room_code.strip().upper()
    if payload.invitee_id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot invite yourself")
    if payload.invitee_id not in await friend_ids(db, user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can invite friends only")

    room = await request.app.state.word_chain_store.load(room_code)
    if not _room_accepts_private_invite(room, user.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This private game is no longer waiting for players",
        )

    now = utcnow()
    existing = await db.scalar(
        select(WordChainInvitation)
        .where(
            WordChainInvitation.sender_id == user.id,
            WordChainInvitation.recipient_id == payload.invitee_id,
            WordChainInvitation.room_code == room_code,
            WordChainInvitation.status == "pending",
        )
        .order_by(WordChainInvitation.created_at.desc())
    )
    if existing is None:
        invitation = WordChainInvitation(
            sender_id=user.id,
            recipient_id=payload.invitee_id,
            room_code=room_code,
            expires_at=now + timedelta(seconds=get_settings().WORD_CHAIN_INVITATION_TTL_SECONDS),
        )
        db.add(invitation)
    else:
        invitation = existing
        invitation.expires_at = now + timedelta(
            seconds=get_settings().WORD_CHAIN_INVITATION_TTL_SECONDS
        )
        invitation.responded_at = None
    await db.commit()
    await db.refresh(invitation)

    sender_name = user.profile.display_name if user.profile else "Learner"
    return _invitation_out(invitation, sender_name)


@router.get(
    "/word-chain/invitations",
    response_model=list[WordChainInvitationOut],
    dependencies=[Depends(rate_limit("multiplayer"))],
)
async def list_word_chain_invitations(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List current, still-joinable Word Chain invitations for this learner."""

    now = utcnow()
    invitations = list(
        await db.scalars(
            select(WordChainInvitation)
            .where(
                WordChainInvitation.recipient_id == user.id,
                WordChainInvitation.status == "pending",
            )
            .order_by(WordChainInvitation.created_at.desc())
        )
    )
    current_friend_ids = set(await friend_ids(db, user.id))
    active: list[WordChainInvitation] = []
    for invitation in invitations:
        room = await request.app.state.word_chain_store.load(invitation.room_code)
        if (
            invitation.expires_at <= now
            or invitation.sender_id not in current_friend_ids
            or not _room_accepts_private_invite(room, invitation.sender_id)
        ):
            invitation.status = "expired"
            continue
        active.append(invitation)
    if len(active) != len(invitations):
        await db.commit()

    names = await _sender_names(db, active)
    return [_invitation_out(invitation, names.get(invitation.sender_id, "Learner")) for invitation in active]


@router.post(
    "/word-chain/invitations/{invitation_id}/accept",
    response_model=WordChainInvitationJoinOut,
    dependencies=[Depends(rate_limit("multiplayer"))],
)
async def accept_word_chain_invitation(
    invitation_id: UUID,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invitation = await db.get(WordChainInvitation, invitation_id)
    if (
        invitation is None
        or invitation.recipient_id != user.id
        or invitation.status != "pending"
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    room = await request.app.state.word_chain_store.load(invitation.room_code)
    is_current_friend = invitation.sender_id in await friend_ids(db, user.id)
    if (
        invitation.expires_at <= utcnow()
        or not is_current_friend
        or not _room_accepts_private_invite(room, invitation.sender_id)
    ):
        invitation.status = "expired"
        await db.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This invitation is no longer available")

    invitation.status = "accepted"
    invitation.responded_at = utcnow()
    await db.commit()
    return WordChainInvitationJoinOut(room_code=invitation.room_code)


@router.post(
    "/word-chain/invitations/{invitation_id}/decline",
    response_model=MessageOut,
    dependencies=[Depends(rate_limit("multiplayer"))],
)
async def decline_word_chain_invitation(
    invitation_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invitation = await db.get(WordChainInvitation, invitation_id)
    if (
        invitation is None
        or invitation.recipient_id != user.id
        or invitation.status != "pending"
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    invitation.status = "declined"
    invitation.responded_at = utcnow()
    await db.commit()
    return MessageOut(message="Invitation declined")


async def _resolve_user(token: str):
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    async with get_session_factory()() as db:
        user = await db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
        if user is None:
            return None
        profile = await db.scalar(select(Profile).where(Profile.user_id == user_id))
        return (
            user_id,
            profile.display_name if profile else "Learner",
            profile.avatar_url if profile else None,
        )


def _config_from_settings(settings) -> WordChainConfig:
    return WordChainConfig(
        starting_time=settings.WORD_CHAIN_STARTING_TIME,
        time_decrease_per_round=settings.WORD_CHAIN_TIME_DECREASE_PER_ROUND,
        minimum_time=settings.WORD_CHAIN_MINIMUM_TIME,
        min_players=settings.WORD_CHAIN_MIN_PLAYERS,
        max_players=settings.WORD_CHAIN_MAX_PLAYERS,
        minimum_word_length=settings.WORD_CHAIN_MINIMUM_WORD_LENGTH,
        difficult_letter_threshold=settings.WORD_CHAIN_DIFFICULT_LETTER_THRESHOLD,
        lives_per_player=settings.WORD_CHAIN_LIVES_PER_PLAYER,
        streak_bonus_threshold=settings.WORD_CHAIN_STREAK_BONUS_THRESHOLD,
        streak_time_bonus=settings.WORD_CHAIN_STREAK_TIME_BONUS,
        bot_min_delay=settings.WORD_CHAIN_BOT_MIN_DELAY,
        bot_max_delay=settings.WORD_CHAIN_BOT_MAX_DELAY,
    )


@router.websocket("/ws/word-chain")
async def word_chain_socket(websocket: WebSocket):
    await websocket.accept()
    settings = get_settings()

    if settings.RATE_LIMIT_ENABLED and not await ws_connect_allowed(
        websocket, websocket.app.state.rate_limit_storage, settings.RATE_LIMIT_WS_CONNECT
    ):
        await websocket.send_json({"type": "word_chain_error", "error": "rate_limited"})
        await websocket.close(code=1008)
        return

    # Browser WebSockets cannot set an Authorization header. Authenticate in
    # the first frame instead of placing a bearer token in the URL where it can
    # leak through access logs, browser history, and monitoring tools.
    try:
        auth_frame = await asyncio.wait_for(websocket.receive_json(), timeout=AUTH_TIMEOUT_SECONDS)
    except WebSocketDisconnect:
        return
    except (asyncio.TimeoutError, ValueError, RuntimeError):
        await websocket.close(code=1008)
        return
    if not isinstance(auth_frame, dict) or auth_frame.get("action") != "authenticate":
        await websocket.send_json({"type": "word_chain_error", "error": "unauthorized"})
        await websocket.close(code=1008)
        return
    identity = await _resolve_user(str(auth_frame.get("token", "")))
    if identity is None:
        await websocket.send_json({"type": "word_chain_error", "error": "unauthorized"})
        await websocket.close(code=1008)
        return
    user_id, name, avatar_url = identity
    connection_id = uuid4().hex
    await websocket.send_json({"type": "authenticated"})

    app_state = websocket.app.state
    store = app_state.word_chain_store
    matchmaker = app_state.word_chain_matchmaker
    pubsub = app_state.mp_pubsub
    lock = app_state.mp_lock
    dictionary = CorpusDictionaryService(get_session_factory(), getattr(app_state, "cache", None))
    code: Optional[str] = None

    async def deliver(message: dict) -> None:
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast_state(room: WordChainRoom) -> None:
        await pubsub.publish("wc:" + room.code, {"type": "word_chain_state", "state": room.public_state()})

    async def schedule_room(room: WordChainRoom) -> None:
        if room.status != "playing" or room.current_player_id is None or room.turn_ends_at is None:
            return
        expected_turn = room.turn_number
        expected_player = room.current_player_id
        expected_deadline = room.turn_ends_at
        asyncio.create_task(
            schedule_phase_timer(
                lock,
                "wc:" + room.code,
                f"turn:{expected_turn}:{expected_player}",
                expected_deadline,
                lambda: fire_timeout(room.code, expected_turn, expected_player, expected_deadline),
            )
        )
        current = room.players[expected_player]
        if current.is_bot:
            delay = random.uniform(room.config.bot_min_delay, room.config.bot_max_delay)
            answer_at = min(expected_deadline - 0.1, time.time() + delay)
            asyncio.create_task(
                schedule_phase_timer(
                    lock,
                    "wc:" + room.code,
                    f"bot:{expected_turn}:{expected_player}",
                    answer_at,
                    lambda: fire_bot(room.code, expected_turn, expected_player),
                )
            )

    async def commit_and_broadcast(room: WordChainRoom) -> bool:
        if not await store.save(room, expected_version=word_chain_room_version(room)):
            return False
        await broadcast_state(room)
        await schedule_room(room)
        return True

    async def create_room(*, online_match: bool = False) -> Optional[WordChainRoom]:
        """Create a private room or a queue-visible online room safely."""

        created = None
        for _ in range(MAX_CODE_ATTEMPTS):
            room = WordChainRoom(
                generate_word_chain_code(),
                user_id,
                config=_config_from_settings(settings),
                online_match=online_match,
            )
            room.add_player(
                WordChainPlayer(
                    user_id,
                    name,
                    avatar_url=avatar_url,
                    connection_id=connection_id,
                )
            )
            if await store.create(room):
                created = room
                break
        if created is None or not online_match:
            return created
        try:
            await matchmaker.enqueue(created.code)
        except Exception:
            # Do not leave a user in a room that looks like it is searching
            # when the shared queue was unavailable.
            await store.delete(created.code, expected_version=word_chain_room_version(created))
            return None
        return created

    async def join_room(
        room_code: str, *, online_only: bool = False
    ) -> tuple[Optional[WordChainRoom], Optional[str]]:
        """Attach this socket to one room using the room store's CAS version."""

        for _ in range(MAX_CAS_ATTEMPTS):
            room = await store.load(room_code)
            if room is None:
                return None, "room_not_found"
            if online_only:
                active_players = sum(
                    1 for player in room.players.values() if player.connected and not player.eliminated
                )
                if (
                    not room.online_match
                    or room.status != "waiting"
                    or active_players >= room.config.min_players
                ):
                    return None, "room_not_found"
            known = user_id in room.players
            if room.status != "waiting" and not known:
                return None, "already_started"
            joined = room.add_player(
                WordChainPlayer(
                    user_id,
                    name,
                    avatar_url=avatar_url,
                    connection_id=connection_id,
                )
            )
            if not joined:
                return None, "room_full"
            if await store.save(room, expected_version=word_chain_room_version(room)):
                return room, None
        return None, "room_not_found"

    async def start_online_game(room_code: str) -> None:
        """Start a matched public game without granting host-only privileges."""

        try:
            counts = await dictionary.letter_counts()
        except Exception:
            counts = {}
        if not any(counts.values()):
            await pubsub.publish(
                "wc:" + room_code,
                {"type": "word_chain_error", "error": "dictionary_unavailable"},
            )
            return

        for _ in range(MAX_CAS_ATTEMPTS):
            room = await store.load(room_code)
            if room is None or not room.online_match or room.status != "waiting":
                return
            ready = [player for player in room.players.values() if player.connected and not player.eliminated]
            if len(ready) < room.config.min_players:
                # A player can leave in the small window between the second
                # player's CAS join and this automatic start. Put the
                # remaining lobby back in the shared queue rather than
                # leaving that player in an unreachable "matched" room.
                await matchmaker.enqueue(room.code)
                return
            try:
                room.start(counts)
            except ValueError:
                await pubsub.publish(
                    "wc:" + room_code,
                    {"type": "word_chain_error", "error": "not_enough_players"},
                )
                return
            if await commit_and_broadcast(room):
                return

    async def fire_timeout(
        room_code: str, expected_turn: int, expected_player: UUID, expected_deadline: float
    ) -> None:
        # A reconnect/presence update can win the CAS at the same moment the
        # deadline fires. Reload and retry the exact transition so that one
        # benign concurrent write cannot leave an expired turn stalled.
        for _ in range(MAX_CAS_ATTEMPTS):
            room = await store.load(room_code)
            if (
                room is None
                or room.status != "playing"
                or room.turn_number != expected_turn
                or room.current_player_id != expected_player
                or room.turn_ends_at != expected_deadline
            ):
                return
            if not room.expire_current_turn():
                return
            if await commit_and_broadcast(room):
                return

    async def fire_bot(room_code: str, expected_turn: int, expected_player: UUID) -> None:
        for _ in range(MAX_CAS_ATTEMPTS):
            room = await store.load(room_code)
            if room is None:
                return
            if (
                room.status != "playing"
                or room.turn_number != expected_turn
                or room.current_player_id != expected_player
            ):
                return
            try:
                candidates = await dictionary.candidate_words(room.required_letter, room.used_words)
            except Exception:
                # Do not eliminate a bot simply because the dictionary/cache
                # backend had a transient failure. Its normal server timer
                # remains the last-resort transition.
                return
            choice = bot_choice(candidates, room.required_letter, room.used_words)
            if choice is None:
                if room.eliminate_bot_without_word(expected_player) and await commit_and_broadcast(room):
                    return
                continue
            result = room.submit_validated_word(expected_player, choice, dictionary_valid=True)
            if not result.accepted:
                return
            if await commit_and_broadcast(room):
                return

    async def handle_disconnect_grace(
        room_code: str, target_user_id: UUID, expected_connection_id: str
    ) -> None:
        for _ in range(MAX_CAS_ATTEMPTS):
            room = await store.load(room_code)
            if room is None:
                return
            player = room.players.get(target_user_id)
            if (
                player is None
                or player.connected
                or player.connection_id != expected_connection_id
            ):
                return
            room.permanently_disconnect(target_user_id)
            if not room.players:
                if await store.delete(room_code, expected_version=word_chain_room_version(room)):
                    return
                continue
            if await commit_and_broadcast(room):
                return

    async def pubsub_handler(message: dict) -> None:
        await deliver(message)

    try:
        while True:
            data = await websocket.receive_json()
            if not isinstance(data, dict):
                await deliver({"type": "word_chain_error", "error": "forbidden"})
                continue
            action = data.get("action")

            if action == "create":
                if code is not None:
                    await deliver({"type": "word_chain_error", "error": "forbidden"})
                    continue
                if settings.RATE_LIMIT_ENABLED:
                    limit, window = parse_rule(settings.RATE_LIMIT_MULTIPLAYER)
                    allowed, _ = await app_state.rate_limit_storage.hit(
                        "wc_create:" + client_ip(websocket), limit, window
                    )
                    if not allowed:
                        await deliver({"type": "word_chain_error", "error": "rate_limited"})
                        continue
                created = await create_room()
                if created is None:
                    await deliver({"type": "word_chain_error", "error": "room_not_found"})
                    continue
                code = created.code
                await pubsub.subscribe("wc:" + code, pubsub_handler)
                await deliver({"type": "word_chain_state", "state": created.public_state()})

            elif action == "join":
                # A socket may own one room only. Letting it silently switch
                # rooms leaves a connected ghost in the first room.
                if code is not None:
                    await deliver({"type": "word_chain_error", "error": "forbidden"})
                    continue
                join_code = str(data.get("code", "")).strip().upper()[:6]
                room, join_error = await join_room(join_code)
                if room is None:
                    await deliver({"type": "word_chain_error", "error": join_error or "room_not_found"})
                    continue
                code = join_code
                await pubsub.subscribe("wc:" + code, pubsub_handler)
                await broadcast_state(room)
                await schedule_room(room)
                if room.online_match:
                    if room.public_state()["matchmaking_status"] == "searching":
                        await matchmaker.enqueue(code)
                    else:
                        await matchmaker.remove(code)
                        await start_online_game(code)

            elif action == "find_match":
                if code is not None:
                    await deliver({"type": "word_chain_error", "error": "forbidden"})
                    continue
                if settings.RATE_LIMIT_ENABLED:
                    limit, window = parse_rule(settings.RATE_LIMIT_MULTIPLAYER)
                    allowed, _ = await app_state.rate_limit_storage.hit(
                        "wc_match:" + client_ip(websocket), limit, window
                    )
                    if not allowed:
                        await deliver({"type": "word_chain_error", "error": "rate_limited"})
                        continue

                matched = False
                for _ in range(MAX_CAS_ATTEMPTS):
                    candidate_code = await matchmaker.claim()
                    if candidate_code is None:
                        created = await create_room(online_match=True)
                        if created is None:
                            break
                        code = created.code
                        await pubsub.subscribe("wc:" + code, pubsub_handler)
                        await deliver({"type": "word_chain_state", "state": created.public_state()})
                        matched = True
                        break

                    room, _join_error = await join_room(candidate_code, online_only=True)
                    if room is None:
                        # A host can cancel exactly after Redis grants this
                        # claim. Discard the stale code and keep looking.
                        continue
                    code = candidate_code
                    await pubsub.subscribe("wc:" + code, pubsub_handler)
                    await broadcast_state(room)
                    await schedule_room(room)
                    if room.public_state()["matchmaking_status"] == "searching":
                        # The queued host disconnected between its Redis claim
                        # and this CAS join. This player becomes the waiting
                        # host instead of being stranded in a hidden lobby.
                        await matchmaker.enqueue(code)
                    else:
                        await start_online_game(code)
                    matched = True
                    break
                if not matched:
                    await deliver({"type": "word_chain_error", "error": "room_not_found"})

            elif action == "add_bot" and code is not None:
                for _ in range(MAX_CAS_ATTEMPTS):
                    room = await store.load(code)
                    if room is None:
                        break
                    if (
                        not room.connection_matches(user_id, connection_id)
                        or room.host_id != user_id
                        or room.status != "waiting"
                        or room.online_match
                    ):
                        await deliver({"type": "word_chain_error", "error": "forbidden"})
                        break
                    if not settings.WORD_CHAIN_BOT_ENABLED or room.add_bot() is None:
                        await deliver({"type": "word_chain_error", "error": "room_full"})
                        break
                    if await commit_and_broadcast(room):
                        break

            elif action == "start" and code is not None:
                # Authorize before an expensive corpus scan, then re-check on
                # each CAS retry in case the lobby changed while it ran.
                snapshot = await store.load(code)
                if snapshot is None:
                    await deliver({"type": "word_chain_error", "error": "room_not_found"})
                    continue
                if (
                    not snapshot.connection_matches(user_id, connection_id)
                    or snapshot.host_id != user_id
                    or snapshot.status != "waiting"
                ):
                    await deliver({"type": "word_chain_error", "error": "forbidden"})
                    continue
                try:
                    counts = await dictionary.letter_counts()
                except Exception:
                    counts = {}
                if not any(counts.values()):
                    await deliver({"type": "word_chain_error", "error": "dictionary_unavailable"})
                    continue
                for _ in range(MAX_CAS_ATTEMPTS):
                    room = await store.load(code)
                    if room is None:
                        break
                    if (
                        not room.connection_matches(user_id, connection_id)
                        or room.host_id != user_id
                        or room.status != "waiting"
                    ):
                        await deliver({"type": "word_chain_error", "error": "forbidden"})
                        break
                    ready = [p for p in room.players.values() if p.connected and not p.eliminated]
                    if (
                        len(ready) < room.config.min_players
                        and settings.WORD_CHAIN_BOT_ENABLED
                        and not room.online_match
                    ):
                        room.add_bot()
                    try:
                        room.start(counts)
                    except ValueError:
                        await deliver({"type": "word_chain_error", "error": "not_enough_players"})
                        break
                    if await commit_and_broadcast(room):
                        break

            elif action == "submit_word" and code is not None:
                raw_word = data.get("word", "")
                if len(str(raw_word)) > 80:
                    await deliver({"type": "word_rejected", "reason": "UNSUPPORTED_CHARACTERS"})
                    continue
                snapshot = await store.load(code)
                if snapshot is None:
                    await deliver({"type": "word_chain_error", "error": "room_not_found"})
                    continue
                if not snapshot.connection_matches(user_id, connection_id):
                    await deliver({"type": "word_chain_error", "error": "forbidden"})
                    continue
                preliminary = snapshot.preliminary_check(user_id, raw_word)
                if not preliminary.accepted:
                    await deliver(
                        {
                            "type": "word_rejected",
                            "reason": preliminary.reason,
                            "required_letter": snapshot.required_letter.upper(),
                        }
                    )
                    continue
                try:
                    validation = await dictionary.validate_word(preliminary.word or "")
                except Exception:
                    await deliver({"type": "word_rejected", "reason": "DICTIONARY_UNAVAILABLE"})
                    continue
                for _ in range(MAX_CAS_ATTEMPTS):
                    room = await store.load(code)
                    if room is None:
                        break
                    if not room.connection_matches(user_id, connection_id):
                        await deliver({"type": "word_chain_error", "error": "forbidden"})
                        break
                    result = room.submit_validated_word(
                        user_id,
                        raw_word,
                        dictionary_valid=validation.valid,
                        dictionary_available=validation.status != "unavailable",
                    )
                    if not result.accepted:
                        await deliver(
                            {
                                "type": "word_rejected",
                                "reason": result.reason,
                                "required_letter": room.required_letter.upper(),
                            }
                        )
                        break
                    if await commit_and_broadcast(room):
                        break

            elif action == "leave" and code is not None:
                leave_code = code
                left = False
                for _ in range(MAX_CAS_ATTEMPTS):
                    room = await store.load(leave_code)
                    if room is None:
                        left = True
                        break
                    if not room.connection_matches(user_id, connection_id):
                        # This is an old socket that a newer reconnect has
                        # superseded. It may unsubscribe itself, but must not
                        # change the player's presence or room membership.
                        left = True
                        break
                    if room.status == "waiting":
                        room.remove_lobby_player(user_id)
                    else:
                        room.mark_disconnected(user_id, connection_id)
                        room.permanently_disconnect(user_id)
                    if not room.players:
                        if await store.delete(
                            leave_code, expected_version=word_chain_room_version(room)
                        ):
                            left = True
                            break
                        continue
                    if await commit_and_broadcast(room):
                        left = True
                        break
                if left:
                    await matchmaker.remove(leave_code)
                    await pubsub.unsubscribe("wc:" + leave_code, pubsub_handler)
                    code = None

    except (WebSocketDisconnect, ValueError, RuntimeError):
        pass
    finally:
        if code is not None:
            disconnect_code = code
            marked_disconnected = False
            for _ in range(MAX_CAS_ATTEMPTS):
                room = await store.load(disconnect_code)
                if room is None:
                    break
                if not room.mark_disconnected(user_id, connection_id):
                    break
                if await commit_and_broadcast(room):
                    marked_disconnected = True
                    break
            if marked_disconnected:
                # A briefly disconnected matchmaking host cannot be claimed
                # as an opponent. Rejoining the waiting room re-enqueues it.
                await matchmaker.remove(disconnect_code)
                deadline = time.time() + settings.MULTIPLAYER_RECONNECT_GRACE_SECONDS
                asyncio.create_task(
                    schedule_phase_timer(
                        lock,
                        "wc:" + disconnect_code,
                        f"disconnect:{user_id}:{connection_id}",
                        deadline,
                        lambda: handle_disconnect_grace(
                            disconnect_code, user_id, connection_id
                        ),
                    )
                )
            await pubsub.unsubscribe("wc:" + disconnect_code, pubsub_handler)
