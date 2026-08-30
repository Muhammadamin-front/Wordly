import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class Classroom(Base):
    __tablename__ = "classrooms"
    __table_args__ = (Index("ix_classrooms_teacher", "teacher_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    join_code: Mapped[str] = mapped_column(String(8), unique=True, nullable=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class ClassMembership(Base):
    __tablename__ = "class_memberships"
    __table_args__ = (
        UniqueConstraint("classroom_id", "student_id", name="uq_class_membership"),
        Index("ix_class_memberships_student", "student_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    classroom_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)


class Assignment(Base):
    """Homework: a review goal with a deadline. Progress is measured from the
    student's review activity between the assignment's creation and its due date."""

    __tablename__ = "assignments"
    __table_args__ = (Index("ix_assignments_classroom", "classroom_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    classroom_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_reviews: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    due_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
