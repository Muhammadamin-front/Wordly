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


async def require_trusted_origin(request: Request) -> None:
    """Protect cookie-authenticated mutations from cross-site browser requests.

    Bearer-authenticated API calls remain available to mobile/server clients;
    browsers always send Origin on cross-site POSTs, which is the CSRF boundary.
    """

    origin = request.headers.get("origin")
    if origin and origin not in get_settings().cors_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Untrusted origin")
