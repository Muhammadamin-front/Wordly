# Words.uz — Phase 2: Product Specification

## Mission

**Har bir o'zbek uchun ingliz tili.** Give every Uzbek learner — from a Ferghana schoolkid to a Tashkent IELTS candidate — a world-class path to English vocabulary mastery, in their own language, at a price they can actually pay.

## Vision

Become the default English-learning platform of Central Asia: the app every Uzbek student opens daily, every English teacher assigns homework in, and every parent trusts — then expand the same playbook to Kazakh, Kyrgyz, and Tajik learners.

## Product one-liner

> **Duolingo's fun + Anki's science + Quizlet's simplicity — built for Uzbekistan.**

---

## Target audience

**Primary (launch):**
1. IELTS/CEFR exam candidates, 16–28, Tashkent + regional cities
2. School pupils (grades 5–11) and their English teachers
3. University students & young professionals aiming at IT/outsourcing jobs

**Secondary (year 2):** parents learning alongside kids, corporate upskilling, Russian-speaking residents, diaspora.

## User personas

### 1. Dilnoza, 19 — "The IELTS Fighter"
Second-year student in Samarkand. Needs IELTS 6.5 for a scholarship. Pays 800K so'm/mo for a private course; her weakest area is vocabulary and listening. Phone: mid-range Android, pays via Click. **Needs:** IELTS-band word lists, honest progress tracking, listening drills, works on bad 4G. **Buys premium if** it's under the price of two cups of coffee and clearly maps to band score.

### 2. Jasur, 15 — "The Gamer Pupil"
9th-grader in Tashkent. Motivated by leagues, friends, and not being bored. Has tried Duolingo (quit at the plateau, and it has no Uzbek). **Needs:** games, leaderboard with classmates, streaks that don't punish him for a family wedding weekend. **Converts via** parent-paid family plan.

### 3. Malika opa, 34 — "The Teacher"
English teacher, 4 classes of 30 pupils. Uses paper tests and a Telegram group. **Needs:** assign word lists as homework, see who actually studied, ready-made CEFR content. She is our **distribution channel** — one teacher brings 120 students. Teacher tools are free; her school buys the School Plan.

### 4. Bekzod, 26 — "The Switcher"
Junior developer, B1, wants B2+ for a remote job. Power user; has an abandoned Anki deck. **Needs:** Anki/Quizlet import, keyboard shortcuts, real SRS with visible stats, API-of-his-own-data (export). **Buys yearly premium** without blinking if the product respects his intelligence.

---

## Monetization (so'm-priced, local rails: Payme / Click / Uzum / cards)

| Plan | Price (so'm) | ~USD | What's included |
|---|---|---|---|
| **Free — forever** | 0 | 0 | Core loop: full A1–C2 word browsing, SRS reviews (unlimited), 3 games, 1 custom deck, 5 AI actions/day, streaks, leagues. *Publicly promised never to shrink.* |
| **Premium Monthly** | 29,000 | ~$2.3 | Everything: all games, unlimited decks/AI tutor, offline mode, advanced stats, no ads |
| **Premium Yearly** | 199,000 | ~$16 | Same, ~43% off — the default purchase |
| **Family (6 seats)** | 349,000/yr | ~$28 | Culturally strong fit; parent dashboard |
| **School Plan** | per-classroom licensing | — | Teacher panel, homework, class analytics; sold B2B via districts & private learning centers |
| **University / Corporate** | custom | — | SSO, cohort analytics, IELTS-track reporting |
| **AI Credits** | top-ups | — | For heavy AI-tutor users beyond plan quotas |
| **Referral** | — | — | Give 1 month Premium, get 1 month, on referee's first study week (not signup — anti-fraud) |

Ads: none in study flow ever; at most one interstitial promo of our own premium after sessions on free tier.

## Competitive advantages (defensible, in order)

1. **Uzbek-native learning content** — definitions, mnemonics, and error notes written *for* Uzbek speakers (articles, /θ/–/s/, false friends via Russian) — not translated UI strings. Expensive to copy, invisible to global players.
2. **Local payments + local price** — Payme/Click/Uzum integration and so'm pricing at 1/5 of Western apps.
3. **Teacher distribution** — free teacher panel turns every English teacher into an acquisition channel; homework loops make churn structural­ly low.
4. **Honest SRS + production-mode learning** — FSRS/SM-2 scheduling with recall-and-produce exercises, fixing Duolingo's recognition trap and Anki's UX trap simultaneously.
5. **Trust as a feature** — free-tier promise, permanent community decks, one-tap export. Every competitor above broke one of these; we market that we won't.

## Brand identity

- **Name:** Words.uz (domain = brand; ".uz" is the localization promise)
- **Personality:** warm, encouraging teacher — not a pushy owl. Rewards effort, never shames absence.
- **Mascot:** **Zukko** — a snow leopard cub (Uzbekistan's iconic native animal; "zukko" = sharp-witted in Uzbek). Appears in celebrations, empty states, and streak saves — not in guilt-trip notifications.
- **Visual language:** premium-minimal; deep indigo + warm sand + accent turquoise (Registan tilework palette, modernized); glassmorphism sparingly on stats/overlays; Suzani-inspired geometric patterns as subtle texture. Full light/dark themes.
- **Type:** Latin-script friendly geometric sans (e.g. Manrope/Inter) with full O'zbek lotin diacritics support (oʻ, gʻ).
- **Languages:** UI in O'zbekcha (default), Русский, English.
- **Voice example:** ❌ "You lost your streak!" → ✅ "3 kunlik ta'tilmi? Bir mashq — va 47 kunlik seriyangiz qaytadi." ("Took 3 days off? One review session brings your 47-day streak back.")

## Site structure (every page, grouped by app area)

**Public:** Landing · Features · Pricing · About · FAQ · Contact · Blog/SEO word pages (`/words/serendipity`) · Legal (Privacy/Terms/Offer)
**Auth:** Login · Register · Forgot/Reset password · Email verify · OAuth (Google, Apple)
**Learn (core):** Dashboard (today's plan) · Review session (SRS flashcards) · Learn new words · Vocabulary browser (CEFR levels A1–C2, categories, search) · Word detail page · Collections/Folders/Decks (incl. custom decks, favorites, tags) · Grammar · Listening · Reading · Writing · Speaking
**Play:** Games hub + 19 games (Word Match, Memory, Word Search, Crossword, Hangman, Typing Race, Speed Quiz, Image Guess, Audio Guess, Fill Blank, Sentence Builder, Spelling Bee, Drag&Drop, Word Connect, Word Puzzle, Find Mistake, Rapid Fire, Boss Battle, Multiplayer Quiz) · Challenges · Daily goal & streak page
**AI:** AI Tutor · AI Chat (conversation practice) · Writing correction · Pronunciation feedback
**Social:** Leaderboard/Leagues · Friends · Achievements/Badges · Profile (public) · Referral
**Me:** Statistics (heatmap, retention, accuracy, forgotten/mastered words, time, weak categories) · Settings (account, notifications, study prefs, appearance, language) · Premium/Billing
**B2B/Admin:** Teacher panel (classes, assignments, class analytics) · Admin panel (vocabulary CMS, CSV import, community-content moderation, users, revenue/subscription analytics, bug reports, feature requests)

Detailed page-by-page UX specs are produced per milestone (see `03-roadmap.md`), not up front — designs must respond to what we learn shipping.

## Success metrics (North stars)

- **Activation:** % of signups completing first review session same day (target 60%+)
- **Core:** weekly reviewing learners; D30 retention (target 20%+, category norm ~8–12%)
- **Learning honesty metric:** 30-day word retention rate measured by SRS history (publish it — nobody else dares)
- **Revenue:** free→paid conversion (target 4–6% with local pricing), school seats

## Future roadmap (product horizon)

- **Year 1:** vocabulary mastery platform (this spec), web-first PWA, A1–B2 human-curated corpus, teacher panel, IELTS vocabulary tracks
- **Year 2:** native mobile apps, speaking/writing AI band-scoring, C1–C2 corpus completion, marketplace for teacher-made decks (rev-share), Kazakh & Kyrgyz L1 expansion
- **Year 3:** full four-skills IELTS prep suite, offline-first regions push, corporate/gov partnerships (Ministry of Preschool & School Education pilot)
