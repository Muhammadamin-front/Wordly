# Words.uz

**Duolingo's fun + Anki's science + Quizlet's simplicity — built for Uzbekistan.**

English vocabulary platform for Uzbek learners: Uzbek/Russian-native explanations, IELTS/CEFR
tracks, honest spaced repetition, local payments. See [docs/](docs/) for market research,
product spec, and the milestone roadmap.

## Repository layout

```
apps/
  web/   Next.js 16 (App Router, Tailwind v4, uz/ru/en i18n)  — port 3000
  api/   FastAPI + SQLAlchemy 2 (async) + Alembic             — port 8000
docs/    Research, product spec, roadmap, milestone notes
```

## Quick start (local, zero external services)

The API falls back to SQLite and in-memory rate limiting, so nothing else is required:

```bash
# API
cd apps/api
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload --port 8000

# Web (repo root)
npm install
npm run dev:web        # http://localhost:3000 → redirects to /uz
```

Copy `apps/api/.env.example` → `apps/api/.env` and `apps/web/.env.example` → `apps/web/.env.local`
to customize (Google OAuth, Postgres, Redis).

## Production-parity stack

```bash
docker compose up      # Postgres 16 + Redis 7 + API (migrations run on boot)
npm run dev:web
```

## Tests

```bash
npm run test:api       # pytest — auth, rotation/reuse-detection, reset, rate limit, headers
npm run test:web       # vitest — i18n dictionary parity, login form behavior
npm run lint:web
npm run build:web
```

## Milestones

| # | Scope | Status |
|---|---|---|
| M0 | Market research, product spec, roadmap | ✅ `docs/` |
| M1 | Monorepo, auth (email + Google), i18n web shell, CI | ✅ `docs/milestones/M1.md` |
| M2 | Vocabulary core, admin CMS + CSV import, 306-word A1 corpus | ✅ `docs/milestones/M2.md` |
| M3 | Flashcards & SRS engine (SM-2, decks, review UI, import/export) | ✅ `docs/milestones/M3.md` |
| M4 | Gamification (XP/levels, streaks+freezes, achievements, weekly leagues) | ✅ `docs/milestones/M4.md` |
| M5 | Games (6, feeding SRS) + statistics dashboard | ✅ `docs/milestones/M5.md` |
| M6 | AI Tutor (explain/mnemonic/story/quiz/chat/writing, quotas) | ✅ `docs/milestones/M6.md` |
| M7 | Monetization (Payme + Click, subscriptions, referrals) | ✅ `docs/milestones/M7.md` |
| M8 | Teacher panel (classes, homework, analytics) + admin panel | ✅ `docs/milestones/M8.md` |
| M9 | Games wave 2 (5 games) + social (friends, profiles, real-time multiplayer quiz) | ✅ `docs/milestones/M9.md` |
| M10 | Performance & hardening (cache, rate limits, observability, load test) + A2 corpus | ✅ `docs/milestones/M10.md` |
