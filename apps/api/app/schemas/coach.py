from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CharacterOut(BaseModel):
    key: str
    name: str
    emoji: str
    tagline: str
    accent: str
    pitch: float
    rate: float


class CreateSessionRequest(BaseModel):
    character: str = Field(pattern="^(gordon|mochi|alex|examiner)$")
    mode: str = Field(default="chat", pattern="^(chat|ielts)$")
    ielts_part: Optional[int] = Field(default=None, ge=1, le=3)
    topic: Optional[str] = Field(default=None, max_length=160)


class CorrectionOut(BaseModel):
    original: str
    correction: str
    explanation: str = ""
    category: str = "grammar"


class MessageOut(BaseModel):
    role: str
    content: str
    corrections: List[CorrectionOut] = []
    created_at: datetime


class RewardOut(BaseModel):
    xp_gained: int
    total_xp: int
    level: int
    leveled_up: bool


class SessionOut(BaseModel):
    id: UUID
    character: str
    mode: str
    ielts_part: Optional[int]
    topic: Optional[str]
    status: str
    turns: int
    started_at: datetime
    completed_at: Optional[datetime]
    messages: List[MessageOut] = []


class SessionListItem(BaseModel):
    id: UUID
    character: str
    mode: str
    ielts_part: Optional[int]
    topic: Optional[str]
    status: str
    turns: int
    started_at: datetime


class TurnRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class TurnResponse(BaseModel):
    reply: str
    corrections: List[CorrectionOut]
    reward: RewardOut


class IeltsReportOut(BaseModel):
    band_overall: float
    fluency: float
    lexical: float
    grammar: float
    pronunciation: float
    strengths: str
    improvements: str
    homework: str
    created_at: datetime


class ScoreResponse(BaseModel):
    report: IeltsReportOut
    reward: RewardOut


class GrammarErrorOut(BaseModel):
    original: str
    correction: str
    explanation: Optional[str]
    category: str
    created_at: datetime


class CharacterProgressOut(BaseModel):
    character: str
    sessions_count: int
    messages_count: int
    friendship_xp: int
    friendship_level: int


class DashboardOut(BaseModel):
    total_sessions: int
    total_turns: int
    total_errors: int
    progress: List[CharacterProgressOut]
    recent_errors: List[GrammarErrorOut]
    latest_report: Optional[IeltsReportOut]
    enabled: bool
