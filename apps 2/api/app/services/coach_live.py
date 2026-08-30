"""Helpers for the real-time voice bridge (browser <-> our WS <-> Deepgram).

The WebSocket route in api/v1/coach_live.py owns the socket plumbing; this module
holds the pieces that touch Deepgram config, the AI reply, and persistence so the
route stays readable and these bits stay unit-testable.

The Deepgram master key never leaves the server — the browser only ever talks to
our WebSocket.
"""
from typing import Dict, List, Optional
from urllib.parse import urlencode
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_session_factory
from app.models.coach import CoachMessage, CoachSession
from app.models.user import User
from app.services import ai_quota
from app.services.ai_client import AiError, get_ai_client
from app.services.coach import XP_PER_TURN, _system_prompt
from app.services.gamification import apply_skill_xp

DEEPGRAM_WS = "wss://api.deepgram.com/v1/listen"


def deepgram_url(sample_rate: int) -> str:
    """Streaming STT tuned for conversation: interim results for live captions,
    endpointing so we know when the speaker has finished a turn."""
    params = {
        "model": "nova-2",
        "language": "en",
        "encoding": "linear16",
        "sample_rate": sample_rate,
        "channels": 1,
        "punctuate": "true",
        "smart_format": "true",
        "interim_results": "true",
        "endpointing": "400",  # ms of silence => end of utterance
    }
    return DEEPGRAM_WS + "?" + urlencode(params)


async def generate_reply(system: str, history: List[Dict[str, str]]) -> str:
    """One coach reply for the running conversation. Raises AiError on failure."""
    client = get_ai_client()
    if client is None:
        raise AiError("AI not configured")
    prompt = "Continue the conversation naturally:\n\n" + "\n".join(
        "{}: {}".format(m["role"], m["content"]) for m in history
    )
    reply = (await client.text(system=system, prompt=prompt, max_tokens=300)).strip()
    return reply or "Sorry, could you say that again?"


async def persist_turn(
    user_id: UUID, session_id: UUID, user_text: str, reply: str
) -> Optional[Dict[str, int]]:
    """Store one exchange, award XP, and charge a quota slot — in a fresh session
    (the WS connection is long-lived; short per-turn sessions avoid staleness).
    Returns the reward, or None if the session/user vanished."""
    factory = get_session_factory()
    async with factory() as db:
        user = await db.scalar(
            select(User).options(selectinload(User.profile)).where(User.id == user_id)
        )
        session = await db.scalar(
            select(CoachSession).where(
                CoachSession.id == session_id, CoachSession.user_id == user_id
            )
        )
        if user is None or session is None:
            return None
        db.add(CoachMessage(session_id=session.id, role="user", content=user_text))
        db.add(CoachMessage(session_id=session.id, role="assistant", content=reply))
        session.turns += 1
        reward = await apply_skill_xp(db, user, XP_PER_TURN)
        await ai_quota.consume(db, user)
        await db.commit()
        return {
            "xp_gained": reward.xp_gained,
            "total_xp": reward.total_xp,
            "level": reward.level,
            "leveled_up": reward.leveled_up,
        }


async def load_live_context(user_id: UUID, session_id: UUID):
    """Validate ownership and return (system_prompt, history, error). error is a
    short code when the session can't start, else None."""
    factory = get_session_factory()
    async with factory() as db:
        user = await db.scalar(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id == user_id, User.is_active.is_(True))
        )
        session = await db.scalar(
            select(CoachSession)
            .options(selectinload(CoachSession.messages))
            .where(CoachSession.id == session_id, CoachSession.user_id == user_id)
        )
        if user is None or session is None:
            return None, None, "not_found"
        if session.status == "done":
            return None, None, "finished"
        if not await ai_quota.has_quota(db, user):
            return None, None, "quota"
        system = _system_prompt(user, session)
        history = [{"role": m.role, "content": m.content} for m in session.messages]
        return system, history, None
