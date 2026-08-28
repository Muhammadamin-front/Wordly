"""Free tier reaches word_match/speed_quiz/fill_blank (plus the listening/
speaking skill drills, a different product surface than these vocabulary
games) directly; everything else in GAME_TYPES needs Basic/Speaking Pro."""
import pytest

from app.services.plans import FREE_GAME_TYPES
from tests.test_games import learner_with_cards


@pytest.mark.parametrize("game_type", sorted(FREE_GAME_TYPES))
async def test_free_tier_reaches_free_game_types(client, game_type):
    headers, _ = await learner_with_cards(client, count=6)
    response = await client.get(f"/api/v1/games/{game_type}", headers=headers)
    assert response.status_code == 200, response.text


@pytest.mark.parametrize(
    "game_type", ["audio_guess", "typing_race", "memory", "hangman", "spelling_bee", "crossword"]
)
async def test_free_tier_is_blocked_from_premium_game_types(client, game_type):
    headers, _ = await learner_with_cards(client, count=6)
    response = await client.get(f"/api/v1/games/{game_type}", headers=headers)
    assert response.status_code == 402, response.text
    assert "Premium" in response.json()["detail"]


async def test_premium_reaches_a_gated_game_type(client):
    headers, _ = await learner_with_cards(client, count=6, premium=True)
    response = await client.get("/api/v1/games/hangman", headers=headers)
    assert response.status_code == 200, response.text
