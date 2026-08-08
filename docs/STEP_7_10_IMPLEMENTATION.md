# Steps 7-10 Implementation Notes

## Step 7: IELTS Vocabulary Hub

- IELTS remains a supporting hub for vocabulary learning, not the core product.
- Speaking and Writing pages use static high-value resources instead of requiring AI scoring.
- IELTS resource pages now guide learners through a simple loop:
  - study the upgraded phrase in context;
  - find matching IELTS cards;
  - use the phrase in writing or speaking and review it tomorrow.
- Reading and listening practice can still use the built-in bank because it is finite, server-graded, and does not require expensive AI generation.

## Step 8: Honest Conversion

- Free plan keeps the core learning loop: CEFR library, SRS reviews, starter path, and core games.
- Premium is positioned as added depth: detailed statistics, all games, advanced review modes, and priority IELTS packs.
- Payment CTAs depend on backend billing status. If Payme/Click is not configured, the UI explains that clearly.
- Family plan stays disabled until seat management is ready.
- No fake urgency, forced upgrade, or hidden paywall should be added before launch.

## Step 9: Analytics Contract

Client events are typed in `apps/web/lib/analytics.ts` and currently push to `window.dataLayer`.
This keeps the app vendor-neutral until a production analytics provider is selected.

Core events added:

- `page_viewed`
- `ielts_skill_opened`
- `ielts_resource_opened`
- `pricing_viewed`
- `premium_plan_selected`
- `checkout_started`
- `sandbox_premium_started`

Next analytics events to add during beta:

- `onboarding_started`
- `onboarding_completed`
- `lesson_started`
- `lesson_completed`
- `review_completed`
- `word_saved`
- `mistake_review_completed`
- `mastery_level_opened`
- `subscription_started`

## Step 10: Launch Roadmap

Production blockers:

- Verify email provider on the real domain.
- Confirm refresh cookies work behind Cloudflare and Ubuntu reverse proxy.
- Keep `.env`, virtual environments, database dumps, and server-only files out of Git.
- Confirm database backup and restore flow.
- Confirm Payme/Click production keys before enabling checkout.

MVP launch:

- Keep onboarding and placement test visible for new users.
- Keep dashboard focused on one main daily action.
- QA the Core 3,000 words and most-used examples.
- Track activation: signup, onboarding completion, first lesson completion, first review completion.

Retention:

- Expand weak-word and mistake-review queues.
- Add weekly retained-words report.
- Add missed-day recovery and smart reminders.
- Use mastery map to show long-term CEFR progress.

IELTS expansion:

- Add more localized Band 7/8/9 comparison packs.
- Add save-to-SRS from every IELTS resource item.
- Add reading synonym and paraphrase trainers.
- Add downloadable vocabulary packs after content QA.

Monetization:

- Launch monthly and yearly plans first.
- Keep family plan behind a readiness flag until seat management is complete.
- Offer trial after the user has completed the first learning session, not before activation.
