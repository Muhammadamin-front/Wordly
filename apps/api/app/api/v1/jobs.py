"""Reading back queued AI work. Enqueuing lives with the feature that owns
the job (writing scoring is in ielts.py); this router only reports state."""

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.jobs import JOB_FAILED
from app.models.user import User
from app.services import job_queue

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobOut(BaseModel):
    id: uuid.UUID
    kind: str
    # queued | running | done | failed
    status: str
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None


@router.get("/{job_id}", response_model=JobOut)
async def read_job(
    job_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job = await job_queue.get(db, job_id, user.id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobOut(
        id=job.id,
        kind=job.kind,
        status=job.status,
        result=job.result,
        # A job that is being retried still carries the last error; only
        # report it once the queue has actually given up, so the client does
        # not show a failure that is about to resolve itself.
        error=job.error if job.status == JOB_FAILED else None,
    )
