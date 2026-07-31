from datetime import timedelta
from uuid import uuid4

from sqlalchemy import select

import app.db.session as db_session
from app.models.gamification import UserStats
from app.models.user import User
from app.services.leveling import local_today
from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin

TZ = "Asia/Tashkent"


async def seed_published_words(client, count: int) -> None:
    admin_headers = await make_admin(client)
    for i in range(count):
        payload = {**WORD_PAYLOAD, "headword": "word{}".format(i), "frequency_rank": i + 1}
        response = await client.post("/api/v1/admin/words", json=payload, headers=admin_headers)
        assert response.status_code == 201, response.text


async def learner_with_cards(client, count: int = 3) -> tuple[dict, list[str]]:
    await seed_published_words(client, count)
    data = await register_user(client, email="learner@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": count}, headers=headers
    )
    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    card_ids = [c["id"] for c in queue["cards"]]
    return headers, card_ids


async def patch_stats(email: str, **fields) -> None:
    async with db_session.get_session_factory()() as session:
        user = await session.scalar(select(User).where(User.email == email))
        stats = await session.scalar(select(UserStats).where(UserStats.user_id == user.id))
        for key, value in fields.items():
            setattr(stats, key, value)
        await session.commit()


async def review(client, headers, card_id, rating="good") -> dict:
    response = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": rating},
        headers={**headers, "Idempotency-Key": str(uuid4())},
    )
    assert response.status_code == 200, response.text
    return response.json()["reward"]


async def test_first_review_awards_xp_coins_and_achievement(client):
    headers, cards = await learner_with_cards(client)
    reward = await review(client, headers, cards[0], "good")

    assert reward["xp_gained"] == 10
    assert reward["coins_gained"] == 1
    assert reward["total_xp"] == 30  # 10 review + 20 first_steps achievement
    assert reward["current_streak"] == 1
    assert reward["streak_increased"] is True
    assert "first_steps" in reward["new_achievements"]

    stats = (await client.get("/api/v1/me/stats", headers=headers)).json()
    assert stats["coins"] == 6  # 1 review + 5 achievement
    assert stats["level"] == 1
    assert stats["reviews_today"] == 1


async def test_stats_endpoint_defaults(client):
    data = await register_user(client)
    headers = {"Authorization": "Bearer " + data["access_token"]}
    stats = (await client.get("/api/v1/me/stats", headers=headers)).json()
    assert stats["xp"] == 0
    assert stats["daily_goal"] == 20
    assert stats["streak_freezes"] == 2
    assert stats["league_tier"] == "bronze"


async def test_streak_increments_across_days(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])

    today = local_today(TZ)
    await patch_stats("learner@words.uz", last_active_on=today - timedelta(days=1), current_streak=5)

    reward = await review(client, headers, cards[0])
    assert reward["current_streak"] == 6
    assert reward["freeze_used"] is False


async def test_streak_freeze_saves_missed_day(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])

    today = local_today(TZ)
    await patch_stats(
        "learner@words.uz",
        last_active_on=today - timedelta(days=2),
        current_streak=5,
        streak_freezes=2,
    )

    reward = await review(client, headers, cards[0])
    assert reward["freeze_used"] is True
    assert reward["current_streak"] == 6

    stats = (await client.get("/api/v1/me/stats", headers=headers)).json()
    assert stats["streak_freezes"] == 1


async def test_streak_resets_after_gap_without_freeze(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])

    today = local_today(TZ)
    await patch_stats(
        "learner@words.uz",
        last_active_on=today - timedelta(days=3),
        current_streak=9,
        streak_freezes=0,
    )

    reward = await review(client, headers, cards[0])
    assert reward["current_streak"] == 1
    assert reward["freeze_used"] is False


async def test_daily_goal_bonus_and_achievement(client):
    headers, cards = await learner_with_cards(client)
    goal = await client.put("/api/v1/me/daily-goal", json={"daily_goal": 5}, headers=headers)
    assert goal.status_code == 200

    # Review count (not distinct cards) drives the goal; cycle the three cards.
    rewards = [await review(client, headers, cards[i % len(cards)]) for i in range(5)]
    assert all(r["goal_reached"] is False for r in rewards[:4])
    assert rewards[4]["goal_reached"] is True
    assert "goal_getter" in rewards[4]["new_achievements"]

    stats = (await client.get("/api/v1/me/stats", headers=headers)).json()
    assert stats["goal_reached_today"] is True


async def test_buy_streak_freeze(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])
    await patch_stats("learner@words.uz", coins=100, streak_freezes=1)

    bought = await client.post("/api/v1/me/streak-freeze", headers=headers)
    assert bought.status_code == 200
    assert bought.json()["streak_freezes"] == 2
    assert bought.json()["coins"] == 50


async def test_buy_streak_freeze_insufficient_coins(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])
    await patch_stats("learner@words.uz", coins=10, streak_freezes=0)
    response = await client.post("/api/v1/me/streak-freeze", headers=headers)
    assert response.status_code == 402


async def test_achievements_list_reflects_unlocks(client):
    headers, cards = await learner_with_cards(client)
    before = (await client.get("/api/v1/me/achievements", headers=headers)).json()
    assert all(a["unlocked"] is False for a in before)

    await review(client, headers, cards[0])
    after = (await client.get("/api/v1/me/achievements", headers=headers)).json()
    first_steps = next(a for a in after if a["code"] == "first_steps")
    assert first_steps["unlocked"] is True
    assert first_steps["unlocked_at"] is not None


async def test_leaderboard_ranks_by_weekly_xp(client):
    await seed_published_words(client, 3)

    # Three learners with different review counts this week.
    tokens = {}
    for email, reviews in (("a@words.uz", 3), ("b@words.uz", 1), ("c@words.uz", 2)):
        data = await register_user(client, email=email, display_name=email[0].upper())
        headers = {"Authorization": "Bearer " + data["access_token"]}
        tokens[email] = headers
        await client.post(
            "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 3}, headers=headers
        )
        queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
        for i in range(reviews):
            await review(client, headers, queue["cards"][i]["id"])

    board = (await client.get("/api/v1/leaderboard", headers=tokens["a@words.uz"])).json()
    assert board["tier"] == "bronze"
    order = [m["display_name"] for m in board["members"]]
    assert order[:3] == ["A", "C", "B"]  # 3 > 2 > 1 reviews
    assert board["members"][0]["is_me"] is True
    assert board["my_rank"] == 1


async def test_heatmap_returns_today(client):
    headers, cards = await learner_with_cards(client)
    await review(client, headers, cards[0])
    heatmap = (await client.get("/api/v1/me/heatmap", headers=headers)).json()
    assert len(heatmap["days"]) == 1
    assert heatmap["days"][0]["reviews_count"] == 1
