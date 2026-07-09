from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: Optional[str] = Field(default=None, max_length=400)


class ClassOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    join_code: str
    created_at: datetime
    member_count: int = 0


class StudentClassOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None


class JoinRequest(BaseModel):
    code: str = Field(min_length=1, max_length=8)


class AssignmentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    instructions: Optional[str] = Field(default=None, max_length=2000)
    target_reviews: int = Field(default=20, ge=1, le=1000)
    due_at: datetime


class AssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    instructions: Optional[str] = None
    target_reviews: int
    due_at: datetime
    created_at: datetime


class StudentAssignmentOut(BaseModel):
    assignment: AssignmentOut
    reviews: int
    done: bool
    overdue: bool


class StudentStat(BaseModel):
    user_id: UUID
    display_name: str
    level: int
    current_streak: int
    total_reviews: int


class AssignmentProgress(BaseModel):
    user_id: UUID
    reviews: int
    done: bool


class AssignmentAnalytics(BaseModel):
    assignment: AssignmentOut
    completed: int
    total: int
    progress: List[AssignmentProgress]


class ClassAnalyticsOut(BaseModel):
    students: List[StudentStat]
    assignments: List[AssignmentAnalytics]


class MessageOut(BaseModel):
    message: str
