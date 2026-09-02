"""Postgres-backed work queue.

No broker: `SELECT ... FOR UPDATE SKIP LOCKED` is the standard way to hand a
row to exactly one of several workers, and it keeps jobs in the same
transactional store as the data they produce — a job cannot be marked done
while the write it performed rolls back. SQLite (the fast test suite) has no
SKIP LOCKED, so `claim` falls back to a plain ordered read there; the test
suite runs one worker at a time, which is the condition that makes it safe.
"""

import uuid
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.jobs import (
    JOB_DONE,
    JOB_FAILED,
    JOB_QUEUED,
    JOB_RUNNING,
    AiJob,
)

# A learner with this many jobs still in flight is asked to wait rather than
# adding more: one impatient tab must not be able to fill the queue.
MAX_JOBS_IN_FLIGHT = 3
# A job that keeps failing is given up on rather than retried forever.
MAX_ATTEMPTS = 3


class TooManyJobs(Exception):
    """Raised by enqueue when the learner is already at MAX_JOBS_IN_FLIGHT."""


async def in_flight(db: AsyncSession, user_id: uuid.UUID) -> int:
    rows = await db.execute(
        select(AiJob.id).where(
            AiJob.user_id == user_id,
            AiJob.status.in_((JOB_QUEUED, JOB_RUNNING)),
        )
    )
    return len(rows.scalars().all())


async def enqueue(
    db: AsyncSession, user_id: uuid.UUID, kind: str, payload: dict[str, Any]
) -> AiJob:
    if await in_flight(db, user_id) >= MAX_JOBS_IN_FLIGHT:
        raise TooManyJobs()
    job = AiJob(user_id=user_id, kind=kind, payload=payload)
    db.add(job)
    await db.flush()
    return job


async def get(db: AsyncSession, job_id: uuid.UUID, user_id: uuid.UUID) -> Optional[AiJob]:
    """Scoped to the owner: a job id must not be readable by anyone else."""
    result = await db.execute(
        select(AiJob).where(AiJob.id == job_id, AiJob.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def claim(db: AsyncSession, kinds: tuple[str, ...]) -> Optional[AiJob]:
    """Takes the oldest queued job of one of `kinds` and marks it running."""
    statement = (
        select(AiJob)
        .where(AiJob.status == JOB_QUEUED, AiJob.kind.in_(kinds))
        .order_by(AiJob.created_at)
        .limit(1)
    )
    if db.bind is not None and db.bind.dialect.name == "postgresql":
        statement = statement.with_for_update(skip_locked=True)
    job = (await db.execute(statement)).scalar_one_or_none()
    if job is None:
        return None
    job.status = JOB_RUNNING
    job.started_at = utcnow()
    job.attempts += 1
    await db.flush()
    return job


async def complete(db: AsyncSession, job: AiJob, result: dict[str, Any]) -> None:
    job.status = JOB_DONE
    job.result = result
    job.error = None
    job.finished_at = utcnow()
    await db.flush()


async def fail(db: AsyncSession, job: AiJob, message: str) -> None:
    """Requeues the job until MAX_ATTEMPTS, then gives up.

    The message is written either way, so a learner waiting on a job that is
    still being retried can be told it is retrying rather than nothing."""
    job.error = message
    if job.attempts >= MAX_ATTEMPTS:
        job.status = JOB_FAILED
        job.finished_at = utcnow()
    else:
        job.status = JOB_QUEUED
        job.started_at = None
    await db.flush()
