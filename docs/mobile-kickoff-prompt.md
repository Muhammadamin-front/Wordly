# Vocora Mobile — kickoff brief for Codex

Paste everything below this line into Codex as the initial task, in this same repo checkout.

---

## What this is

Vocora is an Uzbek-first English vocabulary + IELTS learning app. Existing stack in this monorepo: Next.js 16 web app (`apps/web`) + FastAPI backend (`apps/api`) + Postgres/Redis. This task starts a **React Native (Expo) mobile client** that talks to the *same* backend. You are not building a new product — you are building a second client for the one that already exists.

Read `PRODUCT.md` and `DESIGN.md` at the repo root first — they are the source of truth for product intent, priorities, and visual identity. Don't ask for them to be restated.

## Hard rules

1. All new code goes in `apps/mobile/`. Treat `apps/web/` as **read-only reference** — never edit it. The one exception is the single backend change described below.
2. Don't scan the whole repo. Use the specific reference files listed in this brief, plus the live OpenAPI schema (see below), instead of reading every file under `apps/api/app/api/v1/` (21 route modules — most are out of scope, see "v1 scope").
3. No new monorepo tooling (no Turborepo/Nx). `apps/mobile` just follows the same sibling-folder convention as `apps/web` and `apps/api` — its own `package.json`, its own README.

## Day 1: one required backend fix

Access tokens expire in **15 minutes** (`ACCESS_TOKEN_TTL_SECONDS` in `apps/api/app/core/config.py`). Refresh currently only works via an httpOnly cookie: `apps/api/app/api/v1/auth.py`'s `/auth/refresh` reads `refresh_token_from_cookie(request)`, and the refresh token is *never* included in any JSON response body (`TokenPair` in `apps/api/app/schemas/auth.py` has no `refresh_token` field). A native app has no cookie jar, so without a fix every user gets logged out every 15 minutes.

Fix it without weakening the web app's existing XSS protection (the refresh token must stay out of the response body for ordinary browser requests — that's why it's cookie-only today):

- Have the mobile app send a header on every auth call, e.g. `X-Client: mobile`.
- On `/auth/login`, `/auth/register`, `/auth/google`, `/auth/apple`, `/auth/github`, `/auth/telegram`: when that header is present, also return the raw refresh token in the JSON body (add `refresh_token: str | None = None` to `TokenPair`). When absent, behavior is byte-for-byte unchanged.
- On `/auth/refresh`: accept `refresh_token` from a JSON body as a fallback when no cookie is present.
- Add/extend a test in `apps/api/tests/` covering: web-shaped requests are unaffected; a mobile-flagged request receives a working refresh token in the body; that token successfully refreshes.

Do this before writing mobile screens — persistent login depends on it.

## API contract

Backend runs locally at `http://127.0.0.1:8000` (`API_PORT` in `docker-compose.yml`). With the API running, generate types instead of hand-reading route files:

```bash
curl http://127.0.0.1:8000/openapi.json -o apps/mobile/openapi.json
npx openapi-typescript apps/mobile/openapi.json -o apps/mobile/src/api/schema.ts
```

Regenerate whenever a used endpoint's shape changes. Don't hand-maintain duplicate types.

Auth response shape today (`TokenPair`): `access_token`, `token_type`, `expires_in` (seconds, currently 900), `user`, and after the Day-1 fix, `refresh_token`. Web's reference client is `apps/web/lib/api.ts` — same token semantics, but adapt *storage* for native: `expo-secure-store` for both tokens (web keeps the access token in memory only and relies on the cookie for refresh; mobile has no cookie fallback, so persist both). Refresh proactively a little before `expires_in`, not reactively on first 401.

## v1 scope — the core loop only

Per `PRODUCT.md`'s own stated priority ("vocabulary mastery comes first"; "launch-critical learning loops matter more than broad feature surface area"), build only:

1. **Auth** — email/password + one OAuth provider (Google). Logout.
2. **Onboarding** — level placement. Reference `apps/web/app/[lang]/onboarding/`.
3. **Library** — browse CEFR levels A1–C2 and categories. Reference `apps/web/app/[lang]/library/`, `apps/web/app/[lang]/vocabulary/`, and `apps/web/lib/library.ts` for the shelf/category model.
4. **Word detail**. Reference `apps/web/app/[lang]/words/[slug]/`.
5. **Review** — the SRS session (backed by `flashcards.router` in the API). Reference `apps/web/app/[lang]/review/`.
6. **Decks** — custom decks. Reference `apps/web/app/[lang]/decks/`.
7. **Today** — daily dashboard/streak. Reference `apps/web/app/[lang]/today/`.
8. **Profile/account** — minimal settings. Reference `apps/web/app/[lang]/profile/` and `apps/web/app/[lang]/account/`.

**Explicitly out of scope for v1** — do not build: admin, teacher/classes, multiplayer, friends, leaderboard, coach (incl. live coach), ai, games, grammar, ielts, expressions, gamification/achievements, billing, pricing, mastery, mistakes, statistics, support, legal, push notifications. Revisit once the core loop works end-to-end on a real device.

If you offer Google Sign-In and later submit to the iOS App Store, Apple requires Sign in with Apple as well. Not needed for this kickoff — just don't build anything that assumes Google is the only provider forever.

## Design

Follow `DESIGN.md` exactly: same palette (paper surfaces, espresso ink, rust/burnt-orange for primary action, muted teal for secondary/supplementary), same restraint (compact "stamp" labels, never candy-colored pill collections). Self-host the same two fonts via `expo-font` — reuse the actual files, don't re-source new ones:

- `apps/web/public/fonts/bebas-neue-latin-400.ttf` (display)
- `apps/web/public/fonts/manrope-latin-{400,500,600,700,800}.ttf` (UI)

This should read as the same brand's native app, not a generic Expo starter look.

## i18n

Three locales: `uz` (default), `ru`, `en`. Reuse the string values from `apps/web/app/[lang]/dictionaries/{uz,ru,en}.json` as your starting point for whatever screens you build — don't re-translate from scratch, and keep the same locale codes.

## Stack

- Expo (managed workflow) + TypeScript.
- **Expo Router** (file-based, mirrors the Next.js App Router conventions already used in `apps/web` — same mental model for whoever maintains both).
- `expo-secure-store` for tokens.
- A typed fetch client built on the generated OpenAPI schema, not `axios` with `any`.
- React Query (or equivalent) for server state — nearly every screen above is API-backed.

## Definition of done

- `apps/mobile/` boots in Expo Go / a simulator against the local API.
- A learner can: register or log in, complete onboarding, browse the library, open a word, run one full review session (answers persist to the backend), see it reflected on Today, and stay logged in past 15 minutes without a fresh login (proves the Day-1 refresh fix works).
- `apps/mobile/README.md`: how to run it, how to regenerate API types, what's deliberately deferred.

Work in small, verifiable slices (auth + token storage first, then one screen at a time) rather than scaffolding all eight screens before anything is tested against the real API.
