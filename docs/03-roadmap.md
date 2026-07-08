# Words.uz — Engineering Milestones

Rule: **one milestone at a time**, each shipped production-ready (code + schema + API + UI + tests + docs) before the next begins. Every milestone ends with a working, deployable product.

## Tech decisions (locked)

- **Frontend:** Next.js (App Router, Server Components) · TypeScript · TailwindCSS · shadcn/ui · Framer Motion. Mobile-first PWA (89% of the market is on phones).
- **Backend:** Python FastAPI · SQLAlchemy 2 + Alembic · PostgreSQL · Redis (cache, queues, leaderboards via sorted sets, rate limiting).
- **Auth:** JWT (short-lived access + rotating refresh), Google/Apple OAuth, email+password with verification.
- **Media:** Cloudinary (images), S3-compatible storage (audio); CDN in front.
- **AI:** Claude API (tutor, explanations, story/quiz generation); server-side proxy with per-plan quotas; all core corpus content human-reviewed.
- **SRS:** SM-2 to start (simple, proven), architected behind a `Scheduler` interface so FSRS can replace it without data migration.
- **Payments:** Payme + Click merchant APIs (Uzbekistan), card fallback later.
- **Ops:** Docker Compose (dev) → containerized deploy; staged rollouts; append-only review-history tables (the "never lose user data" lesson from WordUp/Knowt).

## Milestones

### M1 — Foundation & Auth *(next up)*
Monorepo layout (`apps/web`, `apps/api`), CI, envs. DB core: users, sessions, profiles. FastAPI auth (register/login/refresh/verify/reset, Google OAuth), rate limiting, security headers. Next.js shell: design system (tokens, dark/light, i18n uz/ru/en), landing page, auth pages, empty dashboard. Tests: API auth suite + web e2e smoke.
**Done when:** a user can sign up, verify, log in, and see a localized dashboard in production config.

### M2 — Vocabulary Core & Content Pipeline
Schema: words, senses, translations (uz/ru), examples, IPA/audio refs, images, synonyms/antonyms, collocations, word families, CEFR level, frequency rank, categories, tags. Admin CMS: CRUD + CSV import + review workflow. Seed content: **A1 starter corpus (first 300 words, full spec per word)** via AI-drafted + teacher-review pipeline. Public: vocabulary browser, word detail pages (SEO), search/filters.
**Done when:** A1 corpus is browsable, searchable, and admin-manageable.

### M3 — Flashcards & SRS Engine
`Scheduler` interface + SM-2 implementation with full unit-test battery. Review session UI: flip animation, swipe + keyboard shortcuts, audio, hints, memory notes, Again/Hard/Good/Easy. Custom decks, folders, favorites, tags; Quizlet/Anki CSV import; export always on. Daily queue builder (new + due mix), append-only review log.
**Done when:** the complete learn→review loop works daily and retention data accrues.

### M4 — Gamification Layer
XP, levels, coins; streaks with freeze/repair mechanics (anti-anxiety design per research); achievements/badges; daily goal; weekly leagues on Redis sorted sets; daily reward. Profile page with public stats.
**Done when:** the core loop has visible progression and a weekly league runs end-to-end.

### M5 — Games (wave 1) + Statistics
Six highest-value games first: Word Match, Speed Quiz, Fill Blank, Audio Guess, Typing Race, Memory Cards — all pulling from the user's weak/due words (games feed SRS, not a separate silo). Statistics: heatmap calendar, accuracy, retention curve, forgotten/mastered words, time spent, weak categories.
**Done when:** games measurably generate review events and stats render from real data.

### M6 — AI Tutor
Claude-powered: word explanations in Uzbek, example/mnemonic generation, mini-stories from your due words, quiz generation, conversation practice with level adaptation (the Memrise failure), writing correction. Quota system by plan; every AI output labeled + reportable.
**Done when:** free users get 5 useful AI actions/day with quotas enforced server-side.

### M7 — Monetization
Payme + Click integration, subscription lifecycle (trial, renew, grace, cancel), pricing page, premium gating, family plan, referral program. Revenue analytics in admin.
**Done when:** a real so'm payment upgrades an account end-to-end in sandbox + production.

### M8 — Teacher & Admin Panels
Teacher: classes, invite links, homework assignments (deck + deadline), class progress analytics. Admin: user management, moderation queue for community decks, bug reports/feature requests, dashboards.
**Done when:** a teacher can run a 30-pupil class for a week without touching us.

### M9 — Games wave 2 + Social
Remaining games (Crossword, Hangman, Word Search, Spelling Bee, Sentence Builder, Boss Battle, Multiplayer Quiz via WebSocket, …), friends, challenges, achievement sharing.

### M10 — Content scale-out, Performance & Hardening
A2–B2 corpus completion (≈3,000 words), listening/reading/writing/speaking sections, Lighthouse 95+ pass, Core Web Vitals, image/audio optimization, security audit (OWASP pass), load testing, observability.

## Working agreement

- Every milestone PR ships with: migrations, seeds, API docs (OpenAPI), tests, and a `docs/milestones/MX.md` design note.
- No placeholder code merged. Feature-flag unfinished surfaces instead.
- Any schema touching review history is append-only + reversible migration, always.
