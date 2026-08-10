from sqlalchemy import update

import app.db.session as db_session
from app.models.user import User
from tests.conftest import register_user
from tests.test_vocabulary import make_admin, make_super_admin


async def test_admin_endpoints_require_admin(client):
    data = await register_user(client)
    headers = {"Authorization": "Bearer " + data["access_token"]}
    assert (await client.get("/api/v1/admin/analytics", headers=headers)).status_code == 403
    assert (await client.get("/api/v1/admin/users", headers=headers)).status_code == 403


async def test_analytics_counts(client):
    # A learner reports an AI output (creates an open report).
    learner = await register_user(client, email="learner@words.uz")
    lh = {"Authorization": "Bearer " + learner["access_token"]}
    await client.post(
        "/api/v1/ai/report", json={"kind": "explain", "output": "bad"}, headers=lh
    )
    # A user activates premium (sandbox) to generate revenue.
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=lh
    )

    admin = await make_admin(client)
    stats = (await client.get("/api/v1/admin/analytics", headers=admin)).json()
    assert stats["users_total"] >= 2
    assert stats["ai_reports_open"] == 1
    # sandbox doesn't create a Payment row, so revenue stays 0 but a sub is active.
    assert stats["active_subscriptions"] == 1
    assert stats["premium_users"] == 1


async def test_ai_report_moderation_queue(client):
    learner = await register_user(client, email="learner@words.uz")
    lh = {"Authorization": "Bearer " + learner["access_token"]}
    await client.post(
        "/api/v1/ai/report", json={"kind": "story", "output": "wrong", "reason": "bad grammar"},
        headers=lh,
    )
    admin = await make_admin(client)

    open_reports = (await client.get("/api/v1/admin/ai-reports", headers=admin)).json()
    assert len(open_reports) == 1
    report_id = open_reports[0]["id"]

    resolved = await client.post(
        "/api/v1/admin/ai-reports/{}/resolve".format(report_id), headers=admin
    )
    assert resolved.status_code == 200
    assert (await client.get("/api/v1/admin/ai-reports", headers=admin)).json() == []
    resolved_list = (await client.get("/api/v1/admin/ai-reports?resolved=true", headers=admin)).json()
    assert len(resolved_list) == 1


async def test_user_management_ban_and_role(client):
    target = await register_user(client, email="target@words.uz")
    admin = await make_super_admin(client)

    users = (await client.get("/api/v1/admin/users?q=target", headers=admin)).json()
    assert users["total"] == 1
    target_id = users["items"][0]["id"]
    assert users["items"][0]["is_active"] is True

    ban = await client.post("/api/v1/admin/users/{}/ban".format(target_id), headers=admin)
    assert ban.status_code == 200

    # A banned user can't log in.
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "target@words.uz", "password": "kuchli-parol-123"},
    )
    assert login.status_code == 401

    await client.post("/api/v1/admin/users/{}/unban".format(target_id), headers=admin)
    promote = await client.post(
        "/api/v1/admin/users/{}/role".format(target_id), json={"role": "teacher"}, headers=admin
    )
    assert promote.status_code == 200

    audit = await client.get("/api/v1/admin/audit-logs", headers=admin)
    assert audit.status_code == 200
    assert {item["action"] for item in audit.json()} >= {
        "user.suspend",
        "user.reactivate",
        "user.role_change",
    }


async def test_admin_cannot_change_roles_and_support_has_read_only_user_access(client):
    target = await register_user(client, email="target@words.uz")
    admin = await make_admin(client)
    target_id = target["user"]["id"]

    role_change = await client.post(
        "/api/v1/admin/users/{}/role".format(target_id),
        json={"role": "teacher"},
        headers=admin,
    )
    assert role_change.status_code == 403

    support = await register_user(client, email="support@words.uz")
    async with db_session.get_session_factory()() as session:
        await session.execute(
            update(User).where(User.email == "support@words.uz").values(role="support")
        )
        await session.commit()
    support_headers = {"Authorization": "Bearer " + support["access_token"]}
    assert (await client.get("/api/v1/admin/users", headers=support_headers)).status_code == 200
    assert (await client.get("/api/v1/admin/analytics", headers=support_headers)).status_code == 403
    assert (
        await client.post("/api/v1/admin/users/{}/ban".format(target_id), headers=support_headers)
    ).status_code == 403


async def test_admin_cannot_ban_self(client):
    admin = await make_admin(client)
    me = (await client.get("/api/v1/auth/me", headers=admin)).json()
    response = await client.post("/api/v1/admin/users/{}/ban".format(me["id"]), headers=admin)
    assert response.status_code == 400


async def test_super_admin_can_apply_audited_manual_subscription_correction(client):
    target = await register_user(client, email="manual-subscription@words.uz")
    admin = await make_super_admin(client)
    target_id = target["user"]["id"]

    granted = await client.post(
        "/api/v1/admin/users/{}/subscription/grant".format(target_id),
        json={"plan_code": "premium_monthly", "extra_days": 7, "reason": "Support ticket paid"},
        headers=admin,
    )
    assert granted.status_code == 200, granted.text

    audit = await client.get("/api/v1/admin/audit-logs", headers=admin)
    assert any(row["action"] == "subscription.manual_grant" for row in audit.json())

    revoke = await client.post(
        "/api/v1/admin/users/{}/subscription/revoke".format(target_id),
        json={"reason": "Confirmed refund"},
        headers=admin,
    )
    assert revoke.status_code == 200, revoke.text


async def test_support_user_detail_exposes_diagnostics_not_credentials(client):
    target = await register_user(client, email="diagnostics@words.uz")
    support = await register_user(client, email="diagnostic-support@words.uz")
    async with db_session.get_session_factory()() as session:
        await session.execute(
            update(User).where(User.email == "diagnostic-support@words.uz").values(role="support")
        )
        await session.commit()
    headers = {"Authorization": "Bearer " + support["access_token"]}
    response = await client.get("/api/v1/admin/users/{}".format(target["user"]["id"]), headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert {"email_verified", "active_sessions", "password_reset_pending"} <= body.keys()
    assert "password_hash" not in body and "token_hash" not in body
