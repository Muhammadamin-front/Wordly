from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.grammar_progress import GrammarAttemptReceipt, GrammarProgress
from app.models.user import User
from app.schemas.grammar_progress import GrammarProgressEntryIn


def _naive_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


async def list_progress(db: AsyncSession, user: User) -> list[GrammarProgress]:
    rows = await db.scalars(
        select(GrammarProgress)
        .where(GrammarProgress.user_id == user.id)
        .order_by(GrammarProgress.updated_at.desc(), GrammarProgress.lesson_slug)
    )
    return list(rows)


async def _lock_account(db: AsyncSession, user: User) -> None:
    """Serialize sync and live attempts for one account."""
    await db.execute(select(User.id).where(User.id == user.id).with_for_update())


async def merge_legacy_progress(
    db: AsyncSession, user: User, entries: list[GrammarProgressEntryIn]
) -> list[GrammarProgress]:
    """Merge an old local snapshot without double-counting repeated syncs.

    Attempt counts use max rather than addition because the same local snapshot
    may be uploaded on every launch. Live attempts use ``record_attempt`` and
    its idempotency receipt instead.
    """
    await _lock_account(db, user)
    current = {row.lesson_slug: row for row in await list_progress(db, user)}
    for incoming in entries:
        incoming_updated = min(_naive_utc(incoming.updated_at), utcnow())
        row = current.get(incoming.lesson_slug)
        if row is None:
            row = GrammarProgress(
                user_id=user.id,
                lesson_slug=incoming.lesson_slug,
                attempts=incoming.attempts,
                best_score=incoming.best_score,
                last_score=incoming.last_score,
                updated_at=incoming_updated,
            )
            db.add(row)
            current[incoming.lesson_slug] = row
            continue
        row.attempts = max(row.attempts, incoming.attempts)
        row.best_score = max(row.best_score, incoming.best_score)
        if incoming_updated > row.updated_at:
            row.last_score = incoming.last_score
            row.updated_at = incoming_updated
    await db.flush()
    return sorted(current.values(), key=lambda row: (row.updated_at, row.lesson_slug), reverse=True)


async def record_attempt(
    db: AsyncSession,
    user: User,
    *,
    attempt_id: UUID,
    lesson_slug: str,
    score: int,
) -> GrammarProgress:
    await _lock_account(db, user)
    receipt = await db.get(GrammarAttemptReceipt, attempt_id)
    if receipt is not None:
        row = await db.get(GrammarProgress, (user.id, receipt.lesson_slug))
        if receipt.user_id != user.id or row is None:
            raise ValueError("Attempt id is already owned by another account")
        return row

    row = await db.scalar(
        select(GrammarProgress)
        .where(
            GrammarProgress.user_id == user.id,
            GrammarProgress.lesson_slug == lesson_slug,
        )
        .with_for_update()
    )
    now = utcnow()
    if row is None:
        row = GrammarProgress(
            user_id=user.id,
            lesson_slug=lesson_slug,
            attempts=1,
            best_score=score,
            last_score=score,
            updated_at=now,
        )
        db.add(row)
    else:
        row.attempts += 1
        row.best_score = max(row.best_score, score)
        row.last_score = score
        row.updated_at = now
    db.add(
        GrammarAttemptReceipt(
            attempt_id=attempt_id,
            user_id=user.id,
            lesson_slug=lesson_slug,
            score=score,
        )
    )
    await db.flush()
    return row
