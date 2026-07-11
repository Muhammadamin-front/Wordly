from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import REFRESH_COOKIE_NAME, get_current_user, refresh_token_from_request
from app.core.config import Settings, get_settings
from app.core.rate_limit import client_ip, rate_limit
from app.core.security import create_access_token, hash_password, utcnow, verify_password
from app.db.session import get_db
from app.models.user import Profile, User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    MessageOut,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
    UserOut,
    VerifyEmailRequest,
)
from app.services import auth as auth_service
from app.services import referrals
from app.services.emailer import Emailer, get_emailer
from app.services.google_oauth import GoogleVerifier, get_google_verifier

router = APIRouter(prefix="/auth", tags=["auth"])


def set_refresh_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.REFRESH_TOKEN_TTL_SECONDS,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        domain=settings.COOKIE_DOMAIN,
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME, domain=settings.COOKIE_DOMAIN, path="/api/v1/auth"
    )


async def build_token_pair(
    db: AsyncSession, user: User, request: Request, response: Response
) -> TokenPair:
    settings = get_settings()
    refresh = await auth_service.issue_refresh_token(
        db, user, user_agent=request.headers.get("user-agent"), ip_address=client_ip(request)
    )
    await db.commit()
    set_refresh_cookie(response, refresh, settings)
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=refresh,
        expires_in=settings.ACCESS_TOKEN_TTL_SECONDS,
        user=UserOut.model_validate(user),
    )


def verification_email_body(display_name: str, token: str, settings: Settings) -> str:
    link = "{}/auth/verify-email?token={}".format(settings.FRONTEND_ORIGIN, token)
    return (
        "Assalomu alaykum, {}!\n\n"
        "Wordly hisobingizni tasdiqlash uchun havola / "
        "Confirm your Wordly account:\n{}\n".format(display_name, link)
    )


@router.post(
    "/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register"))],
)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    emailer: Emailer = Depends(get_emailer),
):
    settings = get_settings()
    email = payload.email.lower()
    existing = await db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    user = User(email=email, password_hash=hash_password(payload.password))
    user.profile = Profile(display_name=payload.display_name.strip(), ui_locale=payload.ui_locale)
    db.add(user)
    await db.flush()

    await referrals.ensure_code(db, user)
    if payload.referral_code:
        await referrals.link_referral(db, user, payload.referral_code)

    verify_token = await auth_service.create_one_time_token(
        db, user, "verify_email", settings.EMAIL_TOKEN_TTL_SECONDS
    )
    await emailer.send(
        to=user.email,
        subject="Wordly — hisobni tasdiqlash / Verify your account",
        body=verification_email_body(user.profile.display_name, verify_token, settings),
    )
    return await build_token_pair(db, user, request, response)


@router.post("/login", response_model=TokenPair, dependencies=[Depends(rate_limit("login"))])
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    # Same error for unknown email and wrong password: no account enumeration.
    if (
        user is None
        or not user.is_active
        or user.password_hash is None
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )
    return await build_token_pair(db, user, request, response)


@router.post("/google", response_model=TokenPair, dependencies=[Depends(rate_limit("login"))])
async def google_login(
    payload: GoogleLoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    verifier: GoogleVerifier = Depends(get_google_verifier),
):
    identity = await verifier.verify(payload.id_token)
    if identity is None or not identity.email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Google sign-in failed"
        )

    email = identity.email.lower()
    user = await db.scalar(select(User).where(User.google_id == identity.sub))
    if user is None:
        user = await db.scalar(select(User).where(User.email == email))
        if user is not None:
            user.google_id = identity.sub  # link Google to existing email account
        else:
            user = User(email=email, google_id=identity.sub, email_verified_at=utcnow())
            user.profile = Profile(
                display_name=(identity.name or email.split("@")[0])[:80],
                avatar_url=identity.picture,
            )
            db.add(user)
        await db.flush()
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    if user.email_verified_at is None:
        user.email_verified_at = utcnow()  # Google already verified this email
    return await build_token_pair(db, user, request, response)


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    raw = refresh_token_from_request(request, payload.refresh_token if payload else None)
    if not raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    rotated = await auth_service.rotate_refresh_token(
        db, raw, user_agent=request.headers.get("user-agent"), ip_address=client_ip(request)
    )
    if rotated is None:
        clear_refresh_cookie(response, settings)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user, new_refresh = rotated
    await db.commit()
    set_refresh_cookie(response, new_refresh, settings)
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_TTL_SECONDS,
        user=UserOut.model_validate(user),
    )


@router.post("/logout", response_model=MessageOut)
async def logout(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    raw = refresh_token_from_request(request, payload.refresh_token if payload else None)
    if raw:
        await auth_service.revoke_refresh_token(db, raw)
        await db.commit()
    clear_refresh_cookie(response, settings)
    return MessageOut(message="Logged out")


@router.post("/verify-email", response_model=MessageOut)
async def verify_email(payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.consume_one_time_token(db, payload.token, "verify_email")
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )
    if user.email_verified_at is None:
        user.email_verified_at = utcnow()
    await db.commit()
    return MessageOut(message="Email verified")


@router.post(
    "/forgot-password",
    response_model=MessageOut,
    dependencies=[Depends(rate_limit("forgot_password"))],
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
    emailer: Emailer = Depends(get_emailer),
):
    settings = get_settings()
    user = await db.scalar(
        select(User).where(User.email == payload.email.lower(), User.is_active.is_(True))
    )
    if user is not None and user.password_hash is not None:
        token = await auth_service.create_one_time_token(
            db, user, "reset_password", settings.RESET_TOKEN_TTL_SECONDS
        )
        await db.commit()
        link = "{}/auth/reset-password?token={}".format(settings.FRONTEND_ORIGIN, token)
        await emailer.send(
            to=user.email,
            subject="Wordly — parolni tiklash / Reset your password",
            body="Parolni tiklash havolasi / Reset link:\n{}\n".format(link),
        )
    # Identical response either way: no account enumeration.
    return MessageOut(message="If that email exists, a reset link has been sent")


@router.post("/reset-password", response_model=MessageOut)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.consume_one_time_token(db, payload.token, "reset_password")
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )
    user.password_hash = hash_password(payload.new_password)
    await auth_service.revoke_all_user_sessions(db, user.id)
    await db.commit()
    return MessageOut(message="Password updated. Please log in again.")


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)
