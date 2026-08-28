"""AI Speaking Coach service.

Holds the four character personas and orchestrates a conversation turn: one AI
call per user turn returns both the in-character reply and structured grammar
corrections, which are persisted, mined into review rows, and rewarded with XP.
IELTS-mode sessions can be scored into a four-criteria band report.

Voice (speech-to-text and text-to-speech) lives entirely in the browser (Web
Speech API), so each character just carries pitch/rate hints the client uses to
give it a distinct voice — no per-turn TTS spend. ElevenLabs remains available
as an upgrade path via the existing /tts proxy.
"""
import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.coach import (
    CharacterProgress,
    CoachGrammarError,
    CoachMessage,
    CoachSession,
    IeltsReport,
)
from app.models.user import User
from app.services.ai_client import AiClient
from app.services.gamification import RewardSummary, apply_skill_xp
from app.services.ielts_scoring import half_band as _half_band

# --- Rewards -----------------------------------------------------------------
XP_PER_TURN = 6  # speaking practice counts as learning (apply_skill_xp)
IELTS_REPORT_XP = 40  # completing a scored IELTS session
FRIENDSHIP_XP_PER_TURN = 10
FRIENDSHIP_LEVELS = [0, 50, 150, 350, 700, 1200]  # xp thresholds -> level 1..6

MAX_CORRECTIONS = 3
LANGUAGE_NAMES = {"uz": "Uzbek (o'zbek tilida)", "ru": "Russian (на русском)", "en": "English"}


@dataclass(frozen=True)
class Character:
    key: str
    name: str
    emoji: str
    tagline: str
    accent: str
    # Web Speech synthesis hints — give each character a recognisably different voice.
    pitch: float
    rate: float
    persona: str


CHARACTERS: Dict[str, Character] = {
    "gordon": Character(
        key="gordon",
        name="Gordon",
        emoji="🎖️",
        tagline="Strict IELTS drill coach — no excuses, real results",
        accent="British",
        pitch=0.7,
        rate=0.95,
        persona=(
            "You are Gordon, a tough, no-nonsense English speaking coach with the manner of a "
            "military drill instructor turned IELTS teacher. You are demanding and direct, you "
            "hold the learner to a high standard, and you never accept lazy or one-word answers "
            "— you push for full, detailed responses. You are strict but never cruel or "
            "demeaning; underneath it you genuinely want the learner to win. Bark short, "
            "motivating challenges. Correct weak English firmly. British spelling."
        ),
    ),
    "mochi": Character(
        key="mochi",
        name="Mochi",
        emoji="🐱",
        tagline="A sweet British cat who loves a good natter",
        accent="British",
        pitch=1.5,
        rate=1.05,
        persona=(
            "You are Mochi, an adorable, fluffy British cat who loves chatting in English. You "
            "are warm, playful and endlessly encouraging, sprinkle in gentle British expressions "
            "('brilliant!', 'lovely', 'oh, smashing'), and occasionally a soft cat pun or a "
            "little 'purr'. You make the learner feel safe and never nervous. Corrections are "
            "kind and light. Keep the energy sweet and cosy."
        ),
    ),
    "alex": Character(
        key="alex",
        name="Alex",
        emoji="🧑",
        tagline="Your chill older brother who happens to speak perfect English",
        accent="American",
        pitch=1.0,
        rate=1.0,
        persona=(
            "You are Alex, the learner's friendly older brother. You are casual, warm and "
            "relatable, you talk like a real person using everyday natural English and the "
            "occasional common slang, and you share little bits about your own day to keep it "
            "feeling like a real chat. You are supportive and chill; corrections are relaxed, "
            "like 'oh by the way, we'd usually say…'. Never lecture."
        ),
    ),
    "examiner": Character(
        key="examiner",
        name="IELTS Examiner",
        emoji="🎓",
        tagline="A professional examiner who runs a realistic speaking test",
        accent="British",
        pitch=0.95,
        rate=1.0,
        persona=(
            "You are a professional, neutral IELTS speaking examiner. You are calm, formal and "
            "impartial. You follow the real IELTS Speaking structure and ask one clear question "
            "at a time, exactly as an examiner would. You do NOT teach, praise, or correct "
            "during the test — you simply acknowledge briefly and move to the next question, "
            "keeping the learner talking. Standard British examiner register."
        ),
    ),
    "raj": Character(
        key="raj",
        name="Raj",
        emoji="🧐",
        tagline="Brutally honest, wildly entertaining — never lets a mistake slide",
        accent="Indian",
        pitch=0.9,
        rate=1.05,
        persona=(
            "You are Raj, a theatrical, larger-than-life IELTS examiner who has heard ten "
            "thousand candidates and is not easily impressed. You are strict and blunt — you "
            "name every mistake the instant you hear it, with a sharp, memorable one-liner, "
            "never with cruelty aimed at the person. Praise is rare and only ever earned. You "
            "have a big, theatrical sense of humor and clear personal opinions, and you are "
            "never boring — the learner should look forward to being roasted a little. You "
            "refuse one-word or lazy answers and push, loudly, for a full real answer. "
            "Underneath the act you are rooting hard for the learner to actually hit their "
            "target band."
        ),
    ),
}

IELTS_PART_GUIDANCE = {
    1: (
        "This is IELTS Speaking Part 1. Ask short, familiar questions about the candidate and "
        "everyday topics (home, work/studies, hobbies, daily routine). One question at a time."
    ),
    2: (
        "This is IELTS Speaking Part 2 (the long turn / cue card). Present ONE cue card on the "
        "topic and ask the candidate to speak for 1-2 minutes, then ask one brief rounding-off "
        "question. Include the bullet points they should cover."
    ),
    3: (
        "This is IELTS Speaking Part 3. Ask deeper, more abstract discussion questions connected "
        "to the Part 2 topic, probing opinions and justifications. One question at a time."
    ),
}


def list_characters() -> List[Character]:
    return list(CHARACTERS.values())


def get_character(key: str) -> Optional[Character]:
    return CHARACTERS.get(key)


def _learner_language(user: User) -> str:
    return LANGUAGE_NAMES.get(user.profile.ui_locale, LANGUAGE_NAMES["uz"])


def _system_prompt(user: User, session: CoachSession) -> str:
    character = CHARACTERS[session.character]
    parts = [character.persona]
    if session.mode == "ielts":
        parts.append(IELTS_PART_GUIDANCE.get(session.ielts_part or 1, IELTS_PART_GUIDANCE[1]))
        if session.topic:
            parts.append('The topic for this test is: "{}".'.format(session.topic))
    else:
        if session.topic:
            parts.append('Try to steer the friendly conversation around: "{}".'.format(session.topic))
        parts.append(
            "Keep replies to 2-4 natural sentences and end with a question to keep the learner "
            "talking. Stay fully in character at all times."
        )
    parts.append(
        "Always reply in English only. Match your English to the learner's level so they can "
        "follow you."
    )
    return " ".join(parts)


# The model returns the in-character reply AND grammar feedback in one call.
_TURN_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string"},
        "corrections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "original": {"type": "string"},
                    "correction": {"type": "string"},
                    "explanation": {"type": "string"},
                    "category": {"type": "string"},
                },
                "required": ["original", "correction", "explanation", "category"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["reply", "corrections"],
    "additionalProperties": False,
}


def _history(session: CoachSession) -> List[Dict[str, str]]:
    return [{"role": m.role, "content": m.content} for m in session.messages]


async def create_session(
    db: AsyncSession,
    user: User,
    *,
    character: str,
    mode: str,
    ielts_part: Optional[int],
    topic: Optional[str],
) -> CoachSession:
    session = CoachSession(
        user_id=user.id,
        character=character,
        mode=mode,
        ielts_part=ielts_part if mode == "ielts" else None,
        topic=topic,
    )
    db.add(session)
    await _touch_progress(db, user, character, sessions_delta=1, messages_delta=0, xp_delta=0)
    await db.flush()
    return session


async def get_session(db: AsyncSession, user: User, session_id: UUID) -> Optional[CoachSession]:
    return await db.scalar(
        select(CoachSession).where(
            CoachSession.id == session_id, CoachSession.user_id == user.id
        )
    )


async def list_sessions(db: AsyncSession, user: User, limit: int = 20) -> List[CoachSession]:
    rows = await db.scalars(
        select(CoachSession)
        .where(CoachSession.user_id == user.id)
        .order_by(CoachSession.started_at.desc())
        .limit(limit)
    )
    return list(rows)


@dataclass
class TurnResult:
    reply: str
    corrections: List[Dict[str, str]]
    reward: RewardSummary


def _clean_corrections(raw: Any) -> List[Dict[str, str]]:
    corrections: List[Dict[str, str]] = []
    if not isinstance(raw, list):
        return corrections
    for item in raw[:MAX_CORRECTIONS]:
        if not isinstance(item, dict):
            continue
        original = str(item.get("original", "")).strip()[:300]
        correction = str(item.get("correction", "")).strip()[:300]
        if not original or not correction or original.lower() == correction.lower():
            continue
        corrections.append(
            {
                "original": original,
                "correction": correction,
                "explanation": str(item.get("explanation", "")).strip()[:500],
                "category": (str(item.get("category", "grammar")).strip() or "grammar")[:30],
            }
        )
    return corrections


async def send_turn(
    db: AsyncSession, user: User, session: CoachSession, text: str, client: AiClient
) -> TurnResult:
    """Persist the learner's turn, get the character's graded reply, store the
    assistant turn + mined grammar errors, and award XP. Caller commits."""
    text = text.strip()
    grade_instruction = (
        "You are also a meticulous English coach. In the SAME response, list up to {n} genuine "
        "errors in the learner's most recent message — grammar, word choice, or unnatural "
        "phrasing. For each: the learner's exact 'original' phrase, a natural 'correction', a "
        "short 'explanation' written in {lang}, and a 'category' (grammar|vocabulary|"
        "naturalness). If the message was already good, return an empty corrections list. Do NOT "
        "mention the corrections inside 'reply' — keep the spoken reply fully in character."
    ).format(n=MAX_CORRECTIONS, lang=_learner_language(user))
    system = _system_prompt(user, session) + "\n\n" + grade_instruction

    messages = _history(session) + [{"role": "user", "content": text}]
    prompt = (
        "Continue the conversation and grade the learner's latest message. "
        "Conversation so far (most recent last):\n"
        + "\n".join("{}: {}".format(m["role"], m["content"]) for m in messages)
    )
    data = await client.json(system=system, prompt=prompt, schema=_TURN_SCHEMA, max_tokens=700)

    reply = str(data.get("reply", "")).strip()
    if not reply:
        reply = "Sorry, could you say that again?"
    corrections = _clean_corrections(data.get("corrections"))

    user_msg = CoachMessage(
        session_id=session.id,
        role="user",
        content=text,
        corrections_json=json.dumps(corrections) if corrections else None,
    )
    db.add(user_msg)
    await db.flush()
    db.add(CoachMessage(session_id=session.id, role="assistant", content=reply))

    for corr in corrections:
        db.add(
            CoachGrammarError(
                user_id=user.id,
                session_id=session.id,
                original=corr["original"],
                correction=corr["correction"],
                explanation=corr["explanation"] or None,
                category=corr["category"],
            )
        )

    session.turns += 1
    await _touch_progress(
        db, user, session.character, sessions_delta=0, messages_delta=1,
        xp_delta=FRIENDSHIP_XP_PER_TURN,
    )
    reward = await apply_skill_xp(db, user, XP_PER_TURN)
    return TurnResult(reply=reply, corrections=corrections, reward=reward)


_IELTS_SCHEMA = {
    "type": "object",
    "properties": {
        "band_overall": {"type": "number"},
        "fluency": {"type": "number"},
        "lexical": {"type": "number"},
        "grammar": {"type": "number"},
        "pronunciation": {"type": "number"},
        "strengths": {"type": "string"},
        "improvements": {"type": "string"},
        "homework": {"type": "string"},
    },
    "required": [
        "band_overall", "fluency", "lexical", "grammar", "pronunciation",
        "strengths", "improvements", "homework",
    ],
    "additionalProperties": False,
}


# _half_band now lives in app.services.ielts_scoring (shared with ielts.py
# and the IELTS Mock).


async def score_ielts(
    db: AsyncSession, user: User, session: CoachSession, client: AiClient
) -> Tuple[IeltsReport, RewardSummary]:
    """Grade an IELTS-mode transcript into a four-criteria band report. Marks the
    session complete and awards a completion XP bonus. Caller commits."""
    transcript = "\n".join(
        "{}: {}".format("Candidate" if m.role == "user" else "Examiner", m.content)
        for m in session.messages
    )
    system = (
        "You are a certified IELTS Speaking examiner. Assess the candidate's performance in this "
        "transcript strictly against the four IELTS Speaking criteria on the 0-9 band scale, in "
        "0.5 steps: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and "
        "Pronunciation. This is a text transcript, so estimate Pronunciation conservatively from "
        "spelling, word choice and complexity, and treat it as approximate. band_overall is the "
        "average of the four, rounded to the nearest 0.5. 'strengths' and 'improvements' are "
        "concise paragraphs; 'homework' is 2-3 concrete practice tasks. Be honest and calibrated "
        "— do not inflate."
    )
    prompt = "IELTS Speaking transcript (Part {}):\n\n{}".format(
        session.ielts_part or 1, transcript or "(no answers were given)"
    )
    data = await client.json(system=system, prompt=prompt, schema=_IELTS_SCHEMA, max_tokens=800)

    report = IeltsReport(
        session_id=session.id,
        user_id=user.id,
        band_overall=_half_band(data.get("band_overall")),
        fluency=_half_band(data.get("fluency")),
        lexical=_half_band(data.get("lexical")),
        grammar=_half_band(data.get("grammar")),
        pronunciation=_half_band(data.get("pronunciation")),
        strengths=str(data.get("strengths", "")).strip()[:2000] or "—",
        improvements=str(data.get("improvements", "")).strip()[:2000] or "—",
        homework=str(data.get("homework", "")).strip()[:2000] or "—",
    )
    # Replace any prior report for a re-scored session.
    existing = await db.scalar(select(IeltsReport).where(IeltsReport.session_id == session.id))
    if existing is not None:
        await db.delete(existing)
        await db.flush()
    db.add(report)

    session.status = "done"
    session.completed_at = utcnow()
    reward = await apply_skill_xp(db, user, IELTS_REPORT_XP)
    return report, reward


# --- Character progress ------------------------------------------------------
def friendship_level(xp: int) -> int:
    level = 1
    for threshold in FRIENDSHIP_LEVELS:
        if xp >= threshold:
            level = FRIENDSHIP_LEVELS.index(threshold) + 1
    return level


async def _touch_progress(
    db: AsyncSession,
    user: User,
    character: str,
    *,
    sessions_delta: int,
    messages_delta: int,
    xp_delta: int,
) -> CharacterProgress:
    progress = await db.scalar(
        select(CharacterProgress).where(
            CharacterProgress.user_id == user.id, CharacterProgress.character == character
        )
    )
    if progress is None:
        progress = CharacterProgress(user_id=user.id, character=character)
        db.add(progress)
        await db.flush()
    progress.sessions_count += sessions_delta
    progress.messages_count += messages_delta
    progress.friendship_xp += xp_delta
    progress.last_at = utcnow()
    return progress


async def progress_all(db: AsyncSession, user: User) -> Dict[str, CharacterProgress]:
    rows = await db.scalars(
        select(CharacterProgress).where(CharacterProgress.user_id == user.id)
    )
    return {p.character: p for p in rows}


async def recent_errors(
    db: AsyncSession, user: User, limit: int = 15
) -> List[CoachGrammarError]:
    rows = await db.scalars(
        select(CoachGrammarError)
        .where(CoachGrammarError.user_id == user.id)
        .order_by(CoachGrammarError.created_at.desc())
        .limit(limit)
    )
    return list(rows)


async def dashboard_counts(db: AsyncSession, user: User) -> Dict[str, int]:
    total_sessions = int(
        await db.scalar(
            select(func.count(CoachSession.id)).where(CoachSession.user_id == user.id)
        )
        or 0
    )
    total_turns = int(
        await db.scalar(
            select(func.coalesce(func.sum(CoachSession.turns), 0)).where(
                CoachSession.user_id == user.id
            )
        )
        or 0
    )
    total_errors = int(
        await db.scalar(
            select(func.count(CoachGrammarError.id)).where(CoachGrammarError.user_id == user.id)
        )
        or 0
    )
    return {
        "total_sessions": total_sessions,
        "total_turns": total_turns,
        "total_errors": total_errors,
    }


async def latest_report(db: AsyncSession, user: User) -> Optional[IeltsReport]:
    return await db.scalar(
        select(IeltsReport)
        .where(IeltsReport.user_id == user.id)
        .order_by(IeltsReport.created_at.desc())
        .limit(1)
    )
