from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.core.config import get_settings
from app.core.roles import ADMIN_ROLES, CONTENT_ROLES, SUPPORT_ROLES, SUPER_ADMIN
from app.db.session import get_db
from app.models.user import User
from app.services import coins, subscriptions

bearer_scheme = HTTPBearer(auto_error=False)

REFRESH_COOKIE_NAME = "words_refresh"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def refresh_token_from_cookie(request: Request) -> Optional[str]:
    """Refresh credentials are accepted only from the httpOnly cookie."""
    return request.cookies.get(REFRESH_COOKIE_NAME)


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


async def require_super_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return user


async def require_content_manager(user: User = Depends(get_current_user)) -> User:
    if user.role not in CONTENT_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Content manager access required")
    return user


async def require_support(user: User = Depends(get_current_user)) -> User:
    if user.role not in SUPPORT_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Support access required")
    return user


async def require_premium(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> User:
    """First hard feature gate in the API — everywhere else `is_premium()` is
    checked, it only raises the daily AI-action quota (app.services.ai_quota),
    it never blocks a request outright."""
    if not await subscriptions.is_premium(db, user):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Premium subscription required",
        )
    return user


async def charge_coins_or_require_premium(
    db: AsyncSession, user: User, cost: int, reason: str
) -> None:
    """A premium user passes through free; a free user is charged `cost`
    coins from their wallet. Raises 402 with a body distinguishable from
    require_premium's (`{"reason": "insufficient_coins", "balance": n,
    "required": cost}`) so the client can render a "buy coins" prompt
    instead of a generic "upgrade" one.

    Call this only at the point in a route where the paid action is
    actually guaranteed to happen — an earlier failure in the same route
    (a conflict check, a validation error) must not have already charged
    the user. That's why this is a plain async function to call inline at
    the right moment, not a FastAPI dependency: dependencies all resolve
    before the route body runs, which would charge for a request that then
    fails for an unrelated reason.
    """
    if await subscriptions.is_premium(db, user):
        return
    try:
        await coins.debit(db, user.id, cost, reason=reason)
    except coins.InsufficientCoins as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "reason": "insufficient_coins",
                "balance": exc.balance,
                "required": exc.requested,
            },
        )


def spend_coins_or_premium(cost: int, reason: str):
    """Dependency-factory wrapper around charge_coins_or_require_premium, for
    routes where there's no earlier failure point that must run first (e.g.
    a route that does nothing but gate access to already-existing content —
    see flashcards.py's C1/C2 unlock check)."""

    async def dependency(
        user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
    ) -> User:
        await charge_coins_or_require_premium(db, user, cost, reason)
        return user

    return dependency


async def require_trusted_origin(request: Request) -> None:
    """Protect cookie-authenticated mutations from cross-site browser requests.

    Bearer-authenticated API calls remain available to mobile/server clients;
    browsers always send Origin on cross-site POSTs, which is the CSRF boundary.
    """

    origin = request.headers.get("origin")
    if origin and origin not in get_settings().cors_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted origin")
