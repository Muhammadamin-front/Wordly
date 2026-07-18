"""Public browse API for the English Expression Library."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import distinct, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.expression import Expression

router = APIRouter(prefix="/expressions", tags=["expressions"])

CEFR_PATTERN = "^(A2|B1|B2|C1|C2)$"


class ExpressionOut(BaseModel):
    slug: str
    expression: str
    uzbek: str
    cefr: str
    ielts_band: str
    category: str
    formality: str
    usage: str
    grammar_pattern: str
    native_notes: str
    common_mistakes: List[str]
    alternatives: List[str]
    example_sentences: List[str]
    collocations: List[str]
    synonyms: List[str]
    opposites: List[str]

    model_config = {"from_attributes": True}


class ExpressionListItem(BaseModel):
    slug: str
    expression: str
    uzbek: str
    cefr: str
    ielts_band: str
    category: str
    formality: str

    model_config = {"from_attributes": True}


class ExpressionPage(BaseModel):
    items: List[ExpressionListItem]
    total: int
    page: int
    page_size: int


class CategoryCount(BaseModel):
    category: str
    count: int


class ExpressionMeta(BaseModel):
    total: int
    categories: List[CategoryCount]


@router.get("/meta", response_model=ExpressionMeta)
async def expression_meta(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count(Expression.id))) or 0
    rows = await db.execute(
        select(Expression.category, func.count(Expression.id))
        .group_by(Expression.category)
        .order_by(func.count(Expression.id).desc())
    )
    return ExpressionMeta(
        total=total,
        categories=[CategoryCount(category=c, count=n) for c, n in rows.all()],
    )


@router.get("", response_model=ExpressionPage)
async def browse_expressions(
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    cefr: Optional[str] = Query(None, pattern=CEFR_PATTERN),
    category: Optional[str] = Query(None, max_length=60),
    q: Optional[str] = Query(None, max_length=80),
    db: AsyncSession = Depends(get_db),
):
    conds = []
    if cefr:
        conds.append(Expression.cefr == cefr)
    if category:
        conds.append(Expression.category == category)
    if q:
        like = f"%{q.strip()}%"
        conds.append(or_(Expression.expression.ilike(like), Expression.uzbek.ilike(like)))

    base = select(Expression)
    count_q = select(func.count(distinct(Expression.id)))
    for c in conds:
        base = base.where(c)
        count_q = count_q.where(c)

    total = await db.scalar(count_q) or 0
    rows = await db.scalars(
        base.order_by(Expression.category, Expression.cefr, Expression.expression)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return ExpressionPage(
        items=[ExpressionListItem.model_validate(e) for e in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{slug}", response_model=ExpressionOut)
async def expression_detail(slug: str, db: AsyncSession = Depends(get_db)):
    expr = await db.scalar(select(Expression).where(Expression.slug == slug))
    if expr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expression not found")
    return ExpressionOut.model_validate(expr)
