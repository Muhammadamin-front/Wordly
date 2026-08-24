from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.grammar_progress import (
    GrammarAttemptRequest,
    GrammarProgressEntryOut,
    GrammarProgressOut,
    GrammarProgressSyncRequest,
)
from app.services import grammar_progress

router = APIRouter(
    prefix="/me/grammar-progress",
    tags=["grammar-progress"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("default"))],
)


def _out(rows) -> GrammarProgressOut:
    return GrammarProgressOut(
        entries=[
            GrammarProgressEntryOut(
                lesson_slug=row.lesson_slug,
                attempts=row.attempts,
                best_score=row.best_score,
                last_score=row.last_score,
                updated_at=row.updated_at.replace(tzinfo=timezone.utc),
            )
            for row in rows
        ]
    )


@router.get("", response_model=GrammarProgressOut)
async def get_progress(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return _out(await grammar_progress.list_progress(db, user))


@router.post("/sync", response_model=GrammarProgressOut)
async def sync_progress(
    payload: GrammarProgressSyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await grammar_progress.merge_legacy_progress(db, user, payload.entries)
    await db.commit()
    return _out(rows)


@router.post("/attempt", response_model=GrammarProgressEntryOut)
async def record_attempt(
    payload: GrammarAttemptRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        row = await grammar_progress.record_attempt(
            db,
            user,
            attempt_id=payload.attempt_id,
            lesson_slug=payload.lesson_slug,
            score=payload.score,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    await db.commit()
    return GrammarProgressEntryOut(
        lesson_slug=row.lesson_slug,
        attempts=row.attempts,
        best_score=row.best_score,
        last_score=row.last_score,
        updated_at=row.updated_at.replace(tzinfo=timezone.utc),
    )
