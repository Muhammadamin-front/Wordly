# Wordly Product Audit

Date: 2026-07-31  
Scope: Next.js web app, FastAPI API, PostgreSQL data, Docker/CI, public and authenticated user flows  
Decision: **NOT READY for a public paid launch**

## 1. Executive Summary

Wordly has a stronger technical base than a typical demo. The repository contains 48 localized page routes, 28 backend test modules, a real PostgreSQL schema, Redis-backed rate limiting and caching, SRS review history, gamification, an admin CMS, local payment adapters, teacher tools, social features, 12 games, and a substantial vocabulary corpus.

The clearest product opportunity is:

> **The English vocabulary platform built for Uzbek learners: Uzbek-first explanations, a guided CEFR path, and scientific daily review.**

The current risk is not a lack of features. It is the opposite: the product surface has grown faster than the launch-critical learning loop, trust infrastructure, localization, analytics, and monetization contract.

### What is already strong

- The home page communicates the Uzbek-first vocabulary value within 5–10 seconds.
- The visual system is now distinctive: emerald, ivory, brass, subtle cultural geometry, good dark/light foundations, and reduced-motion support.
- Vocabulary storage is relational and extensible: words, senses, examples, categories, and relations.
- The running database has 8,963 published words, 8,963 senses, 26,889 examples, and 812 expressions.
- Every published word currently has exactly three English examples.
- There are no duplicate published `(headword, part of speech)` groups and no duplicate expressions.
- SRS cards are user-owned, due-card queries are indexed, and review history is append-only.
- Authentication already has bcrypt, short-lived access tokens, refresh rotation, hashed one-time tokens, generic login/reset responses, and session revocation after reset.
- Public vocabulary endpoints have pagination, cache headers, ETags, and sensible limits.
- CI covers backend on SQLite and PostgreSQL, migration + seed, frontend type checking, lint, unit tests, and production build.
- Current verification is green: web tests `75/75`, API tests `223/223`, lint passed, database migration is at Alembic head.

### Main product diagnosis

Wordly should launch as a focused vocabulary product, not as an AI tutor, social network, classroom platform, multiplayer game suite, and IELTS simulator at the same time. The first release should make one promise exceptionally well:

1. Pick a useful learning path.
2. Learn a small number of words.
3. Review them at the right time.
4. See real progress.
5. Return tomorrow.

## 2. Evidence Snapshot

| Area | Current evidence |
|---|---|
| Web | Next.js 16, App Router, TypeScript, Tailwind v4, 48 localized page routes |
| API | FastAPI, async SQLAlchemy, 37 PostgreSQL tables, 28 test modules |
| Data | 8,963 published words; A1 816, A2 1,425, B1 1,855, B2 3,025, C1 1,609, C2 233 |
| Examples | 26,889 total; exactly 3 English examples per word |
| Expressions | 812 across 32 categories; 3+ examples and usage notes present |
| Missing content | 17,683 Uzbek example translations; 26,721 Russian example translations; 191 IPA values; 7,128 images |
| Audio | 0 stored word audio URLs; ElevenLabs is configured locally and audio is generated/cached on demand |
| Tests | Web 76 passed; API 241 passed; lint and production build passed |
| Runtime | API, web, PostgreSQL, and Redis containers healthy; migration at head |
| Analytics | No product analytics SDK or event pipeline found |
| Legal/data rights | No privacy, terms, cookie, full data export, or account deletion flow found |

## 3. Most Important Product And Production Problems

### P0. Production email does not exist

- **Status:** **Resolved 2026-07-31.** Resend delivery, production fail-fast
  configuration, locale-aware links, masked provider failures, and token-safe
  development logging are implemented. A resend-verification action remains a
  later product enhancement.
- **Problem:** `ConsoleEmailer` is the only email implementation. It stores messages in process memory and writes verification/reset links, including tokens, to logs.
- **Why it matters:** Real users cannot receive verification or password-reset email. Tokens in logs create an unnecessary secret exposure.
- **User impact:** Password recovery and email verification are effectively broken outside development.
- **Recommended solution:** Add a provider adapter (Resend, Postmark, SES, or SMTP), HTML/text templates, delivery failure handling, resend-verification endpoint with rate limits, and production startup validation. Never log tokens.
- **Priority:** **Critical**
- **Evidence:** `apps/api/app/services/emailer.py:11-24`, `apps/api/app/api/v1/auth.py:108-116`, `apps/api/app/api/v1/auth.py:239-258`

### P0. Refresh-token protection is undermined

- **Status:** **Resolved 2026-07-31.** Refresh credentials are cookie-only;
  browser JSON responses and request bodies no longer expose or accept them.
- **Problem:** The refresh token is set as an `httpOnly` cookie but is also returned in every register/login/Google/refresh JSON response.
- **Why it matters:** JavaScript can read the response body, so an XSS can steal the long-lived token despite the cookie protection.
- **User impact:** Account takeover risk is larger than the UI and comments imply.
- **Recommended solution:** Browser auth responses must return access token + user only. Keep refresh tokens exclusively in the scoped cookie. If native clients are needed later, give them a separate contract.
- **Priority:** **Critical**
- **Evidence:** `apps/api/app/api/v1/auth.py:52-66`, `apps/api/app/api/v1/auth.py:175-202`, `apps/api/app/schemas/auth.py:62-67`

### P0. Paid launch is not operational

- **Status:** **Engineering risks mitigated 2026-07-31.** Docker now forwards
  Payme/Click credentials, the API publishes provider readiness, unconfigured
  checkout cannot create orders, production sandbox is always disabled, and
  the family plan is not publicly listed or purchasable. A real paid launch
  still requires merchant onboarding and production credentials.
- **Problem:** The local environment has no payment credentials; Docker Compose does not forward Payme/Click credential variables; the pricing UI always shows a sandbox activation action; the family plan is sold but has no family-member management flow.
- **Why it matters:** A payment adapter existing in code is not the same as an end-to-end purchasable product.
- **User impact:** Checkout fails or looks like a demo, and a purchased family benefit cannot be used.
- **Recommended solution:** Disable public checkout until merchant onboarding is complete. Add credential variables to deployment, server-side readiness checks, provider sandbox integration tests, a payment ledger/reconciliation job, and family invite/remove UI before selling that plan.
- **Priority:** **Critical for paid launch; High for free beta**
- **Evidence:** `docker-compose.yml:39-49`, `apps/web/components/billing/pricing-view.tsx:139-179`, `apps/api/app/api/v1/payments.py:82-129`, `apps/api/app/models/billing.py:45-55`

### P0. Review submission is not idempotent

- **Status:** **Resolved 2026-07-31.** Review requests require an
  `Idempotency-Key`; durable response receipts and a database unique constraint
  guarantee retries return the original result without advancing SRS or XP
  twice.
- **Problem:** `POST /review/{card_id}` has no idempotency key or duplicate-submission guard.
- **Why it matters:** A retry, double tap, or flaky network can advance the SRS state twice and award XP twice.
- **User impact:** Incorrect due dates, inflated stats, and reduced trust in the core learning system.
- **Recommended solution:** Accept an `Idempotency-Key` or review-session item ID, enforce a unique database constraint, and return the original result for duplicates.
- **Priority:** **Critical**
- **Evidence:** `apps/api/app/api/v1/flashcards.py:390-404`

### P0. Production secret validation can accept a known Compose secret

- **Status:** **Resolved 2026-07-31.** Production now rejects known development
  and test defaults, placeholders, secrets shorter than 48 characters, and
  low-entropy values. Compose uses the same explicitly rejected development
  fallback, so switching only `ENVIRONMENT` to production fails safely.
- **Problem:** Production startup rejects only `dev-only-secret-change-me`, while Compose supplies a different predictable fallback: `compose-dev-secret-change-me-32-bytes!`.
- **Why it matters:** Setting `ENVIRONMENT=production` without overriding the Compose default starts production with a public, known signing key.
- **User impact:** Attackers could forge access tokens.
- **Recommended solution:** Make `SECRET_KEY` required in production, reject all known development defaults, enforce minimum entropy/length, and use deployment secrets rather than Compose defaults.
- **Priority:** **Critical**
- **Evidence:** `docker-compose.yml:33-35`, `apps/api/app/main.py:32-36`

### P1. Rate limiting trusts spoofable proxy headers

- **Problem:** `client_ip()` trusts the first `X-Forwarded-For` value from every request.
- **Why it matters:** Unless a trusted reverse proxy strips and rewrites the header, clients can choose their own rate-limit key.
- **User impact:** Login/register/AI abuse protection can be bypassed.
- **Recommended solution:** Trust forwarded headers only from configured proxy IPs, or have the proxy overwrite the header and pass the verified client IP in a private header.
- **Priority:** **High**
- **Evidence:** `apps/api/app/core/rate_limit.py:60-80`, `docs/deploy.md`

### P1. No onboarding or personalized first learning path

- **Problem:** Registration goes directly to the dashboard. Profile data has no level, goal, IELTS target, interests, daily time, or onboarding state.
- **Why it matters:** A new user faces many destinations without a recommended first lesson.
- **User impact:** Lower first-lesson completion and weak D1 retention.
- **Recommended solution:** Add a 4-step onboarding flow, create the starter deck automatically, and finish with a 5-word lesson. The dashboard should then show one dominant “Continue” action.
- **Priority:** **High**
- **Evidence:** `apps/web/components/auth/register-form.tsx:29-45`, `apps/api/app/schemas/auth.py:42-49`, `apps/web/components/dashboard/dashboard-view.tsx:89-247`

### P1. Guest exploration CTAs lead to an auth wall

- **Problem:** “Darajalarni ko‘rish” and level cards imply public preview, but `/decks` and `/library/{level}` redirect guests to login.
- **Why it matters:** The secondary CTA promises exploration, not registration.
- **User impact:** High-intent visitors hit an unexpected wall before seeing the learning experience.
- **Recommended solution:** Keep `/vocabulary` and a five-card level preview public. Change CTA destinations to public preview routes, then ask for registration only when saving progress or continuing.
- **Priority:** **High**
- **Evidence:** `apps/web/app/[lang]/page.tsx:87-99`, `apps/web/components/library/library-view.tsx`, browser-verified redirect `/uz/decks -> /uz/auth/login`

### P1. Localization is incomplete and misleading

- **Problem:** Russian Expressions UI displays Uzbek translations. IELTS skill descriptions and most learning content remain English inside Uzbek/Russian routes. `ExpressionsView` receives `lang` but ignores it.
- **Why it matters:** Uzbek-first localization is the product’s primary differentiation.
- **User impact:** Russian users receive incorrect-language content; beginner Uzbek users cannot understand advanced IELTS guidance.
- **Recommended solution:** Add `translation_ru` and localized rich fields to expressions, define localized IELTS content objects, enforce dictionary/content completeness in tests, and hide a locale until its core learning content is ready.
- **Priority:** **High**
- **Evidence:** `apps/web/components/expressions/expressions-view.tsx:30-37`, `apps/api/app/models/expression.py`, `apps/web/lib/ielts-resources.ts`, browser-verified `/ru/expressions`

### P1. Content count and capability claims are stale

- **Problem:** Home cards hard-code A2 1,414, B1 1,768, and B2 2,814 while the database contains 1,425, 1,855, and 3,025. Home IELTS copy promises AI feedback and speaking simulation while the current IELTS hub explicitly positions itself as static and zero-AI.
- **Why it matters:** Product claims must reflect the shipped product and current corpus.
- **User impact:** Users see inconsistent totals and expect unavailable features.
- **Recommended solution:** Fetch public aggregate counts from one API/cache; replace AI claims with static learning-resource benefits; define a claim-review checklist for releases.
- **Priority:** **High**
- **Evidence:** `apps/web/app/[lang]/page.tsx:29-34`, `apps/web/app/[lang]/page.tsx:457-553`, current database aggregates

### P1. Natural voice is unavailable to guests

- **Problem:** Public vocabulary and expressions show a Listen button, but natural TTS requires authentication. A signed-out click falls back to the robotic browser voice.
- **Why it matters:** Pronunciation is part of the public value proposition and the ElevenLabs key is configured.
- **User impact:** The first experience sounds lower quality than the signed-in experience without explanation.
- **Recommended solution:** Allow aggressively rate-limited, cached public TTS for short published headwords, or pre-generate top-word audio. Make fallback status visible and test it.
- **Priority:** **High**
- **Evidence:** `apps/api/app/api/v1/tts.py:8-15`, `apps/web/lib/games.ts:95-132`, `apps/web/components/library/vocabulary-word-card.tsx:35-44`

### P1. Microphone policy conflicts with speaking features

- **Problem:** API responses set `Permissions-Policy: microphone=()` while speaking-game/live-coach code requests microphone access.
- **Why it matters:** The browser can block the feature at the policy layer.
- **User impact:** Speaking features may fail even when providers are configured.
- **Recommended solution:** For launch, hide/defer voice-coach routes. If speaking remains, serve a route-appropriate policy and run real browser permission tests.
- **Priority:** **High**
- **Evidence:** `apps/api/app/main.py:23-29`, `apps/web/components/coach/use-live-voice.ts`

### P1. Premium promises do not match entitlement enforcement

- **Problem:** Pricing says premium includes all games, offline mode, statistics, and no ads. All games and statistics are currently available without a premium check; offline caching is global; the app has no ads.
- **Why it matters:** A paid plan needs a truthful, enforceable value contract.
- **User impact:** Little reason to upgrade, and paid claims can feel deceptive.
- **Recommended solution:** Keep the core SRS loop free. Premium should unlock real depth: unlimited custom decks/import, advanced mistake analytics, downloadable packs, weekly reports, family seats, and carefully capped AI. Enforce access server-side.
- **Priority:** **High**
- **Evidence:** `apps/web/app/[lang]/dictionaries/uz.json:557-558`, `apps/web/components/games/games-hub.tsx`, `apps/api/app/services/subscriptions.py`

### P1. No product analytics

- **Problem:** No analytics SDK, first-party event table, or product-event contract exists.
- **Why it matters:** There is no way to measure signup conversion, onboarding completion, first-lesson success, D1/D7 retention, or paywall performance.
- **User impact:** Product decisions will be based on impressions rather than learning outcomes.
- **Recommended solution:** Add a consent-aware event layer with a typed client API, server-side learning events, anonymous-to-user identity merge, and a minimal dashboard.
- **Priority:** **High**

### P1. User trust and lifecycle are incomplete

- **Problem:** There is no account deletion, full user-data export, privacy policy, terms, cookie policy, or registration acceptance. Verification cannot be resent and is not required for sensitive actions.
- **Why it matters:** A production account system must explain and support data rights.
- **User impact:** Users can create accounts but cannot fully control or remove their data.
- **Recommended solution:** Add legal pages, explicit registration links/acceptance, data export, delete-account with recent-password confirmation, deletion grace period, verification resend, and verification gates for social/payment actions.
- **Priority:** **High**
- **Evidence:** `apps/api/app/api/v1/users.py`, `apps/web/components/auth/register-form.tsx:51-99`

### P1. Payment state transitions need stronger correctness

- **Problem:** Provider transaction IDs are indexed but not unique; state updates do not lock rows; concurrent callbacks can race. Canceling an old performed Payme payment cancels the user’s current subscription row, potentially affecting a later purchase. User-supplied return URLs are not allowlisted.
- **Why it matters:** Payment code must be correct under retries, concurrency, refunds, and out-of-order callbacks.
- **User impact:** Duplicate entitlement or loss of valid premium time.
- **Recommended solution:** Add unique constraints, `SELECT ... FOR UPDATE`, immutable entitlement ledger entries, refund adjustments tied to the originating payment, reconciliation, and return URL allowlisting.
- **Priority:** **High**
- **Evidence:** `apps/api/app/models/billing.py:59-83`, `apps/api/app/services/payme.py:120-149`, `apps/api/app/api/v1/payments.py:102-107`

### P2. Bulk level-add result is mathematically wrong

- **Problem:** After adding a limited batch, `already_added` is calculated as `total_available - just_added`.
- **Why it matters:** On a first A1 batch of 20, the response can say hundreds were already added.
- **User impact:** Incorrect confirmation and progress messaging.
- **Recommended solution:** Count the user’s matching cards before insert, or return `remaining_available` as a separately named field.
- **Priority:** **Medium**
- **Evidence:** `apps/api/app/api/v1/flashcards.py:246-286`

### P2. Global loading/error/404 UX is incomplete

- **Problem:** There are no route-level `loading.tsx`, `error.tsx`, `global-error.tsx`, or custom `not-found.tsx` files. Unknown routes show the default English Next.js 404.
- **Why it matters:** Network and rendering failures are inevitable in production.
- **User impact:** Blank transitions or off-brand, English-only failure pages.
- **Recommended solution:** Add localized loading, retryable error, offline, 404, and empty states with request IDs where relevant.
- **Priority:** **Medium**

### P2. Mobile guest navigation contains a dead destination

- **Problem:** The guest drawer shows only Features and Pricing; `#pricing` does not exist. It omits public Vocabulary and IELTS links visible on desktop.
- **Why it matters:** Mobile is likely the primary Uzbek learner device.
- **User impact:** Important public content is harder to discover and “Narxlar” appears broken.
- **Recommended solution:** Mirror core public navigation on mobile and link Pricing to a real public page/section.
- **Priority:** **Medium**
- **Evidence:** `apps/web/components/site/header.tsx:297-315`

### P2. SEO is only partially implemented

- **Problem:** There is no sitemap or robots route, no metadata base/Open Graph/Twitter images, and most public pages inherit generic metadata. A public `/securify` prototype remains in the product.
- **Why it matters:** Vocabulary pages can be a major organic acquisition channel, while unrelated prototypes dilute trust.
- **User impact:** Weak search/social previews and brand confusion.
- **Recommended solution:** Remove prototype routes, add localized sitemap/robots/canonicals/hreflang, rich metadata for IELTS/grammar/expressions, and structured data for vocabulary entries.
- **Priority:** **Medium**
- **Evidence:** `apps/web/app/[lang]/layout.tsx`, `apps/web/app/[lang]/securify/page.tsx`

### P2. Offline behavior is broader than its privacy claim

- **Problem:** The service worker caches every successful same-origin navigation, including authenticated route shells, while its comment only excludes API responses.
- **Why it matters:** Shared-device and stale-session behavior should be explicit.
- **User impact:** Stale personalized pages can appear offline after logout; offline learning itself is not complete because API data is network-only.
- **Recommended solution:** Cache only an explicit public allowlist until encrypted/offline user data is designed. Market the current feature as installable PWA, not full offline learning.
- **Priority:** **Medium**
- **Evidence:** `apps/web/public/sw.js`

### P2. Search will degrade as the corpus grows

- **Problem:** Search performs `%term%` `lower(...).like(...)` across joined translations without trigram/full-text indexes.
- **Why it matters:** The corpus and query volume are expected to grow.
- **User impact:** Slow search and expensive database scans.
- **Recommended solution:** Normalize apostrophe variants, add PostgreSQL `pg_trgm` GIN indexes or a dedicated normalized search column, and measure p95 query latency.
- **Priority:** **Medium**
- **Evidence:** `apps/api/app/services/vocabulary.py:141-177`

### P2. Content breadth is ahead of pedagogical quality control

- **Problem:** All words have three English examples, but most translated examples are absent. Some spot-checked entries contain spelling issues (`hayrli`), obscure items (`han`), or awkward learner phrasing. Images cover only 1,835 of 8,963 words.
- **Why it matters:** A 10k count is less valuable than a trusted 3k learning path.
- **User impact:** Confusion, weaker comprehension, and reduced confidence in translations.
- **Recommended solution:** Launch a reviewed “Core 3,000” first, add content quality states and reviewer attribution, run automated anomaly checks, and prioritize example translations by frequency.
- **Priority:** **Medium**

## 4. Frontend Production Checklist

- [ ] Localized `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`
- [ ] Real toast/notification system for save, delete, import, review, and network failures
- [ ] Public level preview that does not redirect to login
- [ ] Mobile drawer parity and real Pricing destination
- [ ] No dead links or unrelated prototype routes
- [ ] Registration terms/privacy links and password visibility/strength feedback
- [ ] Resend verification and verified-email state
- [ ] All submit actions disabled and idempotent during requests
- [ ] Keyboard walkthrough for header, drawers, flip cards, modals, filters, and review
- [ ] Automated accessibility scan plus manual screen-reader pass
- [ ] 360/390/768/1024/1440 responsive screenshots in light and dark modes
- [ ] Localized content completeness test, not only dictionary-key completeness
- [ ] Per-page metadata, canonical, hreflang, Open Graph, sitemap, robots
- [ ] Public claims sourced from API/config, not hard-coded counts
- [ ] Bundle and Core Web Vitals budget; lazy-load non-core motion/features
- [ ] Explicit offline scope and offline state

## 5. Backend And Operations Checklist

- [ ] Real email provider; never log one-time tokens
- [ ] Cookie-only refresh token for browser clients
- [ ] Refresh/reset/verify/resend rate limits
- [ ] Trusted proxy configuration for client IPs
- [x] Strong required production secret validation
- [ ] Idempotent review submissions
- [ ] Unique/locked payment transitions and reconciliation
- [ ] Payme/Click credentials actually injected by deployment
- [ ] `PAYMENTS_SANDBOX=false` and no sandbox UI in production
- [ ] Account deletion and complete user-data export
- [ ] Automated encrypted PostgreSQL backups plus restore drill
- [ ] Error tracking, structured logs, metrics, alerts, uptime checks
- [ ] Migration rollback/runbook and staging migration rehearsal
- [ ] p95/p99 latency and database slow-query visibility
- [ ] Redis and PostgreSQL not exposed publicly in production
- [ ] Reverse-proxy request-size and TLS/WebSocket configuration
- [ ] Dependency/security scanning and secret scanning in CI
- [ ] Production smoke test covering register, verify, first lesson, review, reset, and payment sandbox

## 6. Feature Decisions

Effort assumes one experienced full-stack engineer: S = 1–3 days, M = 4–8 days, L = 2–4 weeks.

| Feature | Decision | User benefit / retention | Complexity | Effort | Tier | Priority |
|---|---|---|---|---|---|---|
| Spaced repetition | Keep and harden | Core long-term memory loop | M | M | Free | Critical |
| Daily review | Make primary CTA | Strongest daily return reason | S | S | Free | Critical |
| Personal vocabulary / saved words | Keep | Ownership and relevance | S | S | Free with limits | High |
| Weak words | Add | Focuses effort on real gaps | M | M | Free basic, premium analytics | High |
| Mistake review | Add | Converts errors into progress | M | M | Free | High |
| Daily goal | Keep, set in onboarding | Commitment and progress clarity | S | S | Free | High |
| Streak | Keep, soften | Return cue without punishment | S | S | Free | High |
| XP / levels | Keep secondary | Motivation, not learning proof | S | S | Free | Medium |
| Achievements | Keep only meaningful ones | Milestone celebration | S | S | Free | Medium |
| Weekly report | Add | Shows learning outcome and next plan | M | M | Free summary, premium detail | High |
| Placement test | Add a short version | Better starting level | M | M | Free | High |
| Personalized path | Add rules first | Reduces choice overload | M | M | Free | High |
| AI examples | Avoid at launch | Cost/quality risk exceeds value | L | L | Premium later | Low now |
| Writing sample library | Expand | High-value static IELTS content | M | M | Free samples, premium packs | High |
| Band 7/8/9 comparison | Add | Makes scoring differences concrete | M | M | Premium depth | High |
| Use This Instead | Keep, make saveable | Practical lexical upgrades | S | S | Free | High |
| Examiner vocabulary | Keep, link to SRS | Connects IELTS to core product | S | S | Free/premium packs | High |
| IELTS synonym bank | Add trainer | Direct Reading + vocabulary value | M | M | Free core | High |
| Reading keyword trainer | Add | Active recall, not article reading | M | M | Premium advanced | High |
| Pronunciation | Fix guest TTS | Immediate vocabulary value | M | M | Free core | High |
| Listening practice | Add curated mini drills | Reinforces word recognition | M | M | Free limited | Medium |
| Offline mode | Narrow now, build later | Useful for mobile/data constraints | L | L | Premium later | Medium |
| Telegram bot | After retention proof | Low-friction reminders/review | M | M | Free reminder, premium review | Medium |
| Push notification | After consent design | Timely due-word reminder | M | M | Free | Medium |
| Friend challenge | Defer | Social motivation but not core | M | M | Free | Low now |
| Leaderboard | Keep opt-in | Useful for a motivated minority | S | S | Free | Low |

### Must-have before launch

1. Production email and account recovery.
2. Auth token fix and trusted proxy/rate-limit hardening.
3. Idempotent review submission.
4. Onboarding + automatic starter deck + first lesson.
5. Public level preview and honest home/IELTS claims.
6. Analytics events for the core funnel.
7. Legal pages, data export, and account deletion.
8. Localized errors/loading/404 and mobile navigation fix.
9. Core corpus QA and locale completeness thresholds.
10. Monitoring, backup, and restore verification.

### Add after launch

- Weak-word queue and mistake review.
- Weekly learning report.
- Short adaptive placement test.
- Rules-based personalized path.
- Push/Telegram reminders after notification timing is measured.
- IELTS synonym and paraphrase trainers.
- Better offline review packs.

### Premium candidates

- Advanced weak-word and retention analytics.
- Unlimited custom decks/import/export packs.
- Downloadable topic packs and offline review.
- Band 7/8/9 annotated essay comparisons.
- Advanced IELTS synonym/paraphrase trainer.
- Family seats only after family management exists.
- Limited, transparent AI writing feedback only after cost and quality benchmarks.

### Avoid for now

- Live AI speaking coach.
- Unlimited generative AI.
- More games before existing games have adoption data.
- Multiplayer expansion.
- New social feed/community content.
- B2B teacher expansion before B2C retention works.
- TOEFL/SAT/business shelf expansion.
- Real-time pronunciation scoring.

## 7. Onboarding And Retention System

### Four-step onboarding

1. **Goal:** General English, school/university, work, IELTS; IELTS users choose target band.
2. **Starting point:** Self-select CEFR or take a 12-question placement check.
3. **Commitment:** 5, 10, 15, or 20 minutes; derive a 5/10/15/20-word daily goal.
4. **Interests:** Choose 3 topics; create a starter path and immediately run a five-word lesson.

Store `onboarding_completed_at`, `goal_type`, `estimated_level`, `target_band`, `daily_minutes`, `daily_new_words`, and interests. Never end onboarding on a dashboard with no completed learning action.

### Daily loop

1. Show one primary action: **Today: 8 reviews + 5 new words, about 7 minutes**.
2. Review due words first.
3. Introduce 3–5 new words from the path.
4. Run a 60-second mixed recall quiz.
5. Show accuracy, weak words, time, and one meaningful reward.
6. Preview tomorrow’s queue and offer a reminder.

### Retention timeline

| Period | Product action | Success signal |
|---|---|---|
| First session | Onboarding + 5-word lesson + first review | First lesson completed |
| Day 1 | Short due review, no feature tour | Review completed |
| Day 3 | Reveal weak-word insight and adjust level | 3 active days / 3 |
| Day 7 | Weekly report with words retained, not only XP | D7 retained |
| Day 14 | Unlock topic path or IELTS pack based on behavior | Second-week active days |
| Day 30 | Monthly memory report, level progress, next milestone | D30 retained |

### Strongest five retention mechanisms

1. Accurate due-word queue with a short completion time.
2. Personalized “Continue learning” path.
3. Mistake/weak-word review with visible improvement.
4. Weekly retained-words report and next-week plan.
5. Gentle reminders plus missed-day recovery/streak freeze.

Use streaks as feedback, not punishment. Give one free recovery after consistent learning; never use fake urgency.

## 8. Design Audit

### Current strengths

- Emerald/ivory/brass has a recognizable Uzbek identity without looking like a souvenir product.
- Shared `premium-card`, `surface-panel`, focus styles, and reduced-motion rules create a solid system.
- The home hero is the strongest page and uses an authentic product-relevant image.
- Light and dark themes now share semantic tokens rather than separate one-off styling.

### Improvements

- Reduce visual effects inside dense operational pages; preserve glass/depth for hierarchy, not every object.
- Use turquoise and deep navy as secondary semantic accents so the system is not entirely emerald.
- Keep warm sand/brass for achievement and IELTS emphasis, not every highlight.
- Standardize page headers, filter bars, empty states, skeletons, and modal sizes.
- Avoid three tiny word cards per row below a true 390 px viewport unless an explicit compact mode is selected.
- Translate learning content, not only navigation labels.
- Replace emoji in premium product surfaces with the existing Lucide system where semantics matter.
- Use animations for state change, card reveal, progress, and navigation; avoid continuous motion that competes with studying.

### Recommended home hierarchy

1. Hero: Uzbek-first vocabulary + one main CTA.
2. Interactive 3-word preview with natural audio.
3. How the daily learning loop works.
4. CEFR paths with live corpus counts.
5. Evidence: SRS, Uzbek explanations, real example.
6. IELTS vocabulary extension.
7. Progress/weekly report preview.
8. Testimonials from real beta users.
9. Transparent Free vs Premium.
10. FAQ and final CTA.

### Recommended dashboard hierarchy

1. Continue today’s plan.
2. Due reviews + estimated minutes.
3. Daily goal progress.
4. Weak words / recent mistakes.
5. Current path and next milestone.
6. Weekly retained-words chart.
7. Secondary links to games, IELTS, community.

Remove AI Tutor from the primary dashboard until it is a reliable, funded product.

## 9. IELTS: Make It An Interactive Vocabulary Extension

The current static IELTS hub is directionally correct and visually coherent, but it is still closer to a guide collection than a learning system. Most content is English-only and there is no completion, save-to-SRS, exercise, or progress model.

### Writing structure

For each essay pack:

1. Prompt and planning questions.
2. Band 7, Band 8, and Band 9 responses for the same prompt.
3. Side-by-side differences: task response, coherence, vocabulary, grammar.
4. Highlighted collocations and reusable sentence structures.
5. Common mistakes and corrected versions.
6. “Save 5 phrases to my cards.”
7. Five-question retrieval quiz.
8. Completion state and revisit date.

Create packs for Task 1 charts/maps/process/tables/mixed and Task 2 opinion/discussion/advantages/problem-solution/double-question. Start with 3 excellent prompts per type, not a large unreviewed library.

### Reading structure

For each question type:

1. Two-minute strategy.
2. Common traps.
3. Worked example.
4. Mini passage.
5. Keyword selection.
6. Synonym/paraphrase matching.
7. Timed 3–5 question drill.
8. Mistake explanation.
9. Save unknown vocabulary.

Build the first interactive trainers around Matching Headings, True/False/Not Given, and synonym matching. These reuse the vocabulary engine and do not require AI.

## 10. Monetization Recommendation

### Free

- Public vocabulary and IELTS previews.
- Core CEFR learning path.
- Daily SRS review.
- Up to 20 new words/day.
- Saved words and one custom deck.
- Core pronunciation.
- Daily goal, streak, XP, and basic weekly summary.
- Limited set of games.

### Premium

- Unlimited custom decks and imports.
- Advanced weak-word/mistake analytics.
- Unlimited topic paths and downloadable packs.
- Offline review packs.
- Annotated IELTS Band 7/8/9 comparisons.
- Advanced synonym/paraphrase trainers.
- Detailed weekly/monthly reports.
- Family seats when management is complete.
- Carefully limited AI add-ons, not “unlimited AI.”

### Pricing

- Keep monthly around 29,000 UZS only after premium value is real.
- Yearly should communicate the effective monthly saving clearly; 199,000 UZS is a reasonable hypothesis, not a validated price.
- Offer a 7-day premium trial after the user completes three learning sessions, not at registration.
- Never paywall due reviews, saved progress, account export, or core pronunciation.
- Show the paywall at a value boundary: advanced report, second custom deck, offline pack, or premium IELTS pack.

## 11. Analytics Plan

Use `object_action` event names, lower snake case, stable properties, and no translated event names.

### Core events

| Event | Key properties | Metric |
|---|---|---|
| `landing_viewed` | locale, source, device | Visitor baseline |
| `signup_started` | locale, source | Signup intent |
| `signup_completed` | method, locale | Signup conversion |
| `onboarding_started` | source | Onboarding start |
| `onboarding_step_completed` | step, value | Step drop-off |
| `onboarding_completed` | level, goal, daily_minutes | Activation |
| `lesson_started` | path, lesson_type, due_count, new_count | Learning starts |
| `word_answered` | mode, rating, is_new, duration_bucket | Learning behavior |
| `lesson_completed` | correct_rate, words, duration, xp | First lesson / completion |
| `word_saved` | source, level, category | Save adoption |
| `review_completed` | due_count, completed, duration | Daily loop |
| `weak_word_practised` | source, lapse_count | Recovery adoption |
| `streak_extended` | streak_length | Retention cue |
| `weekly_report_viewed` | active_days, retained_words | Report adoption |
| `paywall_viewed` | trigger, plan | Monetization funnel |
| `checkout_started` | plan, provider | Checkout conversion |
| `subscription_started` | plan, provider | Paid conversion |
| `subscription_canceled` | plan, reason | Churn |

### Primary metrics

- Activation: signup completed **and** first lesson completed within 24 hours.
- D1/D7/D30 retention: completed at least one learning action on that day/window.
- Learning outcome: reviewed words, mature words, recall rate, lapse recovery.
- Daily loop: users with due words who complete at least 80% of the queue.
- Funnel: landing → signup start → signup complete → onboarding complete → first lesson.
- Monetization: eligible paywall views → checkout starts → successful subscriptions.

Session duration is secondary; longer is not automatically better for a focused learning product.

## 12. Phased Roadmap

### Phase 1: Production blockers

| Task | Priority | Complexity | Owner | Dependency | Impact |
|---|---|---|---|---|---|
| Real email + resend | Critical | M | Backend | Provider/domain | Account trust |
| Cookie-only refresh contract | Critical | M | Full stack | Auth tests | Security |
| Review idempotency | Critical | M | Backend | Migration | SRS correctness |
| Strong secret/proxy config | Critical | S | Backend/DevOps | Deployment | Security |
| Legal, deletion, export | High | M | Full stack | Policy copy | Trust |
| Monitoring + backups | High | M | DevOps | Hosting | Recovery |
| Payment disable/readiness gate | High | S | Full stack | Merchant status | Honest launch |

### Phase 2: MVP launch

| Task | Priority | Complexity | Owner | Dependency | Impact |
|---|---|---|---|---|---|
| Four-step onboarding | High | L | Full stack | Profile migration | Activation |
| Public level preview | High | M | Frontend/API | Public endpoint | Conversion |
| Honest dynamic counts/copy | High | S | Frontend/API | Aggregate endpoint | Trust |
| Error/loading/404 states | High | M | Frontend | Design copy | Reliability |
| Mobile navigation | High | S | Frontend | None | Mobile conversion |
| Core analytics | High | M | Full stack | Provider choice | Measurement |
| Core 3,000 QA gate | High | L | Content/Admin | Review workflow | Learning quality |

### Phase 3: Retention

- Weak-word and mistake-review queue.
- Weekly report.
- Placement test and rules-based learning path.
- Smart reminders and missed-day recovery.
- Dashboard reordering around one daily action.

### Phase 4: IELTS expansion

- Localized Band 7/8/9 comparison packs.
- Save-to-SRS from every IELTS resource.
- Reading synonym/paraphrase trainers.
- Completion state, quizzes, and downloadable vocabulary packs.

### Phase 5: Monetization

- Define/enforce free and premium entitlements.
- Complete Payme/Click staging, concurrency, reconciliation, and refund behavior.
- Launch monthly/yearly only; add family after seat management.
- Trial after demonstrated value, not before activation.

## 13. Thirty-Day Development Plan

### Days 1–7: Trust and correctness

- Email provider and resend verification.
- Remove refresh token from browser JSON.
- Add review idempotency.
- Fix secret and trusted-proxy configuration.
- Disable sandbox/payment UI in production.
- Add localized error/404 states.

### Days 8–14: Activation

- Add onboarding data model and four-step flow.
- Create starter path/deck automatically.
- Build public five-word level preview.
- Replace stale counts and AI claims.
- Fix guest mobile navigation.

### Days 15–21: Measurement and retention

- Add typed analytics events.
- Add weak-word and mistake-review queue.
- Rebuild dashboard around today’s plan.
- Add weekly report v1.

### Days 22–30: Quality and release

- Review the Core 3,000 and top example translations.
- Complete privacy/terms/cookie pages, export, and deletion.
- Add monitoring, backup automation, and restore drill.
- Run responsive/accessibility/performance QA.
- Run a closed beta with 20–50 Uzbek learners before enabling payments.

## 14. Final Answers

### Top 10 issues

1. No production email/recovery.
2. Refresh token exposed in JSON.
3. Non-idempotent SRS reviews.
4. Predictable production secret can pass validation.
5. Payments and premium contract are not launch-ready.
6. No onboarding/first-lesson activation path.
7. Uzbek/Russian learning-content localization gaps.
8. No product analytics.
9. No legal/account deletion/full export.
10. Stale claims, dead mobile pricing link, and unexpected guest auth walls.

### Best 10 next features

1. Guided onboarding.
2. Automatic starter path.
3. Weak-word queue.
4. Mistake review.
5. Weekly retained-words report.
6. Short placement test.
7. Public interactive word preview.
8. IELTS save-to-SRS.
9. Reading synonym/paraphrase trainer.
10. Band 7/8/9 annotated comparison.

### Remove or defer

- `/securify` prototype.
- Live AI speaking coach.
- Unlimited AI positioning.
- More games.
- Multiplayer expansion.
- Social/community expansion.
- TOEFL/SAT/business expansion.
- Family sales until seat management exists.

### Recommended USP

> **Uzbek learners uchun yaratilgan eng aniq vocabulary yo‘li: ona tilidagi tushuntirish, CEFR bo‘yicha tartib va unutishga qarshi aqlli takrorlash.**

### Recommended home headline

> **Inglizcha so‘zlarni yodlamang. Ularni eslab qoling.**

### Recommended subheadline

> **O‘zbek tilidagi aniq izohlar, sizga mos CEFR yo‘li va har kuni 10 daqiqalik aqlli takrorlash bilan so‘z boyligingizni mustahkamlang.**

### Launch decision

**NOT READY for a public paid launch.**

The product is suitable for a small, explicitly labeled free closed beta after the Critical auth/email/SRS/config blockers are fixed. Payments should remain disabled until the entitlement contract, merchant credentials, family functionality, and callback correctness are production-tested.
