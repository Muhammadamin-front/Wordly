from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class WordChainInvitationCreate(BaseModel):
    invitee_id: UUID
    room_code: str = Field(min_length=6, max_length=6, pattern=r"^[A-Za-z0-9]+$")


class WordChainInvitationOut(BaseModel):
    invitation_id: UUID
    sender_id: UUID
    sender_name: str
    room_code: str
    expires_at: datetime
    created_at: datetime


class WordChainInvitationJoinOut(BaseModel):
    room_code: str
