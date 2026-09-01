import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class WordChainInvitation(Base):
    """A friend-only invitation to one waiting, private Word Chain room."""

    __tablename__ = "word_chain_invitations"
    __table_args__ = (
        Index(
            "ix_word_chain_invitations_recipient_status_expires",
            "recipient_id",
            "status",
            "expires_at",
        ),
        Index("ix_word_chain_invitations_sender", "sender_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    sender_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    recipient_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    room_code: Mapped[str] = mapped_column(String(6), nullable=False)
    # pending | accepted | declined | cancelled | expired
    status: Mapped[str] = mapped_column(String(12), default="pending", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
