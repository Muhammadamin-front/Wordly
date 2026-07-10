from tests.conftest import register_user


async def user_with_code(client, email):
    data = await register_user(client, email=email)
    headers = {"Authorization": "Bearer " + data["access_token"]}
    code = (await client.get("/api/v1/me/friend-code", headers=headers)).json()["message"]
    return headers, code


async def test_friend_request_accept_flow(client):
    alice_h, alice_code = await user_with_code(client, "alice@words.uz")
    bob_h, bob_code = await user_with_code(client, "bob@words.uz")

    # Bob requests Alice using her code.
    req = await client.post("/api/v1/friends/request", json={"code": alice_code}, headers=bob_h)
    assert req.status_code == 201

    # Alice sees a pending request.
    pending = (await client.get("/api/v1/friends/pending", headers=alice_h)).json()
    assert len(pending) == 1
    friendship_id = pending[0]["friendship_id"]

    accept = await client.post("/api/v1/friends/{}/accept".format(friendship_id), headers=alice_h)
    assert accept.status_code == 200

    # Both now list each other as friends.
    assert len(((await client.get("/api/v1/friends", headers=alice_h)).json())) == 1
    assert len(((await client.get("/api/v1/friends", headers=bob_h)).json())) == 1
    assert (await client.get("/api/v1/friends/pending", headers=alice_h)).json() == []


async def test_friend_request_invalid_code(client):
    headers, _ = await user_with_code(client, "solo@words.uz")
    response = await client.post(
        "/api/v1/friends/request", json={"code": "ZZZZZZZ"}, headers=headers
    )
    assert response.status_code == 404


async def test_cannot_friend_self(client):
    headers, code = await user_with_code(client, "narcissist@words.uz")
    response = await client.post("/api/v1/friends/request", json={"code": code}, headers=headers)
    assert response.status_code == 404


async def test_friend_leaderboard_includes_me(client):
    alice_h, alice_code = await user_with_code(client, "alice@words.uz")
    bob_h, _ = await user_with_code(client, "bob@words.uz")
    await client.post("/api/v1/friends/request", json={"code": alice_code}, headers=bob_h)
    pending = (await client.get("/api/v1/friends/pending", headers=alice_h)).json()
    await client.post("/api/v1/friends/{}/accept".format(pending[0]["friendship_id"]), headers=alice_h)

    board = (await client.get("/api/v1/friends/leaderboard", headers=alice_h)).json()
    assert len(board) == 2  # me + one friend
    assert any(entry["is_me"] for entry in board)
    assert [e["rank"] for e in board] == [1, 2]


async def test_public_profile(client):
    _, code = await user_with_code(client, "star@words.uz")
    viewer, _ = await user_with_code(client, "fan@words.uz")
    profile = (await client.get("/api/v1/profile/{}".format(code), headers=viewer)).json()
    assert profile["code"] == code
    assert "achievements" in profile
    assert profile["level"] >= 1


async def test_decline_request(client):
    alice_h, alice_code = await user_with_code(client, "alice@words.uz")
    bob_h, _ = await user_with_code(client, "bob@words.uz")
    await client.post("/api/v1/friends/request", json={"code": alice_code}, headers=bob_h)
    pending = (await client.get("/api/v1/friends/pending", headers=alice_h)).json()
    declined = await client.post(
        "/api/v1/friends/{}/decline".format(pending[0]["friendship_id"]), headers=alice_h
    )
    assert declined.status_code == 200
    assert (await client.get("/api/v1/friends", headers=alice_h)).json() == []
