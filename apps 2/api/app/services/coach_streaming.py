"""Real-time streaming voice conversation for the Speaking Coach.

Streams the coach's reply over Server-Sent Events (SSE) so the web client can
speak it as it arrives:
- Client sends STT-transcribed text (from the browser mic).
- Server generates the reply and streams it back in sentence-sized chunks
  (TTS engines synthesise per phrase/sentence, not per character).
- Client feeds each chunk to its TTS as it comes.

IMPORTANT: a StreamingResponse body runs *after* the request handler returns, by
which point the request-scoped DB session (Depends(get_db)) is already closed.
So this generator opens its OWN session and re-loads the session/user by id —
using the request session here would operate on a closed connection.
"""
import json
import re
from typing import AsyncGenerator
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


def _sse(payload: dict) -> str:
    return "data: " + json.dumps(payload) + "\n\n"


def _chunks(text: str) -> list[str]:
    """Split a reply into sentence-sized pieces for progressive TTS."""
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p]


async def stream_turn(user_id: UUID, session_id: UUID, user_text: str) -> AsyncGenerator[str, None]:
    """Generate and stream the coach's reply. Opens its own DB session because
    the request session is gone once the StreamingResponse starts."""
    client = get_ai_client()
    if client is None:
        yield _sse({"type": "error", "message": "AI not configured"})
        return

    factory = get_session_factory()
    async with factory() as db:
        # Re-load within this generator's own session.
        user = await db.scalar(
            select(User).options(selectinload(User.profile)).where(User.id == user_id)
        )
        session = await db.scalar(
            select(CoachSession)
            .options(selectinload(CoachSession.messages))
            .where(CoachSession.id == session_id, CoachSession.user_id == user_id)
        )
        if user is None or session is None:
            yield _sse({"type": "error", "message": "Session not found"})
            return
        if session.status == "done":
            yield _sse({"type": "error", "message": "Session already finished"})
            return

        system = _system_prompt(user, session)
        history = [{"role": m.role, "content": m.content} for m in session.messages]
        history.append({"role": "user", "content": user_text})
        prompt = "Continue the conversation naturally:\n\n" + "\n".join(
            "{}: {}".format(m["role"], m["content"]) for m in history
        )

        try:
            reply = (await client.text(system=system, prompt=prompt, max_tokens=300)).strip()
        except AiError as exc:
            # Charge nothing on failure (matches the non-streaming path).
            yield _sse({"type": "error", "message": str(exc)})
            return
        if not reply:
            reply = "Sorry, could you say that again?"

        # Stream sentence-sized chunks the client can speak progressively.
        for chunk in _chunks(reply):
            yield _sse({"type": "token", "text": chunk})

        # Persist the turn, award XP, and charge one quota slot — only now, on success.
        db.add(CoachMessage(session_id=session.id, role="user", content=user_text))
        db.add(CoachMessage(session_id=session.id, role="assistant", content=reply))
        session.turns += 1
        reward = await apply_skill_xp(db, user, XP_PER_TURN)
        await ai_quota.consume(db, user)
        await db.commit()

        yield _sse(
            {
                "type": "done",
                "full_reply": reply,
                "reward": {
                    "xp_gained": reward.xp_gained,
                    "total_xp": reward.total_xp,
                    "level": reward.level,
                    "leveled_up": reward.leveled_up,
                },
            }
        )
