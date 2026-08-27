from typing import Callable, Awaitable, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.ai import AiReport
from app.models.flashcards import Card
from app.models.user import User
from app.models.vocabulary import CEFR_LEVELS, Word
from app.schemas.ai import (
    ChatRequest,
    DefineWordRequest,
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
from app.schemas.vocabulary import ExampleIn, SenseIn, WordCreate, WordOut
from app.services import ai_quota, vocabulary as vocab_service
from app.services.ai_client import AiClient, AiError, get_ai_client
from app.services.inflection import inflection_candidates

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("ai"))],
)

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


_DEFINE_WORD_SCHEMA = {
    "type": "object",
    "properties": {
        "recognized": {"type": "boolean"},
        "headword": {"type": "string"},
        "pos": {
            "type": "string",
            "enum": [
                "noun", "verb", "adjective", "adverb", "preposition",
                "conjunction", "pronoun", "interjection", "phrase",
            ],
        },
        "cefr_level": {"type": "string", "enum": list(CEFR_LEVELS)},
        "translation_uz": {"type": "string"},
        "translation_ru": {"type": "string"},
        "definition_en": {"type": "string"},
        "example_en": {"type": "string"},
    },
    "required": [
        "recognized", "headword", "pos", "cefr_level",
        "translation_uz", "translation_ru", "definition_en", "example_en",
    ],
    "additionalProperties": False,
}


async def _find_existing(db: AsyncSession, term: str) -> Optional[Word]:
    """Exact match, plus the same inflection-guessing the search bar uses —
    covers both "already in the curated corpus" and "a previous learner's
    search already generated this via AI", so the same missing word never
    costs a second AI call."""
    candidates = [term, *inflection_candidates(term)]
    return await db.scalar(
        select(Word).where(func.lower(Word.headword).in_(candidates)).limit(1)
    )


@router.post("/define-word", response_model=WordOut, status_code=status.HTTP_201_CREATED)
async def define_word(
    payload: DefineWordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    """Fallback for a vocabulary search that came back empty: ask the AI to
    define the term and add it to the corpus (status="review", so it stays
    out of the public catalogue until a curator promotes it — same as a
    CSV-imported word — while ai_generated=True keeps that distinct from a
    CSV import awaiting review for an unrelated reason). Every subsequent
    search for the same word — from anyone — finds this row directly and
    never re-triggers the AI."""
    term = payload.word.strip().lower()
    existing = await _find_existing(db, term)
    if existing is not None:
        return WordOut.model_validate(existing)

    prompt = (
        "A learner searched the dictionary for \"{term}\" and it wasn't found. "
        "Decide whether this is a real, dictionary-worthy English word or short phrase "
        "(fixing an obvious typo if there is one). If it is, set recognized=true and fill in "
        "every field: the correct dictionary headword, part of speech, an honest CEFR level "
        "estimate, natural Uzbek and Russian translations suited to a learner (not a literal "
        "word-for-word gloss), a clear beginner-friendly English definition, and one natural "
        "example sentence that uses the word. If \"{term}\" is gibberish, not English, or you "
        "cannot confidently resolve it, set recognized=false and leave the other string fields "
        "empty."
    ).format(term=payload.word.strip())

    async def call():
        data = await client.json(
            system=(
                "You are a careful lexicographer building a dictionary for Uzbek "
                "learners of English. Only mark a term recognized when you are "
                "confident it is a genuine English word or common phrase."
            ),
            prompt=prompt,
            schema=_DEFINE_WORD_SCHEMA,
            max_tokens=500,
        )
        headword = str(data.get("headword", "")).strip()[:80]
        if not data.get("recognized") or not headword:
            return None
        # The AI's own correction (e.g. a typo fix) can land on a headword
        # already in the corpus under a different search term — re-check
        # before creating a duplicate row.
        dup = await _find_existing(db, headword.lower())
        if dup is not None:
            return dup
        pos = str(data.get("pos", "")).strip().lower()
        if pos not in _DEFINE_WORD_SCHEMA["properties"]["pos"]["enum"]:
            pos = "noun"
        cefr_level = str(data.get("cefr_level", "")).strip().upper()
        if cefr_level not in CEFR_LEVELS:
            cefr_level = "B1"
        try:
            word_payload = WordCreate(
                headword=headword,
                pos=pos,
                cefr_level=cefr_level,
                status="review",
                senses=[
                    SenseIn(
                        definition_en=str(data.get("definition_en", "")).strip()[:1000] or headword,
                        translation_uz=str(data.get("translation_uz", "")).strip()[:160] or headword,
                        translation_ru=str(data.get("translation_ru", "")).strip()[:160] or headword,
                        examples=(
                            [ExampleIn(text_en=str(data["example_en"]).strip()[:500])]
                            if str(data.get("example_en", "")).strip()
                            else []
                        ),
                    )
                ],
            )
        except ValueError:
            # A malformed-but-technically-valid-JSON response (schema
            # adherence isn't guaranteed, especially on the Bedrock provider —
            # see ai_client.py) — treat exactly like "not recognized" rather
            # than crashing into a 500.
            return None
        word = await vocab_service.create_word(db, word_payload)
        word.ai_generated = True
        return word

    word = await _guarded(db, user, call)
    if word is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This doesn't look like a real English word — check the spelling and try again.",
        )
    return WordOut.model_validate(word)


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
