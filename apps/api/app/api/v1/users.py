from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.flashcards import Card, Deck
from app.models.user import User
from app.models.vocabulary import Word
from app.schemas.auth import OnboardingOut, OnboardingRequest, ProfileUpdate, UserOut

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
