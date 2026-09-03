"""A small Prometheus-format endpoint.

Sentry says what broke and the uptime probes say whether the site answers.
Neither says the thing that actually precedes an outage: requests getting
slower, the database pool running out, the job queue backing up. These are
the four numbers worth watching on one box, and nothing more — an exporter
with fifty metrics nobody reads is its own kind of noise.

Guarded by a bearer token rather than left open: the counts are not secret,
but they describe the system's health to anyone deciding whether to push it.
Unset token means the route does not exist at all.
"""

import time

from fastapi import APIRouter, Header, HTTPException, Request, status
from fastapi.responses import PlainTextResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.config import get_settings
from app.db.session import get_db, get_engine
from app.models.jobs import JOB_QUEUED, JOB_RUNNING, AiJob

router = APIRouter(tags=["metrics"], include_in_schema=False)

STARTED_AT = time.time()


def _line(name: str, help_text: str, value: float, metric_type: str = "gauge") -> str:
    return "# HELP {n} {h}\n# TYPE {n} {t}\n{n} {v}\n".format(
        n=name, h=help_text, t=metric_type, v=value
    )


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics(
    request: Request,
    authorization: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    token = settings.METRICS_TOKEN
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if authorization != "Bearer {}".format(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    pool = get_engine().pool
    queued = await db.scalar(
        select(func.count(AiJob.id)).where(AiJob.status == JOB_QUEUED)
    )
    running = await db.scalar(
        select(func.count(AiJob.id)).where(AiJob.status == JOB_RUNNING)
    )
    # Collected by the timing middleware in main.py; empty until the first
    # request after a restart.
    latency = getattr(request.app.state, "request_latency", None)

    body = [
        _line("vocora_uptime_seconds", "Seconds since this worker started", time.time() - STARTED_AT),
        _line(
            "vocora_db_pool_checked_out",
            "Database connections currently held by requests",
            getattr(pool, "checkedout", lambda: 0)(),
        ),
        _line(
            "vocora_db_pool_size",
            "Configured pool size, excluding overflow",
            getattr(pool, "size", lambda: 0)(),
        ),
        _line("vocora_jobs_queued", "AI jobs waiting for a worker", queued or 0),
        _line("vocora_jobs_running", "AI jobs currently being processed", running or 0),
    ]
    if latency is not None:
        body.append(
            _line(
                "vocora_request_seconds_p95",
                "95th percentile request duration over the last window",
                latency.p95(),
            )
        )
        body.append(
            _line(
                "vocora_requests_total",
                "Requests served since this worker started",
                latency.count,
                metric_type="counter",
            )
        )
    return "".join(body)
