from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.statistics import (
    LearningPlanOut,
    MasteryMapOut,
    MistakeNotebookOut,
    StatisticsOut,
)
from app.services import statistics as stats_service

router = APIRouter(tags=["statistics"], dependencies=[Depends(get_current_user)])


@router.get("/me/statistics", response_model=StatisticsOut)
async def my_statistics(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    cards = await stats_service.card_state_counts(db, user)
    accuracy = await stats_service.review_accuracy(db, user)
    return StatisticsOut(
        cards=cards,
        total_reviews=accuracy["total_reviews"],
        accuracy_all=accuracy["accuracy_all"],
        accuracy_mature=accuracy["accuracy_mature"],
        time_spent_ms=await stats_service.time_spent_ms(db, user),
        rating_breakdown=await stats_service.rating_breakdown(db, user),
        reviews_by_day=await stats_service.reviews_by_day(db, user),
        forgotten=await stats_service.forgotten_words(db, user),
        mastered=await stats_service.mastered_words(db, user),
        weak_categories=await stats_service.weak_categories(db, user),
    )


@router.get("/me/learning-plan", response_model=LearningPlanOut)
async def my_learning_plan(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return LearningPlanOut(**(await stats_service.learning_plan(db, user)))


@router.get("/me/mastery-map", response_model=MasteryMapOut)
async def my_mastery_map(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return MasteryMapOut(**(await stats_service.mastery_map(db, user)))


@router.get("/me/mistakes", response_model=MistakeNotebookOut)
async def my_mistakes(
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return MistakeNotebookOut(**(await stats_service.mistake_notebook(db, user, limit)))
