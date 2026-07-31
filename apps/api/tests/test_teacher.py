from datetime import timedelta

from app.core.security import utcnow
from tests.conftest import register_user
from tests.test_games import learner_with_cards


async def teacher(client, email="teacher@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_create_class_promotes_to_teacher(client):
    headers = await teacher(client)
    created = await client.post(
        "/api/v1/teacher/classes", json={"name": "9-A English"}, headers=headers
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["name"] == "9-A English"
    assert len(body["join_code"]) == 6
    assert body["member_count"] == 0

    # /auth/me now shows the teacher role.
    me = (await client.get("/api/v1/auth/me", headers=headers)).json()
    assert me["role"] == "teacher"


async def test_student_joins_by_code(client):
    t_headers = await teacher(client)
    cls = (await client.post("/api/v1/teacher/classes", json={"name": "Class"}, headers=t_headers)).json()
    code = cls["join_code"]

    student = await register_user(client, email="student@words.uz")
    s_headers = {"Authorization": "Bearer " + student["access_token"]}

    joined = await client.post("/api/v1/classes/join", json={"code": code}, headers=s_headers)
    assert joined.status_code == 200
    assert joined.json()["name"] == "Class"

    my = (await client.get("/api/v1/me/classes", headers=s_headers)).json()
    assert len(my) == 1

    # Teacher sees the member count rise.
    classes = (await client.get("/api/v1/teacher/classes", headers=t_headers)).json()
    assert classes[0]["member_count"] == 1


async def test_join_invalid_code(client):
    student = await register_user(client)
    headers = {"Authorization": "Bearer " + student["access_token"]}
    assert (
        await client.post("/api/v1/classes/join", json={"code": "ZZZZZZ"}, headers=headers)
    ).status_code == 404


async def test_assignment_and_analytics(client):
    t_headers = await teacher(client)
    cls = (await client.post("/api/v1/teacher/classes", json={"name": "Homework class"}, headers=t_headers)).json()
    class_id = cls["id"]

    # A student with cards joins and does two reviews.
    s_headers, cards = await learner_with_cards(client, count=6)
    await client.post("/api/v1/classes/join", json={"code": cls["join_code"]}, headers=s_headers)

    due = (utcnow() + timedelta(days=7)).isoformat()
    assignment = await client.post(
        "/api/v1/teacher/classes/{}/assignments".format(class_id),
        json={"title": "Review 2 words", "target_reviews": 2, "due_at": due},
        headers=t_headers,
    )
    assert assignment.status_code == 201

    for card_id in cards[:2]:
        await client.post(
            "/api/v1/review/{}".format(card_id),
            json={"rating": "good"},
            headers={**s_headers, "Idempotency-Key": "teacher-{}".format(card_id)},
        )

    analytics = (
        await client.get("/api/v1/teacher/classes/{}/analytics".format(class_id), headers=t_headers)
    ).json()
    assert len(analytics["students"]) == 1
    assert analytics["students"][0]["total_reviews"] == 2
    assert len(analytics["assignments"]) == 1
    assert analytics["assignments"][0]["completed"] == 1  # student hit the target

    # Student sees their own progress.
    student_view = (
        await client.get("/api/v1/classes/{}/assignments".format(class_id), headers=s_headers)
    ).json()
    assert student_view[0]["done"] is True


async def test_teacher_cannot_touch_others_class(client):
    owner = await teacher(client, email="owner@words.uz")
    cls = (await client.post("/api/v1/teacher/classes", json={"name": "Mine"}, headers=owner)).json()

    intruder = await teacher(client, email="intruder@words.uz")
    due = (utcnow() + timedelta(days=1)).isoformat()
    response = await client.post(
        "/api/v1/teacher/classes/{}/assignments".format(cls["id"]),
        json={"title": "x", "target_reviews": 1, "due_at": due},
        headers=intruder,
    )
    assert response.status_code == 404


async def test_non_member_cannot_see_assignments(client):
    t_headers = await teacher(client)
    cls = (await client.post("/api/v1/teacher/classes", json={"name": "Private"}, headers=t_headers)).json()
    outsider = await register_user(client, email="outsider@words.uz")
    headers = {"Authorization": "Bearer " + outsider["access_token"]}
    response = await client.get(
        "/api/v1/classes/{}/assignments".format(cls["id"]), headers=headers
    )
    assert response.status_code == 403
