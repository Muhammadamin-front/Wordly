from typing import Any, Optional

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import client_ip
from app.models.audit import AdminAuditLog
from app.models.user import User


async def record_admin_action(
    db: AsyncSession,
    *,
    actor: User,
    request: Request,
    action: str,
    target_type: str,
    target_id: str,
    previous_value: Optional[dict[str, Any]] = None,
    new_value: Optional[dict[str, Any]] = None,
    reason: Optional[str] = None,
) -> None:
    """Attach an audit event to the caller's transaction.

    Commit remains owned by the route so a failed business operation never
    leaves a misleading audit row behind.
    """

    db.add(
        AdminAuditLog(
            actor_id=actor.id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            previous_value=previous_value,
            new_value=new_value,
            reason=reason.strip() if reason else None,
            request_id=getattr(request.state, "request_id", None),
            ip_address=client_ip(request),
        )
    )
    await db.flush()
