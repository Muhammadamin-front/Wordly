from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.classroom import Assignment, ClassMembership, Classroom
from app.models.user import User
from app.schemas.classroom import (
    AssignmentCreate,
    AssignmentOut,
    ClassAnalyticsOut,
    ClassCreate,
    ClassOut,
    JoinRequest,
    MessageOut,
    StudentAssignmentOut,
    StudentClassOut,
)
from app.services import classrooms

router = APIRouter(tags=["classrooms"], dependencies=[Depends(get_current_user)])


async def _own_class(db: AsyncSession, teacher: User, class_id: UUID) -> Classroom:
    classroom = await db.scalar(
        select(Classroom).where(Classroom.id == class_id, Classroom.teacher_id == teacher.id)
    )
    if classroom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return classroom


async def _member_class(db: AsyncSession, user: User, class_id: UUID) -> Classroom:
    classroom = await db.scalar(select(Classroom).where(Classroom.id == class_id))
    if classroom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if classroom.teacher_id == user.id:
        return classroom
    member = await db.scalar(
        select(ClassMembership.id).where(
            ClassMembership.classroom_id == class_id, ClassMembership.student_id == user.id
        )
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this class")
    return classroom


# --- Teacher ---------------------------------------------------------------


@router.post("/teacher/classes", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
async def create_class(
    payload: ClassCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await classrooms.create_class(db, user, payload.name, payload.description or "")
    await db.commit()
    out = ClassOut.model_validate(classroom)
    out.member_count = 0
    return out


@router.get("/teacher/classes", response_model=list[ClassOut])
async def list_classes(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = []
    for item in await classrooms.teacher_classes(db, user):
        out = ClassOut.model_validate(item["classroom"])
        out.member_count = item["member_count"]
        result.append(out)
    return result


@router.get("/teacher/classes/{class_id}/analytics", response_model=ClassAnalyticsOut)
async def class_analytics(
    class_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await _own_class(db, user, class_id)
    return await classrooms.class_analytics(db, classroom)


@router.post(
    "/teacher/classes/{class_id}/assignments",
    response_model=AssignmentOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_assignment(
    class_id: UUID,
    payload: AssignmentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await _own_class(db, user, class_id)
    assignment = Assignment(
        classroom_id=classroom.id,
        title=payload.title.strip(),
        instructions=payload.instructions,
        target_reviews=payload.target_reviews,
        due_at=payload.due_at.replace(tzinfo=None),
    )
    db.add(assignment)
    await db.commit()
    return AssignmentOut.model_validate(assignment)


@router.delete("/teacher/classes/{class_id}", response_model=MessageOut)
async def archive_class(
    class_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await _own_class(db, user, class_id)
    classroom.archived = True
    await db.commit()
    return MessageOut(message="Class archived")


# --- Student ---------------------------------------------------------------


@router.post("/classes/join", response_model=StudentClassOut)
async def join_class(
    payload: JoinRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await classrooms.join_class(db, user, payload.code)
    if classroom is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid class code")
    await db.commit()
    return StudentClassOut.model_validate(classroom)


@router.get("/me/classes", response_model=list[StudentClassOut])
async def my_classes(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return [StudentClassOut.model_validate(c) for c in await classrooms.student_classes(db, user)]


@router.get("/classes/{class_id}/assignments", response_model=list[StudentAssignmentOut])
async def class_assignments(
    class_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    classroom = await _member_class(db, user, class_id)
    rows = await classrooms.student_assignments(db, classroom, user.id)
    return [
        StudentAssignmentOut(
            assignment=AssignmentOut.model_validate(r["assignment"]),
            reviews=r["reviews"],
            done=r["done"],
            overdue=r["overdue"],
        )
        for r in rows
    ]
