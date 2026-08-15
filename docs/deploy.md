# Deploying Vocora

The stack is two containers plus managed state: **api** (FastAPI/uvicorn),
**web** (Next.js standalone), **Postgres 16**, **Redis 7**. A single VM with
docker compose is enough to launch; the WebSocket multiplayer is in-process, so
run **one API replica** until the Redis pub/sub backplane lands (see M9 notes).

## 1. Environment

Create a `.env` next to `docker-compose.yml` (compose reads it automatically):

```bash
ENVIRONMENT=production
# Generate once: python -c "import secrets; print(secrets.token_urlsafe(48))"
SECRET_KEY=<paste-generated-output>
# Use only the immediate reverse proxy/LB addresses or private CIDRs.
TRUSTED_PROXY_CIDRS=10.0.0.10/32
FRONTEND_ORIGIN=https://vocora.uz
COOKIE_SECURE=true
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=Vocora <noreply@vocora.uz>      # domain must be verified in Resend
EMAIL_REPLY_TO=support@vocora.uz
NEXT_PUBLIC_API_URL=https://api.vocora.uz  # baked into the web bundle at build
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...           # optional: Google sign-in
GOOGLE_CLIENT_ID=...                        # same client id, API side
GEMINI_API_KEY=...                          # optional: AI tutor (off without an LLM key)
# Optional alternative LLM provider. Charges can apply when configured.
BEDROCK_API_KEY=...
BEDROCK_MODEL=<provider-model-id>
PAYME_MERCHANT_ID=...
PAYME_MERCHANT_KEY=...
# Or configure all three Click values:
CLICK_SERVICE_ID=...
CLICK_MERCHANT_ID=...
CLICK_SECRET_KEY=...
PAYMENTS_SANDBOX=false
```

Notes that will bite you if skipped:

- `SECRET_KEY` — use the generator above. Production rejects known dev/test
  values, placeholders, keys shorter than 48 characters, and low-entropy keys.
- `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` are required in
  production. The API refuses to boot with the console email backend.
- `NEXT_PUBLIC_*` are **build-time** args: changing them means rebuilding the
  web image, not just restarting it.
- Google sign-in uses the popup/callback flow. In Google Cloud, set Authorized
  JavaScript origins to `https://vocora.uz` and `https://www.vocora.uz` (if the
  `www` host is served), with no trailing slash or path. Leave Authorized
  redirect URIs empty for this implementation. Use the same Web application
  client ID for `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`; no Google
  client secret is used or stored by Vocora.
- `ENVIRONMENT=production` turns off `/docs`, turns on HSTS, and requires HTTPS
  cookies (`COOKIE_SECURE=true`).
- Checkout is exposed only for fully configured providers. Sandbox activation
  is always disabled in production, and the family plan is hidden until member
  management is implemented.

## 2. Build & run

```bash
docker compose build
docker compose up -d
docker compose exec api python -m scripts.seed   # idempotent: corpus + passages
```

The API container runs `alembic upgrade head` on boot, so schema upgrades are
a `git pull && docker compose build api && docker compose up -d api`.

## 3. TLS / reverse proxy

Terminate TLS in front (Caddy, nginx, or a cloud LB) and route:

- `api.vocora.uz` → `:8000` — **must** proxy WebSockets (`/api/v1/ws/quiz`);
  for nginx set `proxy_set_header Upgrade $http_upgrade; Connection "upgrade"`.
- `vocora.uz` → `:3000`.
- Enforce a request-body limit at the proxy (the API's 5 MB cap is a backstop,
  not a substitute).
- Set `TRUSTED_PROXY_CIDRS` to the exact reverse-proxy/LB socket peers that can
  reach the API. The API ignores `X-Forwarded-For` from every other source and
  walks trusted proxy chains from right to left, preventing a client-supplied
  left-most value from choosing its rate-limit key. Do not use `0.0.0.0/0` or
  `::/0`.
- Configure the proxy to append or overwrite `X-Forwarded-For`. Uvicorn's own
  proxy-header parsing is disabled so this application allowlist is the single
  trust boundary.

## 4. Health & observability

- `GET /health` — liveness (cheap, no dependencies).
- `GET /health/detail` — readiness: DB ping, version, uptime, and whether the
  cache/rate-limit backend is `redis` (it must be, in production) — this is the
  compose healthcheck.
- Every response carries `X-Request-ID` (honoured if the proxy sends one) and
  `X-Response-Time-ms`; slow requests (>1s) log at WARNING.
- `python -m scripts.loadtest --base https://api.vocora.uz` for a read-path
  smoke after deploy.
- [`performance-monitoring.md`](./performance-monitoring.md) defines the
  baseline, safe response telemetry, and measurement-first investigation flow.

## 5. Backups & state

All durable state is in Postgres (`pgdata` volume): users, SRS history, corpus,
payments. `review_logs` is append-only — size it accordingly. Redis holds only
rate-limit counters and response cache — safe to lose. Multiplayer rooms are
in-process memory — a deploy drops live quiz rooms (players just rejoin).

Use the encrypted, off-site Restic automation in
[`backup-disaster-recovery.md`](./backup-disaster-recovery.md). A dump stored
only beside `pgdata` on this VM does not satisfy production recovery needs.
The timer retains 14 daily, 8 weekly, and 12 monthly snapshots and has a
read-only verification command plus a tested restore procedure.

## 6. CI

`.github/workflows/ci.yml` gates every push/PR on three jobs: pytest on SQLite,
pytest **plus migrations & seed on Postgres 16** (dialect drift is caught here,
not on the VM), and web typecheck/lint/vitest/build.
