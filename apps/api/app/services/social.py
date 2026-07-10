from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import UserAchievement, UserStats
from app.models.social import Friendship
from app.models.user import Profile, User
from app.services.leveling import level_for_xp


async def _friendship_between(db: AsyncSession, a: UUID, b: UUID) -> Optional[Friendship]:
    return await db.scalar(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == a, Friendship.addressee_id == b),
                and_(Friendship.requester_id == b, Friendship.addressee_id == a),
            )
        )
    )


async def send_request(db: AsyncSession, requester: User, code: str) -> Optional[Friendship]:
    """Send a friend request using the other user's friend code (= referral_code)."""
    target = await db.scalar(select(User).where(User.referral_code == code.strip().upper()))
    if target is None or target.id == requester.id:
        return None
    existing = await _friendship_between(db, requester.id, target.id)
    if existing is not None:
        return existing
    friendship = Friendship(requester_id=requester.id, addressee_id=target.id)
    db.add(friendship)
    await db.flush()
    return friendship


async def respond(
    db: AsyncSession, user: User, friendship_id: UUID, accept: bool
) -> bool:
    friendship = await db.get(Friendship, friendship_id)
    # Only the addressee of a pending request may accept/decline it.
    if friendship is None or friendship.addressee_id != user.id or friendship.status != "pending":
        return False
    if accept:
        friendship.status = "accepted"
    else:
        await db.delete(friendship)
    await db.flush()
    return True


async def remove_friend(db: AsyncSession, user: User, other_id: UUID) -> bool:
    friendship = await _friendship_between(db, user.id, other_id)
    if friendship is None:
        return False
    await db.delete(friendship)
    await db.flush()
    return True


async def friend_ids(db: AsyncSession, user_id: UUID) -> List[UUID]:
    rows = await db.execute(
        select(Friendship.requester_id, Friendship.addressee_id).where(
            Friendship.status == "accepted",
            or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
        )
    )
    return [b if a == user_id else a for a, b in rows]


async def _user_cards(db: AsyncSession, user_ids: List[UUID]) -> dict:
    """display_name, level, streak, longest, xp keyed by user id."""
    if not user_ids:
        return {}
    profiles = {
        p.user_id: p.display_name
        for p in await db.scalars(select(Profile).where(Profile.user_id.in_(user_ids)))
    }
    stats = {s.user_id: s for s in await db.scalars(select(UserStats).where(UserStats.user_id.in_(user_ids)))}
    result = {}
    for uid in user_ids:
        s = stats.get(uid)
        result[uid] = {
            "display_name": profiles.get(uid, "Learner"),
            "level": level_for_xp(s.xp) if s else 1,
            "xp": s.xp if s else 0,
            "current_streak": s.current_streak if s else 0,
            "longest_streak": s.longest_streak if s else 0,
        }
    return result


async def list_friends(db: AsyncSession, user: User) -> List[dict]:
    ids = await friend_ids(db, user.id)
    cards = await _user_cards(db, ids)
    return [{"user_id": uid, **cards[uid]} for uid in ids]


async def pending_requests(db: AsyncSession, user: User) -> List[dict]:
    rows = await db.scalars(
        select(Friendship).where(
            Friendship.addressee_id == user.id, Friendship.status == "pending"
        )
    )
    friendships = list(rows)
    cards = await _user_cards(db, [f.requester_id for f in friendships])
    return [
        {"friendship_id": f.id, "user_id": f.requester_id, **cards[f.requester_id]}
        for f in friendships
    ]


async def friend_leaderboard(db: AsyncSession, user: User) -> List[dict]:
    ids = await friend_ids(db, user.id) + [user.id]
    cards = await _user_cards(db, ids)
    board = [{"user_id": uid, "is_me": uid == user.id, **cards[uid]} for uid in ids]
    board.sort(key=lambda r: r["xp"], reverse=True)
    for rank, row in enumerate(board, start=1):
        row["rank"] = rank
    return board


async def public_profile(db: AsyncSession, code: str) -> Optional[dict]:
    user = await db.scalar(select(User).where(User.referral_code == code.strip().upper()))
    if user is None:
        return None
    cards = await _user_cards(db, [user.id])
    achievements = list(
        (await db.scalars(select(UserAchievement.code).where(UserAchievement.user_id == user.id))).all()
    )
    return {"user_id": user.id, "code": code.strip().upper(), "achievements": achievements, **cards[user.id]}
