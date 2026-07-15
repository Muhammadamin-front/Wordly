"""Real-time streaming voice conversation for the Speaking Coach.

Simple streaming endpoint using Server-Sent Events (SSE):
- Client sends STT-transcribed text (from Deepgram)
- Server streams AI response character-by-character
- Client pipes each character to ElevenLabs TTS streaming API
- Result: real-time voice conversation without needing complex rewrite of AI clients
"""
import json
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.coach import CoachMessage, CoachSession
from app.models.user import User
from app.services.ai_client import get_ai_client
from app.services.coach import CHARACTERS, _system_prompt
from app.services.gamification import apply_skill_xp


async def stream_turn(
    db: AsyncSession,
    user: User,
    session: CoachSession,
    user_text: str,
) -> AsyncGenerator[str, None]:
    """
    Stream the coach's response via SSE (Server-Sent Events).

    Yields events:
      data: {"type": "token", "text": "..."}\n\n
      data: {"type": "done", "reward": {...}}\n\n
      data: {"type": "error", "message": "..."}\n\n
    """
    client = get_ai_client()
    if not client:
        yield 'data: ' + json.dumps({"type": "error", "message": "AI not configured"}) + "\n\n"
        return

    character = CHARACTERS[session.character]
    system = _system_prompt(user, session)

    # Build message history (excluding corrections from the prompt).
    messages = [
        {"role": m.role, "content": m.content}
        for m in session.messages
    ]
    messages.append({"role": "user", "content": user_text})

    # Get full response from AI (Gemini Flash is fast; we'll stream it to the client).
    full_reply = ""
    try:
        full_reply = await client.text(
            system=system,
            prompt="Continue the conversation naturally:\n\n" + "\n".join(
                f"{m['role']}: {m['content']}" for m in messages
            ),
            max_tokens=300,  # Keep responses snappy
        )
    except Exception as e:
        yield 'data: ' + json.dumps({"type": "error", "message": str(e)}) + "\n\n"
        return

    # Stream the response character-by-character to the client for TTS.
    for char in full_reply:
        yield 'data: ' + json.dumps({"type": "token", "text": char}) + "\n\n"

    # Persist the turn and award XP.
    user_msg = CoachMessage(
        session_id=session.id,
        role="user",
        content=user_text,
        corrections_json=None,  # Grammar check happens async
    )
    db.add(user_msg)
    await db.flush()

    assistant_msg = CoachMessage(
        session_id=session.id,
        role="assistant",
        content=full_reply,
    )
    db.add(assistant_msg)

    session.turns += 1
    reward = await apply_skill_xp(db, user, 6)  # XP_PER_TURN
    await db.commit()

    # Signal completion.
    yield 'data: ' + json.dumps({
        "type": "done",
        "reward": {
            "xp_gained": reward.xp_gained,
            "total_xp": reward.total_xp,
            "level": reward.level,
            "leveled_up": reward.leveled_up,
        },
    }) + "\n\n"
