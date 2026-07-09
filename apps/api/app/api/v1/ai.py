from typing import Callable, Awaitable, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.ai import AiReport
from app.models.flashcards import Card
from app.models.user import User
from app.models.vocabulary import Word
from app.schemas.ai import (
    ChatRequest,
    ExplainRequest,
    MessageOut,
    MnemonicRequest,
    QuizOut,
    QuizQuestionOut,
    QuizRequest,
    QuotaOut,
    AiTextOut,
    ReportRequest,
    StoryRequest,
    WritingCheckRequest,
    WritingCheckOut,
)
from app.services import ai_quota
from app.services.ai_client import AiClient, AiError, get_ai_client

router = APIRouter(prefix="/ai", tags=["ai"], dependencies=[Depends(get_current_user)])

LANGUAGE_NAMES = {"uz": "Uzbek (o'zbek tilida)", "ru": "Russian (на русском)", "en": "English"}


def require_ai_client() -> AiClient:
    client = get_ai_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are not configured on this server",
        )
    return client


def learner_language(user: User) -> str:
    return LANGUAGE_NAMES.get(user.profile.ui_locale, LANGUAGE_NAMES["uz"])


def tutor_system(user: User, extra: str = "") -> str:
    return (
        "You are Zukko, a warm, patient English tutor for Uzbek learners. "
        "Explain simply and encouragingly, never condescending. "
        "Write your reply in {lang}. {extra}"
    ).format(lang=learner_language(user), extra=extra).strip()


async def _guarded(
    db: AsyncSession, user: User, call: Callable[[], Awaitable]
):
    """Enforce the daily quota, run the model call, and only charge a quota slot
    on success (failures don't cost the user)."""
    if not await ai_quota.has_quota(db, user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily AI limit reached. Upgrade to Premium for unlimited AI.",
        )
    try:
        result = await call()
    except AiError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service error, please retry"
        )
    await ai_quota.consume(db, user)
    await db.commit()
    return result


async def _get_word(db: AsyncSession, word_id: UUID) -> Word:
    word = await db.scalar(select(Word).where(Word.id == word_id, Word.status == "published"))
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    return word


def _word_brief(word: Word) -> str:
    sense = word.senses[0] if word.senses else None
    if sense is None:
        return word.headword
    return "{} ({}) — uz: {}, ru: {} — {}".format(
        word.headword, word.pos, sense.translation_uz, sense.translation_ru, sense.definition_en
    )


@router.get("/quota", response_model=QuotaOut)
async def quota(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return QuotaOut(
        remaining=await ai_quota.remaining_today(db, user),
        daily_quota=await ai_quota.daily_quota(db, user),
        enabled=get_settings().ai_enabled,
    )


@router.post("/explain", response_model=AiTextOut)
async def explain(
    payload: ExplainRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    word = await _get_word(db, payload.word_id)
    prompt = (
        "Explain the English word \"{hw}\" ({pos}) to a beginner. Cover: what it means, "
        "when to use it, and one common mistake Uzbek learners make with it. "
        "Under 70 words. Reference: {brief}"
    ).format(hw=word.headword, pos=word.pos, brief=_word_brief(word))
    text = await _guarded(
        db, user,
        lambda: client.text(system=tutor_system(user), prompt=prompt, max_tokens=400),
    )
    return AiTextOut(text=text)


@router.post("/mnemonic", response_model=AiTextOut)
async def mnemonic(
    payload: MnemonicRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    word = await _get_word(db, payload.word_id)
    prompt = (
        "Create one vivid, memorable memory hook (mnemonic) to help an Uzbek learner "
        "remember the English word \"{hw}\" (meaning: {uz}). Make it fun and concrete. "
        "Under 40 words."
    ).format(hw=word.headword, uz=word.senses[0].translation_uz if word.senses else word.headword)
    text = await _guarded(
        db, user,
        lambda: client.text(system=tutor_system(user), prompt=prompt, max_tokens=250),
    )
    return AiTextOut(text=text)


async def _learning_words(db: AsyncSession, user: User, limit: int = 6) -> List[Word]:
    rows = await db.scalars(
        select(Word)
        .join(Card, Card.word_id == Word.id)
        .where(Card.user_id == user.id, Card.word_id.isnot(None))
        .order_by(Card.due_at)
        .limit(limit)
    )
    return list(rows.unique())


@router.post("/story", response_model=AiTextOut)
async def story(
    payload: StoryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    if payload.word_ids:
        words = [await _get_word(db, wid) for wid in payload.word_ids]
    else:
        words = await _learning_words(db, user)
    if len(words) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add at least 3 words to your cards to generate a story",
        )
    headwords = ", ".join(w.headword for w in words)
    prompt = (
        "Write a short, simple English story (5-7 sentences) for a beginner learner that "
        "naturally uses ALL of these words: {words}. Keep vocabulary easy. "
        "Put each target word in **bold**."
    ).format(words=headwords)
    text = await _guarded(
        db, user,
        lambda: client.text(
            system=tutor_system(user, "Write the story itself in English."),
            prompt=prompt,
            max_tokens=600,
        ),
    )
    return AiTextOut(text=text)


@router.post("/chat", response_model=AiTextOut)
async def chat(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    system = (
        "You are Zukko, a friendly English conversation partner for an Uzbek learner at "
        "CEFR level {level}. Reply ONLY in English, using vocabulary and grammar appropriate "
        "for {level}. Keep replies to 2-3 short sentences and end with a simple question to "
        "keep the conversation going. If the learner makes a clear mistake, gently model the "
        "correct form."
    ).format(level=payload.level)
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    text = await _guarded(
        db, user, lambda: client.chat(system=system, messages=messages, max_tokens=400)
    )
    return AiTextOut(text=text)


QUIZ_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "prompt": {"type": "string"},
                    "options": {"type": "array", "items": {"type": "string"}},
                    "answer_index": {"type": "integer"},
                },
                "required": ["prompt", "options", "answer_index"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["questions"],
    "additionalProperties": False,
}


@router.post("/quiz", response_model=QuizOut)
async def quiz(
    payload: QuizRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    if payload.word_ids:
        words = [await _get_word(db, wid) for wid in payload.word_ids]
    else:
        query = select(Word).where(Word.status == "published")
        if payload.cefr_level:
            query = query.where(Word.cefr_level == payload.cefr_level)
        words = list((await db.scalars(query.order_by(Word.frequency_rank).limit(payload.count * 2))).unique())
    if len(words) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough words")

    briefs = "\n".join("- {}".format(_word_brief(w)) for w in words[: payload.count])
    prompt = (
        "Create {n} multiple-choice vocabulary questions from these English words. Each question "
        "asks for the meaning of a word; give 4 options (one correct) and the 0-based index of the "
        "correct option. Options should be short. Words:\n{briefs}"
    ).format(n=payload.count, briefs=briefs)
    data = await _guarded(
        db, user,
        lambda: client.json(
            system=tutor_system(user, "Options and prompts may be in the learner's language."),
            prompt=prompt,
            schema=QUIZ_SCHEMA,
            max_tokens=1200,
        ),
    )
    questions = [
        QuizQuestionOut(
            prompt=q["prompt"], options=q["options"], answer_index=int(q["answer_index"])
        )
        for q in data.get("questions", [])
        if q.get("options")
    ]
    if not questions:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI produced no quiz")
    return QuizOut(questions=questions)


WRITING_SCHEMA = {
    "type": "object",
    "properties": {"corrected": {"type": "string"}, "feedback": {"type": "string"}},
    "required": ["corrected", "feedback"],
    "additionalProperties": False,
}


@router.post("/writing-check", response_model=WritingCheckOut)
async def writing_check(
    payload: WritingCheckRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    prompt = (
        "The learner wrote this English text:\n\n\"{text}\"\n\n"
        "Return a corrected version, and short encouraging feedback ({lang}) explaining the main "
        "fixes in 1-2 sentences."
    ).format(text=payload.text, lang=learner_language(user))
    data = await _guarded(
        db, user,
        lambda: client.json(
            system=tutor_system(user), prompt=prompt, schema=WRITING_SCHEMA, max_tokens=600
        ),
    )
    return WritingCheckOut(corrected=str(data.get("corrected", "")), feedback=str(data.get("feedback", "")))


@router.post("/report", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def report(
    payload: ReportRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db.add(
        AiReport(
            user_id=user.id,
            kind=payload.kind,
            prompt=payload.prompt,
            output=payload.output,
            reason=payload.reason,
        )
    )
    await db.commit()
    return MessageOut(message="Thanks — our teachers will review this.")
