from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.social import (
    FriendOut,
    FriendRequest,
    LeaderboardEntry,
    MessageOut,
    PendingOut,
    PublicProfileOut,
)
from app.services import referrals, social

router = APIRouter(
    tags=["social"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("social"))],
)


@router.get("/friends", response_model=list[FriendOut])
async def friends(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [FriendOut(**f) for f in await social.list_friends(db, user)]


@router.get("/friends/pending", response_model=list[PendingOut])
async def pending(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [PendingOut(**p) for p in await social.pending_requests(db, user)]


@router.get("/friends/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return [LeaderboardEntry(**e) for e in await social.friend_leaderboard(db, user)]


@router.post("/friends/request", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def request_friend(
    payload: FriendRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    friendship = await social.send_request(db, user, payload.code)
    if friendship is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid friend code")
    await db.commit()
    return MessageOut(message="Friend request sent")


@router.post("/friends/{friendship_id}/accept", response_model=MessageOut)
async def accept_friend(
    friendship_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await social.respond(db, user, friendship_id, accept=True):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    await db.commit()
    return MessageOut(message="Friend added")


@router.post("/friends/{friendship_id}/decline", response_model=MessageOut)
async def decline_friend(
    friendship_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await social.respond(db, user, friendship_id, accept=False):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    await db.commit()
    return MessageOut(message="Request declined")


@router.delete("/friends/{other_id}", response_model=MessageOut)
async def remove_friend(
    other_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await social.remove_friend(db, user, other_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not friends")
    await db.commit()
    return MessageOut(message="Friend removed")


@router.get("/me/friend-code", response_model=MessageOut)
async def my_friend_code(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    code = await referrals.ensure_code(db, user)
    await db.commit()
    return MessageOut(message=code)


@router.get("/profile/{code}", response_model=PublicProfileOut)
async def profile(
    code: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    result = await social.public_profile(db, code)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return PublicProfileOut(**result)
