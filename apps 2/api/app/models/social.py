import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utcnow
from app.db.base import Base


class Friendship(Base):
    """One row per relationship. `requester` sent the request via the other
    user's friend code; `addressee` accepts. Direction is preserved but
    friendship is symmetric once accepted."""

    __tablename__ = "friendships"
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friendship"),
        Index("ix_friendships_addressee", "addressee_id"),
        Index("ix_friendships_requester", "requester_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    requester_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    addressee_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(10), default="pending", nullable=False)  # pending|accepted
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
