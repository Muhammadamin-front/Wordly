import secrets
from typing import Dict, List
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.classroom import Assignment, ClassMembership, Classroom
from app.models.flashcards import ReviewLog
from app.models.gamification import UserStats
from app.models.user import Profile, User
from app.services.leveling import level_for_xp

_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _new_code() -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(6))


async def create_class(db: AsyncSession, teacher: User, name: str, description: str) -> Classroom:
    for _ in range(5):
        code = _new_code()
        if await db.scalar(select(Classroom.id).where(Classroom.join_code == code)) is None:
            break
    else:
        raise RuntimeError("could not allocate a join code")

    classroom = Classroom(
        teacher_id=teacher.id, name=name.strip(), description=description or None, join_code=code
    )
    db.add(classroom)
    if teacher.role == "learner":
        teacher.role = "teacher"  # first class promotes the user to teacher
    await db.flush()
    return classroom


async def join_class(db: AsyncSession, student: User, code: str) -> Classroom:
    classroom = await db.scalar(
        select(Classroom).where(Classroom.join_code == code.strip().upper(), Classroom.archived.is_(False))
    )
    if classroom is None:
        return None
    if classroom.teacher_id == student.id:
        return classroom  # teacher is implicitly in their own class
    exists = await db.scalar(
        select(ClassMembership.id).where(
            ClassMembership.classroom_id == classroom.id,
            ClassMembership.student_id == student.id,
        )
    )
    if exists is None:
        db.add(ClassMembership(classroom_id=classroom.id, student_id=student.id))
        await db.flush()
    return classroom


async def _member_count(db: AsyncSession, classroom_id: UUID) -> int:
    return int(
        await db.scalar(
            select(func.count(ClassMembership.id)).where(
                ClassMembership.classroom_id == classroom_id
            )
        )
        or 0
    )


async def teacher_classes(db: AsyncSession, teacher: User) -> List[Dict]:
    rows = await db.scalars(
        select(Classroom)
        .where(Classroom.teacher_id == teacher.id, Classroom.archived.is_(False))
        .order_by(Classroom.created_at.desc())
    )
    result = []
    for classroom in rows:
        result.append(
            {"classroom": classroom, "member_count": await _member_count(db, classroom.id)}
        )
    return result


async def student_classes(db: AsyncSession, student: User) -> List[Classroom]:
    rows = await db.scalars(
        select(Classroom)
        .join(ClassMembership, ClassMembership.classroom_id == Classroom.id)
        .where(ClassMembership.student_id == student.id, Classroom.archived.is_(False))
        .order_by(Classroom.created_at.desc())
    )
    return list(rows.unique())


async def class_analytics(db: AsyncSession, classroom: Classroom) -> Dict:
    """Per-student stats + per-assignment progress. Sized for a ~30-seat class."""
    member_rows = await db.execute(
        select(ClassMembership.student_id, Profile.display_name)
        .join(Profile, Profile.user_id == ClassMembership.student_id)
        .where(ClassMembership.classroom_id == classroom.id)
    )
    members = {sid: name for sid, name in member_rows}
    member_ids = list(members.keys())

    stats_map = {}
    if member_ids:
        for stats in await db.scalars(
            select(UserStats).where(UserStats.user_id.in_(member_ids))
        ):
            stats_map[stats.user_id] = stats

    students = [
        {
            "user_id": sid,
            "display_name": name,
            "level": level_for_xp(stats_map[sid].xp) if sid in stats_map else 1,
            "current_streak": stats_map[sid].current_streak if sid in stats_map else 0,
            "total_reviews": stats_map[sid].total_reviews if sid in stats_map else 0,
        }
        for sid, name in members.items()
    ]

    assignments = await db.scalars(
        select(Assignment)
        .where(Assignment.classroom_id == classroom.id)
        .order_by(Assignment.due_at.desc())
    )
    assignment_out = []
    for assignment in assignments:
        progress = []
        completed = 0
        for sid in member_ids:
            count = int(
                await db.scalar(
                    select(func.count(ReviewLog.id)).where(
                        ReviewLog.user_id == sid,
                        ReviewLog.reviewed_at >= assignment.created_at,
                    )
                )
                or 0
            )
            done = count >= assignment.target_reviews
            if done:
                completed += 1
            progress.append(
                {"user_id": sid, "reviews": min(count, assignment.target_reviews), "done": done}
            )
        assignment_out.append(
            {
                "assignment": assignment,
                "completed": completed,
                "total": len(member_ids),
                "progress": progress,
            }
        )

    return {"students": students, "assignments": assignment_out}


async def student_assignments(db: AsyncSession, classroom: Classroom, student_id: UUID) -> List[Dict]:
    assignments = await db.scalars(
        select(Assignment)
        .where(Assignment.classroom_id == classroom.id)
        .order_by(Assignment.due_at.desc())
    )
    out = []
    now = utcnow()
    for assignment in assignments:
        count = int(
            await db.scalar(
                select(func.count(ReviewLog.id)).where(
                    ReviewLog.user_id == student_id,
                    ReviewLog.reviewed_at >= assignment.created_at,
                )
            )
            or 0
        )
        out.append(
            {
                "assignment": assignment,
                "reviews": min(count, assignment.target_reviews),
                "done": count >= assignment.target_reviews,
                "overdue": assignment.due_at < now and count < assignment.target_reviews,
            }
        )
    return out
