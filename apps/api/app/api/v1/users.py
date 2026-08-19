import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.core.security import utcnow
from app.db.session import get_db
from app.models.billing import Payment, Referral, Subscription
from app.models.flashcards import Card, Deck, ReviewLog
from app.models.gamification import DailyActivity, GameRun, UserAchievement, UserStats
from app.models.user import User
from app.models.vocabulary import Word
from app.schemas.auth import (
    AccountDeletionRequest,
    MessageOut,
    OnboardingOut,
    OnboardingRequest,
    ProfileUpdate,
    UserOut,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/users", tags=["users"])

STARTER_CARD_COUNT = 5
STARTER_DECK_COPY = {
    "uz": ("Birinchi 5 ta so'zim", "Siz uchun tanlangan boshlang'ich dars"),
    "ru": ("Мои первые 5 слов", "Первая персональная подборка слов"),
    "en": ("My first 5 words", "Your personalized starter lesson"),
}


@router.patch("/me", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user.profile, field, value)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/me/export", dependencies=[Depends(rate_limit("export"))])
async def export_account_data(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Everything the account has generated, as one downloadable JSON file.

    Auth internals (refresh/reset tokens) and provider transaction plumbing
    (Payme/Click ids, idempotency keys) are left out — they aren't the user's
    learning or billing data, they're how we keep the account secure and the
    ledger correct.
    """
    profile = user.profile

    decks = (
        await db.scalars(select(Deck).where(Deck.user_id == user.id))
    ).all()

    cards = (
        await db.scalars(
            select(Card).where(Card.user_id == user.id).order_by(Card.created_at)
        )
    ).all()

    review_logs = (
        await db.scalars(
            select(ReviewLog)
            .where(ReviewLog.user_id == user.id)
            .order_by(ReviewLog.reviewed_at)
        )
    ).all()

    stats = await db.get(UserStats, user.id)

    daily_activity = (
        await db.scalars(
            select(DailyActivity)
            .where(DailyActivity.user_id == user.id)
            .order_by(DailyActivity.day)
        )
    ).all()

    achievements = (
        await db.scalars(
            select(UserAchievement)
            .where(UserAchievement.user_id == user.id)
            .order_by(UserAchievement.unlocked_at)
        )
    ).all()

    game_runs = (
        await db.scalars(
            select(GameRun).where(GameRun.user_id == user.id).order_by(GameRun.created_at)
        )
    ).all()

    subscriptions = (
        await db.scalars(
            select(Subscription)
            .where(Subscription.user_id == user.id)
            .order_by(Subscription.created_at)
        )
    ).all()

    payments = (
        await db.scalars(
            select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at)
        )
    ).all()

    referrals_made = (
        await db.scalars(
            select(Referral).where(Referral.referrer_id == user.id).order_by(Referral.created_at)
        )
    ).all()

    export = {
        "exported_at": utcnow().isoformat(),
        "account": {
            "id": str(user.id),
            "email": user.email,
            "email_verified": user.email_verified,
            "role": user.role,
            "created_at": user.created_at.isoformat(),
        },
        "profile": {
            "display_name": profile.display_name,
            "ui_locale": profile.ui_locale,
            "timezone": profile.timezone,
            "bio": profile.bio,
            "cefr_level": profile.cefr_level,
            "learning_goal": profile.learning_goal,
            "daily_minutes": profile.daily_minutes,
            "learning_interests": profile.learning_interests,
            "onboarding_completed": profile.onboarding_completed,
        },
        "decks": [
            {
                "id": str(deck.id),
                "name": deck.name,
                "description": deck.description,
                "created_at": deck.created_at.isoformat(),
            }
            for deck in decks
        ],
        "cards": [
            {
                "id": str(card.id),
                "deck_id": str(card.deck_id) if card.deck_id else None,
                "word": card.word.headword if card.word else None,
                "front_text": card.front_text,
                "back_text": card.back_text,
                "is_favorite": card.is_favorite,
                "memory_note": card.memory_note,
                "srs_state": card.srs_state,
                "repetitions": card.repetitions,
                "lapses": card.lapses,
                "due_at": card.due_at.isoformat(),
                "created_at": card.created_at.isoformat(),
            }
            for card in cards
        ],
        "review_history": [
            {
                "card_id": str(log.card_id),
                "rating": log.rating,
                "state_before": log.state_before,
                "reviewed_at": log.reviewed_at.isoformat(),
            }
            for log in review_logs
        ],
        "stats": (
            {
                "xp": stats.xp,
                "coins": stats.coins,
                "total_reviews": stats.total_reviews,
                "current_streak": stats.current_streak,
                "longest_streak": stats.longest_streak,
                "daily_goal": stats.daily_goal,
            }
            if stats
            else None
        ),
        "daily_activity": [
            {
                "day": day.day.isoformat(),
                "reviews_count": day.reviews_count,
                "xp_earned": day.xp_earned,
                "goal_reached": day.goal_reached,
            }
            for day in daily_activity
        ],
        "achievements": [
            {"code": achievement.code, "unlocked_at": achievement.unlocked_at.isoformat()}
            for achievement in achievements
        ],
        "game_runs": [
            {
                "game_type": run.game_type,
                "day": run.day.isoformat(),
                "answered_count": run.answered_count,
                "correct_count": run.correct_count,
                "best_combo": run.best_combo,
                "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            }
            for run in game_runs
        ],
        "subscriptions": [
            {
                "plan_code": sub.plan_code,
                "status": sub.status,
                "provider": sub.provider,
                "seats": sub.seats,
                "started_at": sub.started_at.isoformat(),
                "expires_at": sub.expires_at.isoformat(),
                "cancelled_at": sub.cancelled_at.isoformat() if sub.cancelled_at else None,
            }
            for sub in subscriptions
        ],
        "payments": [
            {
                "provider": payment.provider,
                "plan_code": payment.plan_code,
                "amount_tiyin": payment.amount_tiyin,
                "currency": payment.currency,
                "status": payment.status,
                "created_at": payment.created_at.isoformat(),
            }
            for payment in payments
        ],
        "referrals_made": len(referrals_made),
    }

    filename = "vocora-export-{}.json".format(user.id)
    return Response(
        content=json.dumps(export, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="{}"'.format(filename)},
    )


@router.post("/me/delete", response_model=MessageOut, status_code=status.HTTP_202_ACCEPTED)
async def request_account_deletion(
    payload: AccountDeletionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate and anonymize a user while retaining required payment records.

    Financial/payment rows keep their foreign key for fraud, accounting, and
    chargeback handling. Authentication identifiers and public profile data are
    removed, and every active refresh session is revoked immediately.
    """
    if payload.confirmation != "DELETE":  # Pydantic protects this too; explicit for clarity.
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

    deleted_email = "deleted-{}@deleted.vocora.invalid".format(user.id)
    user.is_active = False
    user.email = deleted_email
    user.google_id = None
    user.apple_id = None
    user.referral_code = None
    user.email_verified_at = None
    user.password_hash = None
    user.profile.display_name = "Deleted Vocora account"
    user.profile.avatar_url = None
    user.profile.bio = None
    await auth_service.revoke_all_user_sessions(db, user.id)
    await db.commit()
    return MessageOut(message="Account deleted")


@router.put("/me/onboarding", response_model=OnboardingOut)
async def complete_onboarding(
    payload: OnboardingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Persist the learning path and create one retry-safe five-word lesson."""
    profile = user.profile
    deck = None
    if profile.starter_deck_id is not None:
        deck = await db.scalar(
            select(Deck).where(
                Deck.id == profile.starter_deck_id,
                Deck.user_id == user.id,
            )
        )

    if deck is None:
        name, description = STARTER_DECK_COPY.get(
            profile.ui_locale, STARTER_DECK_COPY["en"]
        )
        deck = Deck(user_id=user.id, name=name, description=description)
        db.add(deck)
        await db.flush()
        profile.starter_deck_id = deck.id

    current_count = int(
        (
            await db.scalar(
                select(func.count(Card.id)).where(
                    Card.user_id == user.id,
                    Card.deck_id == deck.id,
                )
            )
        )
        or 0
    )
    needed = max(0, STARTER_CARD_COUNT - current_count)
    if needed:
        owned_words = select(Card.word_id).where(
            Card.user_id == user.id,
            Card.word_id.isnot(None),
        )
        word_ids = (
            await db.scalars(
                select(Word.id)
                .where(
                    Word.status == "published",
                    Word.cefr_level == payload.cefr_level,
                    Word.id.not_in(owned_words),
                )
                .order_by(Word.frequency_rank.asc().nulls_last(), Word.headword)
                .limit(needed)
            )
        ).all()
        if len(word_ids) != needed:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Not enough published words for this starter lesson",
            )
        for word_id in word_ids:
            db.add(Card(user_id=user.id, deck_id=deck.id, word_id=word_id))

    profile.cefr_level = payload.cefr_level
    profile.learning_goal = payload.learning_goal
    profile.daily_minutes = payload.daily_minutes
    profile.learning_interests = list(dict.fromkeys(payload.learning_interests))
    profile.onboarding_completed = True
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return OnboardingOut(
        user=UserOut.model_validate(user),
        starter_deck_id=deck.id,
        starter_cards=STARTER_CARD_COUNT,
    )
