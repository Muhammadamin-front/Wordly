"""IELTS practice endpoints — Reading, Writing, Listening (Speaking lives in the
Coach). Generation and Writing scoring are AI calls (quota-guarded); grading a
submitted Reading/Listening test is server-side and free."""
import json
import random
from typing import Awaitable, Callable, Dict, List, Optional
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
    QueuedJobOut,
    RewardOut,
    SubmitRequest,
    WritingQuotaOut,
    WritingScoreOut,
    WritingScoreRequest,
    WritingTask,
    writing_score_out,
)
from app.schemas.writing_master import (
    DrillFeedbackOut,
    OverviewCheckRequest,
    ParaphraseCheckRequest,
)
from app.models.ielts import IeltsTest
from app.services import ai_quota, coach, ielts, job_handlers, job_queue, subscriptions, tts
from app.services.ai_client import AiClient, AiError, get_ai_client
from app.services.gamification import RewardSummary
from app.services.ielts_bank import bank_for
from app.services.plans import (
    FREE_WRITING_MASTER_UNITS,
    get_plan,
    writing_actions_per_day,
    writing_essay_subcap_per_day,
)

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


async def _require_writing_master_unit(db: AsyncSession, user: User, unit_slug: str) -> None:
    """Mirrors _require_grammar_level in api/v1/skills.py: only the first unit
    (process) is free, same "one unit as a taste" shape."""
    if unit_slug in FREE_WRITING_MASTER_UNITS:
        return
    if await subscriptions.is_premium(db, user):
        return
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="This Master Writing unit requires Premium",
    )


async def _writing_quota_gate(db: AsyncSession, user: User) -> Optional[str]:
    """Returns the active premium plan_code if the account is on one, after
    enforcing that plan's combined daily writing-action pool (raises 429 if
    exceeded). Returns None for a free account — free-tier drills stay on
    the one free Master Writing unit's ai_quota gate, unaffected by this
    per-tier pool."""
    sub = await subscriptions.active_subscription(db, user.id)
    plan = get_plan(sub.plan_code) if sub is not None else None
    if plan is None or plan.tier != "premium":
        return None
    if not await ielts.has_writing_action_quota(db, user.id, sub.plan_code):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily writing limit reached ({writing_actions_per_day(sub.plan_code)}/day). "
                "Your allowance refills over the next 24 hours."
            ),
        )
    return sub.plan_code


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
    # Shuffled per request: the client always opens on index 0 and "New
    # prompt" just walks forward from there, so a fixed order meant every
    # learner saw the same first few prompts and some visual kinds (e.g.
    # process diagrams, sitting later in the task1 list) were rarely seen.
    return {
        key: [WritingTask(**t) for t in random.sample(tasks, len(tasks))]
        for key, tasks in ielts.WRITING_TASKS.items()
    }


async def _essay_quota_gate(db: AsyncSession, user: User) -> Optional[str]:
    """The full-essay allowance check both writing-score routes share.

    Returns the plan code (None on the free plan) so the caller knows whether
    to log a paid writing action afterwards."""
    plan_code = await _writing_quota_gate(db, user)
    if plan_code is not None:
        if not await ielts.has_writing_essay_subcap_quota(db, user.id, plan_code):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Daily full-essay limit reached ({writing_essay_subcap_per_day(plan_code)}/day). "
                    "Your allowance refills over the next 24 hours."
                ),
            )
    elif not await ielts.has_free_writing_quota(db, user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Free plan limit reached ({ielts.FREE_WRITING_CHECKS_PER_WEEK}/week). "
                "Upgrade to Premium for more."
            ),
        )
    return plan_code


@router.get("/writing/quota", response_model=WritingQuotaOut)
async def writing_quota(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The essay allowance, read-only. Deliberately reports the same numbers
    the gate enforces, from the same helpers, so the counter on screen and
    the 429 can never disagree."""
    sub = await subscriptions.active_subscription(db, user.id)
    plan = get_plan(sub.plan_code) if sub is not None else None
    if plan is not None and plan.tier == "premium" and sub is not None:
        limit = writing_essay_subcap_per_day(sub.plan_code)
        used = await ielts.essay_checks_used_today(db, user.id)
        return WritingQuotaOut(
            period="day",
            limit=limit,
            used=min(used, limit),
            remaining=max(0, limit - used),
            premium=True,
        )
    used = await ielts.free_writing_checks_used(db, user.id)
    limit = ielts.FREE_WRITING_CHECKS_PER_WEEK
    return WritingQuotaOut(
        period="week",
        limit=limit,
        used=min(used, limit),
        remaining=max(0, limit - used),
        premium=False,
    )


@router.post("/writing/score", response_model=WritingScoreOut)
async def writing_score(
    payload: WritingScoreRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    plan_code = await _essay_quota_gate(db, user)
    score = await _guarded(
        db, user,
        lambda: ielts.score_writing(
            db, user, client, payload.task_type, payload.prompt, payload.essay,
            lang=payload.lang, mock_session_id=payload.mock_session_id,
        ),
    )
    if plan_code is not None:
        await ielts.log_writing_action(db, user.id, "essay")
    await db.commit()
    return writing_score_out(score)


@router.post("/writing/score/queue", response_model=QueuedJobOut, status_code=status.HTTP_202_ACCEPTED)
async def writing_score_queued(
    payload: WritingScoreRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: AiClient = Depends(require_ai_client),
):
    """Hands the essay to the worker instead of scoring it in this request.

    Scoring an essay takes tens of seconds: held inline it tied up a request
    for the whole model call, and a learner who lost their connection lost the
    result with it. The job survives both — poll GET /jobs/{id} for it."""
    plan_code = await _essay_quota_gate(db, user)
    if not await ai_quota.has_quota(db, user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily AI limit reached. Upgrade to Premium for unlimited AI.",
        )
    try:
        job = await job_queue.enqueue(
            db,
            user.id,
            job_handlers.WRITING_SCORE,
            {
                "task_type": payload.task_type,
                "prompt": payload.prompt,
                "essay": payload.essay,
                "lang": payload.lang,
                "mock_session_id": payload.mock_session_id,
                "plan_code": plan_code,
            },
        )
    except job_queue.TooManyJobs:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You already have scoring in progress. Wait for it to finish.",
        )
    await db.commit()
    return QueuedJobOut(job_id=job.id)


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
        result = await ielts.grade_test(
            db, user, payload.test_id, payload.answers,
            mock_session_id=payload.mock_session_id,
        )
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found or expired")
    await db.commit()
    return GradeOut(
        correct=result.correct, total=result.total, band=result.band,
        approximate=result.approximate,
        answers=result.answers, explanations=result.explanations,
        reward=_reward(result.reward),
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


# --- Master Writing drills -----------------------------------------------
# Short single-shot checks, gated by the general ai_quota (via _guarded)
# rather than the writing-specific quota — see services.ielts's module
# comment above score_paraphrase for why. Unit-gated separately: a locked
# unit must never reach the AI call at all, so the premium check runs first.


@router.post("/writing/master/paraphrase-check", response_model=DrillFeedbackOut)
async def writing_master_paraphrase_check(
    payload: ParaphraseCheckRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    await _require_writing_master_unit(db, user, payload.unit_slug)
    plan_code = await _writing_quota_gate(db, user)
    result = await _guarded(
        db, user,
        lambda: ielts.score_paraphrase(
            db, user, client, payload.original_title, payload.paraphrase, lang=payload.lang
        ),
    )
    if plan_code is not None:
        await ielts.log_writing_action(db, user.id, "drill")
    await db.commit()
    return DrillFeedbackOut(
        quality=result.quality, feedback=result.feedback,
        model_example=result.model_example, score=result.score,
        xp_gained=result.reward.xp_gained, leveled_up=result.reward.leveled_up,
    )


@router.post("/writing/master/overview-check", response_model=DrillFeedbackOut)
async def writing_master_overview_check(
    payload: OverviewCheckRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    await _require_writing_master_unit(db, user, payload.unit_slug)
    plan_code = await _writing_quota_gate(db, user)
    result = await _guarded(
        db, user,
        lambda: ielts.score_overview(
            db, user, client, payload.visual, payload.overview, lang=payload.lang
        ),
    )
    if plan_code is not None:
        await ielts.log_writing_action(db, user.id, "drill")
    await db.commit()
    return DrillFeedbackOut(
        quality=result.quality, feedback=result.feedback,
        model_example=result.model_example, score=result.score,
        xp_gained=result.reward.xp_gained, leveled_up=result.reward.leveled_up,
    )
