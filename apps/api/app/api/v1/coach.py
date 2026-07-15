"""AI Speaking Coach endpoints — character voice-chat, grammar feedback, and
IELTS band scoring. AI calls are quota-guarded and rate-limited like /ai."""
import json
from typing import Awaitable, Callable, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.coach import CoachMessage
from app.models.user import User
from app.schemas.coach import (
    CharacterOut,
    CharacterProgressOut,
    CorrectionOut,
    CreateSessionRequest,
    DashboardOut,
    GrammarErrorOut,
    IeltsReportOut,
    MessageOut,
    RewardOut,
    ScoreResponse,
    SessionListItem,
    SessionOut,
    TurnRequest,
    TurnResponse,
)
from app.services import ai_quota, coach
from app.services.ai_client import AiClient, AiError, get_ai_client
from app.services.coach_streaming import stream_turn
from app.services.gamification import RewardSummary

router = APIRouter(
    prefix="/coach",
    tags=["coach"],
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
    """Enforce the daily AI quota; charge a slot only on success."""
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
    return result


def _reward_out(reward: RewardSummary) -> RewardOut:
    return RewardOut(
        xp_gained=reward.xp_gained,
        total_xp=reward.total_xp,
        level=reward.level,
        leveled_up=reward.leveled_up,
    )


def _corrections(raw: Optional[str]) -> List[CorrectionOut]:
    if not raw:
        return []
    try:
        return [CorrectionOut(**c) for c in json.loads(raw)]
    except (ValueError, TypeError):
        return []


def _message_out(message: CoachMessage) -> MessageOut:
    return MessageOut(
        role=message.role,
        content=message.content,
        corrections=_corrections(message.corrections_json),
        created_at=message.created_at,
    )


def _session_out(session) -> SessionOut:
    return SessionOut(
        id=session.id,
        character=session.character,
        mode=session.mode,
        ielts_part=session.ielts_part,
        topic=session.topic,
        status=session.status,
        turns=session.turns,
        started_at=session.started_at,
        completed_at=session.completed_at,
        messages=[_message_out(m) for m in session.messages],
    )


def _report_out(report) -> IeltsReportOut:
    return IeltsReportOut(
        band_overall=report.band_overall,
        fluency=report.fluency,
        lexical=report.lexical,
        grammar=report.grammar,
        pronunciation=report.pronunciation,
        strengths=report.strengths,
        improvements=report.improvements,
        homework=report.homework,
        created_at=report.created_at,
    )


async def _load_session(db: AsyncSession, user: User, session_id: UUID):
    session = await coach.get_session(db, user, session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.get("/characters", response_model=list[CharacterOut])
async def characters():
    return [
        CharacterOut(
            key=c.key, name=c.name, emoji=c.emoji, tagline=c.tagline,
            accent=c.accent, pitch=c.pitch, rate=c.rate,
        )
        for c in coach.list_characters()
    ]


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    counts = await coach.dashboard_counts(db, user)
    progress = await coach.progress_all(db, user)
    errors = await coach.recent_errors(db, user)
    report = await coach.latest_report(db, user)
    return DashboardOut(
        total_sessions=counts["total_sessions"],
        total_turns=counts["total_turns"],
        total_errors=counts["total_errors"],
        progress=[
            CharacterProgressOut(
                character=p.character,
                sessions_count=p.sessions_count,
                messages_count=p.messages_count,
                friendship_xp=p.friendship_xp,
                friendship_level=coach.friendship_level(p.friendship_xp),
            )
            for p in progress.values()
        ],
        recent_errors=[
            GrammarErrorOut(
                original=e.original, correction=e.correction,
                explanation=e.explanation, category=e.category, created_at=e.created_at,
            )
            for e in errors
        ],
        latest_report=_report_out(report) if report else None,
        enabled=get_settings().ai_enabled,
    )


@router.get("/sessions", response_model=list[SessionListItem])
async def sessions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [
        SessionListItem(
            id=s.id, character=s.character, mode=s.mode, ielts_part=s.ielts_part,
            topic=s.topic, status=s.status, turns=s.turns, started_at=s.started_at,
        )
        for s in await coach.list_sessions(db, user)
    ]


@router.post("/sessions", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: CreateSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if coach.get_character(payload.character) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown character")
    session = await coach.create_session(
        db, user,
        character=payload.character, mode=payload.mode,
        ielts_part=payload.ielts_part, topic=payload.topic,
    )
    await db.commit()
    await db.refresh(session)
    return _session_out(session)


@router.get("/sessions/{session_id}", response_model=SessionOut)
async def get_session(
    session_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return _session_out(await _load_session(db, user, session_id))


@router.post("/sessions/{session_id}/message", response_model=TurnResponse)
async def send_message(
    session_id: UUID,
    payload: TurnRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    session = await _load_session(db, user, session_id)
    if session.status == "done":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="This session is already finished"
        )
    result = await _guarded(
        db, user, lambda: coach.send_turn(db, user, session, payload.text, client)
    )
    await db.commit()
    return TurnResponse(
        reply=result.reply,
        corrections=[CorrectionOut(**c) for c in result.corrections],
        reward=_reward_out(result.reward),
    )


@router.post("/sessions/{session_id}/stream-turn")
async def stream_turn(
    session_id: UUID,
    payload: TurnRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream the coach's response via Server-Sent Events (SSE).

    The client sends STT-transcribed text and receives the response
    token-by-token for real-time TTS playback.
    """
    session = await _load_session(db, user, session_id)
    if session.status == "done":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="This session is already finished"
        )
    if not await ai_quota.has_quota(db, user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily AI limit reached. Upgrade to Premium for unlimited AI.",
        )

    # Consume quota once at the start of the stream.
    await ai_quota.consume(db, user)
    await db.commit()

    return StreamingResponse(
        stream_turn(db, user, session, payload.text),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/sessions/{session_id}/score", response_model=ScoreResponse)
async def score_session(
    session_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    client: AiClient = Depends(require_ai_client),
):
    session = await _load_session(db, user, session_id)
    if session.mode != "ielts":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only IELTS-mode sessions can be scored",
        )
    if session.turns == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer at least one question before scoring",
        )
    report, reward = await _guarded(
        db, user, lambda: coach.score_ielts(db, user, session, client)
    )
    await db.commit()
    return ScoreResponse(report=_report_out(report), reward=_reward_out(reward))
