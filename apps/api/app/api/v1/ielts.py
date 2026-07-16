"""IELTS practice endpoints — Reading, Writing, Listening (Speaking lives in the
Coach). Generation and Writing scoring are AI calls (quota-guarded); grading a
submitted Reading/Listening test is server-side and free."""
import json
from typing import Awaitable, Callable, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.ielts import (
    BankItemOut,
    GenerateRequest,
    GeneratedTestOut,
    GradeOut,
    HistoryItemOut,
    OverviewOut,
    QuestionOut,
    RewardOut,
    SubmitRequest,
    WritingScoreOut,
    WritingScoreRequest,
    WritingTask,
)
from app.models.ielts import IeltsTest
from app.services import ai_quota, coach, ielts, tts
from app.services.ai_client import AiClient, AiError, get_ai_client
from app.services.gamification import RewardSummary
from app.services.ielts_bank import bank_for

router = APIRouter(
    prefix="/ielts",
    tags=["ielts"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("ai"))],
)


def require_ai_client() -> AiClient:
    client = get_ai_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are not configured on this server",
        )
    return client


async def _guarded(db: AsyncSession, user: User, call: Callable[[], Awaitable]):
    if not await ai_quota.has_quota(db, user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily AI limit reached. Upgrade to Premium for unlimited AI.",
        )
    try:
        result = await call()
    except AiError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI service error")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI produced no test")
    await ai_quota.consume(db, user)
    return result


def _reward(summary: RewardSummary) -> RewardOut:
    return RewardOut(
        xp_gained=summary.xp_gained,
        total_xp=summary.total_xp,
        level=summary.level,
        leveled_up=summary.leveled_up,
    )


def _history_item(result) -> HistoryItemOut:
    correct = total = None
    try:
        detail = json.loads(result.detail or "")
        if isinstance(detail, dict):
            correct, total = detail.get("correct"), detail.get("total")
    except ValueError:
        pass  # Writing stores plain feedback text, not JSON
    return HistoryItemOut(
        skill=result.skill, band=result.band, correct=correct, total=total,
        created_at=result.created_at,
    )


@router.get("/overview", response_model=OverviewOut)
async def overview(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    best = await ielts.best_bands(db, user)
    # Fold in the best Speaking band from the Coach's IELTS reports.
    report = await coach.latest_report(db, user)
    if report is not None:
        best["speaking"] = max(best.get("speaking", 0.0), report.band_overall)
    recent = [_history_item(r) for r in await ielts.recent_results(db, user)]
    return OverviewOut(best_bands=best, recent=recent, enabled=get_settings().ai_enabled)


@router.get("/writing/tasks", response_model=Dict[str, List[WritingTask]])
async def writing_tasks():
    return {
        key: [WritingTask(**t) for t in tasks] for key, tasks in ielts.WRITING_TASKS.items()
    }


@router.post("/writing/score", response_model=WritingScoreOut)
async def writing_score(
    payload: WritingScoreRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    score = await _guarded(
        db, user,
        lambda: ielts.score_writing(
            db, user, client, payload.task_type, payload.prompt, payload.essay
        ),
    )
    await db.commit()
    return WritingScoreOut(
        band_overall=score.band_overall, task=score.task, coherence=score.coherence,
        lexical=score.lexical, grammar=score.grammar, feedback=score.feedback,
        improved=score.improved, reward=_reward(score.reward),
    )


async def _generate(kind: str, band: float, user: User, db: AsyncSession, client: AiClient):
    test_id, payload = await _guarded(
        db, user, lambda: ielts.generate_test(db, user, client, kind, band)
    )
    await db.commit()
    return GeneratedTestOut(
        test_id=test_id,
        title=payload["title"],
        body=payload["body"],
        questions=[QuestionOut(prompt=q["prompt"], options=q["options"]) for q in payload["questions"]],
    )


async def _submit(payload: SubmitRequest, user: User, db: AsyncSession):
    try:
        result = await ielts.grade_test(db, user, payload.test_id, payload.answers)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found or expired")
    await db.commit()
    return GradeOut(
        correct=result.correct, total=result.total, band=result.band,
        answers=result.answers, reward=_reward(result.reward),
    )


@router.get("/{kind}/bank", response_model=List[BankItemOut])
async def bank_list(
    kind: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Built-in practice passages/scripts — no AI, no quota. Titles only; the
    body and questions arrive when an item is started."""
    if kind not in ("reading", "listening"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown section")
    done = set(await ielts.completed_bank_ids(db, user, kind))
    return [
        BankItemOut(
            id=item["id"],
            title=item["title"],
            band=float(item.get("band", 6.0)),
            question_count=len(item["questions"]),
            word_count=len(item["body"].split()),
            done=item["id"] in done,
        )
        for item in sorted(bank_for(kind), key=lambda it: it.get("band", 6.0))
    ]


@router.post("/{kind}/bank/{item_id}/start", response_model=GeneratedTestOut)
async def bank_start(
    kind: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if kind not in ("reading", "listening"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown section")
    try:
        test_id, payload = await ielts.start_bank_test(db, user, kind, item_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passage not found")
    await db.commit()
    return GeneratedTestOut(
        test_id=test_id,
        title=payload["title"],
        body=payload["body"],
        questions=[QuestionOut(prompt=q["prompt"], options=q["options"]) for q in payload["questions"]],
    )


@router.post("/reading/generate", response_model=GeneratedTestOut)
async def reading_generate(
    payload: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    return await _generate("reading", payload.band, user, db, client)


@router.post("/reading/submit", response_model=GradeOut)
async def reading_submit(
    payload: SubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _submit(payload, user, db)


@router.get("/listening/{test_id}/audio")
async def listening_audio(
    test_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Natural ElevenLabs narration of an active listening test's script (MP3).

    Keyed by the caller's own test row — the client never sends raw text, so
    credits can't be burned on arbitrary input. Bank scripts are a finite set,
    so their audio is served from the disk cache after the first synthesis."""
    if not get_settings().tts_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="TTS is not configured"
        )
    test = await db.scalar(
        select(IeltsTest).where(
            IeltsTest.id == test_id,
            IeltsTest.user_id == user.id,
            IeltsTest.kind == "listening",
        )
    )
    if test is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    body = json.loads(test.payload_json)["body"]
    try:
        audio = await tts.synthesize(body[:3000])
    except tts.TtsError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Speech synthesis failed"
        )
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "private, max-age=3600"},
    )


@router.post("/listening/generate", response_model=GeneratedTestOut)
async def listening_generate(
    payload: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    return await _generate("listening", payload.band, user, db, client)


@router.post("/listening/submit", response_model=GradeOut)
async def listening_submit(
    payload: SubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _submit(payload, user, db)
