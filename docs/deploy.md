# Deploying Vocora

The production stack is five containers: **api** (FastAPI/uvicorn), **web**
(Next.js standalone), **Postgres 16**, **Redis 7**, and **cloudflared**. A single
VM with Docker Compose is enough to launch. The WebSocket multiplayer runs its
room state and cross-worker broadcast through Redis (`RedisRoomStore` +
`RedisPubSub`, wired in `app/main.py`'s `lifespan()` whenever `REDIS_URL` is
set), so it's safe to run multiple API replicas — a client connected to one
worker still sees moves made on a room hosted by another worker.

## 1. Environment

Create a `.env` next to `docker-compose.yml` (compose reads it automatically):

For first-time setup, run `./scripts/setup-production.sh`. It opens the relevant
provider dashboards, hides secret input, writes the ignored root `.env`, and
runs the same release preflight documented below. The manual template is:

```bash
ENVIRONMENT=production
APP_VERSION=1.0.0
# Generate once: python -c "import secrets; print(secrets.token_urlsafe(48))"
SECRET_KEY=<paste-generated-output>
# Use only the immediate reverse proxy/LB addresses or private CIDRs.
TRUSTED_PROXY_CIDRS=10.0.0.10/32
FRONTEND_ORIGIN=https://vocora.uz
COOKIE_SECURE=true
API_BIND_HOST=127.0.0.1
POSTGRES_USER=words
POSTGRES_PASSWORD=<generated-unique-password>
POSTGRES_DB=words
DATABASE_URL=postgresql+asyncpg://words:<same-password>@postgres:5432/words
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=Vocora <noreply@vocora.uz>      # domain must be verified in Resend
EMAIL_REPLY_TO=support@vocora.uz
NEXT_PUBLIC_API_URL=https://api.vocora.uz  # baked into the web bundle at build
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...           # optional: Google sign-in
GOOGLE_CLIENT_ID=...                        # same client id, API side
APPLE_CLIENT_ID=uz.vocora.mobile            # native iOS identity-token audience
NEXT_PUBLIC_GITHUB_CLIENT_ID=...           # optional: GitHub sign-in
GITHUB_CLIENT_ID=...                        # same client id, API side
GITHUB_CLIENT_SECRET=...                    # API side only, never in the bundle
NEXT_PUBLIC_TELEGRAM_BOT_ID=...            # optional: Telegram sign-in (digits before ":" in the bot token)
TELEGRAM_BOT_TOKEN=...                      # API side only, never in the bundle
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
# Uzum Checkout — supplied by Uzum after merchant onboarding.
UZUM_TERMINAL_ID=...
UZUM_API_KEY=...
# Generate once: python3 -c "import secrets; print(secrets.token_urlsafe(48))"
UZUM_WEBHOOK_SECRET=<paste-generated-output>
# Keep this value unless Uzum gives the production merchant account a different base URL.
UZUM_API_BASE_URL=https://developer.uzumbank.uz/api/v1
PAYMENTS_SANDBOX=false
# Error tracking (Sentry). Unset on either service = errors stay in logs only.
SENTRY_DSN=...                             # api — Project Settings -> Client Keys
NEXT_PUBLIC_SENTRY_DSN=...                 # web — separate Sentry project; baked into the browser bundle at build
# Optional, web build-time only: enables production source maps.
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...
# Cloudflare dashboard → Tunnels → vocora-production → Add a replica.
CLOUDFLARE_TUNNEL_TOKEN=...
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
- Native Sign in with Apple sends an identity token whose audience is the iOS
  bundle identifier, so the API must have `APPLE_CLIENT_ID=uz.vocora.mobile`.
- Every variable above belongs in **this file** — the repo-root `.env` that
  `docker compose` interpolates. `apps/api/.env` and `apps/web/.env.local` are
  for local development only; the containers never read them, so a provider
  configured there alone fails in production with no obvious error.
- GitHub sign-in: register an OAuth App with Authorization callback URL
  `https://vocora.uz/uz/auth/github/callback` — exactly that path, including
  `/uz`, whichever language the learner starts in (GitHub allows one callback
  URL, so the locale is carried in `state` instead).
- Telegram sign-in: `/setdomain` the bot to `vocora.uz` in @BotFather.
  `NEXT_PUBLIC_TELEGRAM_BOT_ID` is the numeric part of the token before the
  colon; the full token stays server-side as `TELEGRAM_BOT_TOKEN`.
- `ENVIRONMENT=production` turns off `/docs`, turns on HSTS, and requires HTTPS
  cookies (`COOKIE_SECURE=true`).
- `API_BIND_HOST=127.0.0.1` keeps the API off the public network. The Compose
  tunnel reaches the services over the private Docker network.
- Checkout is exposed only for fully configured providers. Sandbox activation
  is always disabled in production, and the family plan is hidden until member
  management is implemented.
- **Uzum Checkout setup:** in the Uzum merchant/Checkout panel set the callback
  URL to `https://api.vocora.uz/api/v1/payments/uzum/<UZUM_WEBHOOK_SECRET>`.
  The placeholder must be replaced with the same long random value saved in
  `.env`. Do not place the terminal ID, API key, or webhook secret in a web,
  mobile, or EAS environment variable. Card data stays on Uzum's hosted page;
  Vocora verifies every callback by fetching the order status from Uzum before
  enabling Premium. Only the verified `COMPLETED` result enables Premium;
  `DECLINED`, pending, cancelled, refunded, or amount-mismatched orders never
  unlock it.

## 2. Build & run

```bash
node scripts/release-preflight.mjs --server-only
docker compose --profile production build
docker compose --profile production up -d --remove-orphans
docker compose exec api python -m scripts.seed   # idempotent: corpus + passages
curl --fail https://api.vocora.uz/health/detail
curl --fail --head https://vocora.uz/uz
```

The API container runs `alembic upgrade head` on boot, so schema upgrades are
a `git pull && docker compose --profile production build api && docker compose
--profile production up -d api`.

## 3. Cloudflare Tunnel and TLS

The Compose production profile starts the dashboard-managed tunnel with
`CLOUDFLARE_TUNNEL_TOKEN`; do not paste that token into source control or chat.
In Cloudflare's `vocora-production` tunnel, configure exactly these published
application routes:

- `vocora.uz` → `http://web:3000`
- `api.vocora.uz` → `http://api:8000`

These are Docker service names, not `localhost`. Keep the tunnel's connector at
one or more healthy replicas. A stopped server/connector makes both public hosts
unavailable even when DNS is correct.

Cloudflare terminates public TLS, while the outbound-only tunnel means the host
does not need public inbound 80/443. Keep the zone SSL mode at **Full (strict)**.

### Alternative: public nginx origin

Terminate TLS in front with nginx — [`deploy/nginx-vocora.conf`](deploy/nginx-vocora.conf)
is the version-controlled starting point (per-IP request/connection limits,
correct WebSocket upgrade handling, Cloudflare real-IP resolution — see §4 for
why that matters). Copy it to the VM (e.g. `/etc/nginx/conf.d/vocora.conf`),
fill in `ssl_certificate`/`ssl_certificate_key` (a Cloudflare Origin CA
certificate pairs with "SSL/TLS mode: Full (strict)" in the dashboard — see
§4), and `nginx -t && systemctl reload nginx`. Route:

- `api.vocora.uz` → `:8000` — the config already proxies WebSockets
  (`/api/v1/ws/quiz`, `/api/v1/coach/sessions/*/live`) with the upgrade
  headers nginx needs (`proxy_set_header Upgrade $http_upgrade; Connection
  "upgrade"`).
- `vocora.uz` → `:3000`.
- The proxy enforces a 5 MB request-body limit; the API's own 5 MB cap
  (`MAX_REQUEST_BYTES`) is a backstop, not a substitute.
- Set `TRUSTED_PROXY_CIDRS` to the exact reverse-proxy/LB socket peers that can
  reach the API — with nginx and the API on the same VM/docker network, that's
  typically just nginx's own address. The API ignores `X-Forwarded-For` from
  every other source and walks trusted proxy chains from right to left,
  preventing a client-supplied left-most value from choosing its rate-limit
  key. Do not use `0.0.0.0/0` or `::/0`.
- The proxy config appends/overwrites `X-Forwarded-For`. Uvicorn's own
  proxy-header parsing is disabled so this application allowlist is the single
  trust boundary.

If you'd rather use Caddy or a cloud LB instead of the nginx config above, the
same three things still apply wherever TLS terminates: proxy the WebSocket
routes with upgrade headers intact, enforce a body-size limit, and set
`TRUSTED_PROXY_CIDRS` to that proxy's real address.

## 4. DDoS posture

vocora.uz and api.vocora.uz already resolve through Cloudflare (anycast IPs,
Cloudflare nameservers) — that edge is the layer that actually absorbs a
volumetric, millions-req/sec-scale flood; nothing below replaces it. This
section is what's still worth doing at and under the origin.

**Cloudflare dashboard (do this once, ~10 minutes, all on the free tier):**

- **DNS**: both `vocora.uz` and `api.vocora.uz` records stay **Proxied**
  (orange cloud) — a grey-cloud (DNS-only) record bypasses Cloudflare
  entirely and exposes the origin IP directly.
- **SSL/TLS → Overview**: mode **Full (strict)** — requires a valid cert at
  the origin (a free Cloudflare Origin CA certificate, issued from
  SSL/TLS → Origin Server, is the easiest option and pairs with the nginx
  config in §3).
- **Security → Bots**: turn on **Bot Fight Mode**.
- **Security → WAF**: enable the **Cloudflare Managed Ruleset**.
- **Security → WAF → Rate limiting rules**: add a rule on
  `api.vocora.uz/api/v1/auth/*` (e.g. block for 10 minutes past ~20
  requests/minute from one IP) — a second layer above the app's own
  per-account `RATE_LIMIT_LOGIN`/`RATE_LIMIT_REGISTER`
  (`apps/api/app/core/config.py`), which can't see requests spread across
  many different accounts from the same attacker.
- **"I'm Under Attack Mode"** (Overview tab): the emergency toggle for an
  actual live incident — adds a JS challenge in front of every request, which
  hurts real users, so it's for the day there's a genuine flood in progress,
  not a standing setting.

**Origin exposure — verify after launch.** Run once on the VM:

```bash
sudo ss -tlnp | grep -E ':80|:443'   # anything listening on a public interface?
pgrep -a cloudflared                  # is Cloudflare Tunnel running?
sudo ufw status verbose               # or: sudo iptables -L -n
```

- **With the default production profile, `cloudflared` is running and nothing
  public listens on 80/443**: the
  origin has no inbound port to bypass Cloudflare with at all — this is
  already the strongest posture, no firewall change needed. Just confirm
  there's no stray `ufw allow 80/443` left over from an earlier attempt, and
  that `cloudflared`'s own config (`~/.cloudflared/config.yml` or the
  dashboard-managed tunnel) only routes `vocora.uz`/`api.vocora.uz`, not a
  wildcard.
- **If 80/443 are publicly bound** (port-forwarded router, cloud instance
  with a public IP): an attacker who discovers the origin IP — a leaked DNS
  history, a misconfigured subdomain, a service banner — can hit it directly
  and skip Cloudflare's protection entirely. Lock this down with
  [`scripts/deploy/allow-cloudflare-only.sh`](../scripts/deploy/allow-cloudflare-only.sh)
  (`sudo` it on the VM): it fetches Cloudflare's current published IP ranges
  and restricts inbound 80/443 to those ranges only, via `ufw`. It never
  touches the SSH port or any other existing rule.

## 5. Health & observability

- Sentry captures unhandled exceptions on both services when `SENTRY_DSN` (api)
  and `NEXT_PUBLIC_SENTRY_DSN` (web) are set — use two separate Sentry projects,
  not one DSN for both. Request bodies, cookies, and auth headers are scrubbed
  before an event leaves the process; see `apps/api/app/core/observability.py`
  and `apps/web/instrumentation.ts`.
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

## 6. Backups & state

All durable state is in Postgres (`pgdata` volume): users, SRS history, corpus,
payments. `review_logs` is append-only — size it accordingly. Redis holds
rate-limit counters, response cache, and now live multiplayer room state
(`mp:room:*`, TTL-capped) — safe to lose: a Redis restart or deploy just drops
any in-progress quiz rooms (players rejoin a new one), and finished games are
already durable in Postgres (`mp_sessions`/`mp_questions`/`mp_players`/`mp_answers`).

Use the encrypted, off-site Restic automation in
[`backup-disaster-recovery.md`](./backup-disaster-recovery.md). A dump stored
only beside `pgdata` on this VM does not satisfy production recovery needs.
The timer retains 14 daily, 8 weekly, and 12 monthly snapshots and has a
read-only verification command plus a tested restore procedure.

## 7. CI

`.github/workflows/ci.yml` gates every push/PR on four jobs: pytest on SQLite,
pytest **plus migrations & seed on Postgres 16** (dialect drift is caught here,
not on the VM), web typecheck/lint/vitest/build, and mobile typecheck/release
configuration validation.

The mobile audit blocks critical advisories. Expo SDK 54's CLI/Metro build
toolchain currently reports upstream high advisories whose offered npm fix is a
breaking SDK 57 upgrade. Upgrade Expo in a dedicated tested release rather than
letting `npm audit fix --force` rewrite the native stack immediately before a
store submission.
