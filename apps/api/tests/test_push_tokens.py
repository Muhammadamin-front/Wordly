from sqlalchemy import select

import app.db.session as db_session
from app.models.user import DevicePushToken
from tests.conftest import register_user


async def test_mobile_can_register_and_refresh_push_token(client):
    pair = await register_user(client, email="push@example.uz")
    headers = {"Authorization": "Bearer " + pair["access_token"]}
    payload = {
        "provider": "expo",
        "token": "ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]",
        "platform": "android",
        "app_version": "1.0.0",
    }

    first = await client.post("/api/v1/users/me/push-tokens", json=payload, headers=headers)
    assert first.status_code == 200, first.text

    second = await client.post(
        "/api/v1/users/me/push-tokens",
        json={**payload, "platform": "ios"},
        headers=headers,
    )
    assert second.status_code == 200, second.text

    async with db_session.get_session_factory()() as session:
        tokens = (await session.scalars(select(DevicePushToken))).all()
    assert len(tokens) == 1
    assert tokens[0].user_id.hex == pair["user"]["id"].replace("-", "")
    assert tokens[0].platform == "ios"
    assert tokens[0].is_active is True
