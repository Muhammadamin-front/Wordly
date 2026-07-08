# Words.uz — Phase 1: Market Research

*Compiled July 2026. Sources: live web research (App Store/Trustpilot/Reddit-sourced review roundups, EF EPI 2025, Uzbekistan fintech/edtech market reports) + team domain knowledge.*

---

## 1. The Market: Uzbekistan

### Why this market, why now

| Signal | Data |
|---|---|
| English proficiency | **104th of 123** countries, EF EPI 2025 (score 429, "very low"; falling since 2018: 86 → 95 → 98 → 104). The problem is getting *worse*, not better. |
| Skill breakdown | Reading 420, Listening 385 (both "very low") — Uzbek learners' weakest skills are exactly the ones vocabulary apps train. |
| Population | ~37M, median age ~29. One of the youngest populations in the region. |
| Mobile-first | **89% of internet users access the web via smartphone.** 4G covers 92% of the country; 5G rolling out in Tashkent. Desktop is an afterthought — mobile-web-first is mandatory. |
| Payments | Local rails dominate: **Click (12M+ users), Payme (8M+), Uzum**. Visa/Mastercard penetration is low; Stripe unavailable. **Any product monetizing here MUST integrate Payme/Click.** No global competitor does. |
| Demand drivers | IELTS is a gateway to jobs, presidential scholarships (El-Yurt Umidi), study abroad, and IT outsourcing careers. Private English courses in Tashkent cost 400K–1.5M so'm/month (~$30–120) — a huge willingness-to-pay signal relative to app pricing. |
| EdTech ecosystem | Uzbekistan ranks #47 globally for edtech startups; the ecosystem is young and underfunded (top 3 edtech startups raised <$600K combined). **No dominant local vocabulary/English platform exists.** |

### The core insight

Every global competitor treats Uzbek as a non-language. Duolingo has no Uzbek interface. Quizlet, Memrise, Drops — none support Uzbek as a base language. Uzbek learners are forced to learn English *through Russian*, adding a second foreign language as an obstacle. Meanwhile they pay for content priced in USD via cards most don't have.

**The gap: a serious, mobile-first, Uzbek-native (with Russian as secondary L1) English vocabulary platform, priced in so'm, paid via Payme/Click, aligned to IELTS/CEFR — with world-class SRS and Duolingo-grade engagement.**

---

## 2. Competitor Deep-Dive

### 2.1 Quizlet
- **Model:** Freemium, Quizlet Plus $35.99/yr. ~60M MAU.
- **Strengths:** Fastest onboarding in the category ("studying in 60 seconds"), enormous UGC library, teachers embedded in schools, clean multi-mode study (Learn/Test/Match).
- **Weaknesses / complaints:** Aug 2022: locked Learn & Test modes behind paywall → mass backlash, "boycott Quizlet" campaigns, **Trustpilot 1.4/5**. Removed the beloved Gravity game. No true SRS — "Learn" is adaptive but not long-term scheduling. Ads aggressive on free tier. AI features (Q-Chat) feel bolted on.
- **Lesson:** Never paywall a feature users already had for free. Goodwill is an asset; Quizlet burned theirs and spawned Knowt's 4M users.

### 2.2 Anki
- **Model:** Free/open-source desktop + web; $24.99 one-time iOS app funds development.
- **Strengths:** Gold-standard SRS (SM-2, now FSRS), infinitely customizable, massive shared-deck ecosystem, trusted by med students; card scheduling research-backed.
- **Weaknesses / complaints:** **Most users quit within two weeks.** UI is dated and hostile; deck setup, note types, and interval settings overwhelm beginners; card creation is slow; zero gamification; no built-in content — you bring your own; sync/UX inconsistencies across platforms.
- **Lesson:** The algorithm is a solved problem (SM-2/FSRS are public). The unsolved problem is *wrapping the algorithm in an experience normal humans don't abandon.* This is the single biggest opportunity in the category.

### 2.3 Memrise
- **Model:** Freemium, Pro ~$8.49/mo. Pivoted to video-of-native-speakers + AI chatbot ("Membot").
- **Strengths:** Native-speaker video clips (excellent for listening), mems (mnemonic images), decent SRS.
- **Weaknesses / complaints:** **Killed community courses (2024)** — exiled to a separate site, breaking years of user-curated content; forum shut down; Trustpilot flooded with "they deleted my years of work." AI chatbot reviewed as repetitive and level-mismatched. Feature churn destroyed trust.
- **Lesson:** Community content is a moat only if you honor it forever. Also: AI conversation must adapt to learner level or it reads as a gimmick.

### 2.4 Duolingo
- **Model:** Freemium + Super ($12.99/mo) + Max (AI tier, ~$30/mo). 100M+ MAU, ~$1B revenue.
- **Strengths:** Best-in-class gamification (streaks, leagues, quests), habit formation, brand/mascot marketing genius, A/B testing machine, free tier genuinely usable.
- **Weaknesses / complaints:** **Intermediate plateau** — courses teach ~2,000–2,500 words when B2 needs 8,000+ receptive; recognition-over-recall (word banks are a crutch — learners freeze in real conversation); streak mechanics create *anxiety* (documented users deleting the app over streak stress); hearts system punishes mistakes → discourages practice; **April 2025 "AI-first" announcement backlash** — contractors cut, 400K TikTok followers lost, brand trust damaged (revenue survived, trust didn't). No Uzbek interface.
- **Lesson:** Gamification works but must be *pro-learning* (reward effort, never punish mistakes). "AI replaces humans" is brand poison — frame AI as a tutor multiplier, keep human teachers visibly in the loop.

### 2.5 Mochi Cards
- **Model:** Freemium, $5/mo Pro. Indie.
- **Strengths:** Beautiful minimalist markdown-based cards; the "Anki without the pain" positioning; clean SRS.
- **Weaknesses:** No content library, no gamification, no mobile-web polish, niche audience of productivity nerds; single-developer risk.
- **Lesson:** Proof that "modern, calm Anki" has demand. But minimalism alone doesn't reach mainstream learners.

### 2.6 Knowt
- **Model:** Free-first (the anti-Quizlet), premium for AI limits. 4M+ users, grew almost entirely on Quizlet refugees.
- **Strengths:** Free Learn/Test/spaced-repetition (exactly what Quizlet paywalled); AI note→flashcard generation; Quizlet import in one click.
- **Weaknesses / complaints:** AI generates wrong cards; data-loss incidents after updates; shallow for deep mastery; rough edges of a young product.
- **Lesson:** A generous free tier is a growth weapon. Import-from-competitor is a killer acquisition feature — **we must build Quizlet/Anki import.** But AI-generated content needs human/teacher review or it erodes trust.

### 2.7 Brainscape
- **Model:** Freemium, Pro ~$9.99/mo; certified content marketplace.
- **Strengths:** Confidence-based repetition (self-rate 1–5) is a good simplification of SRS; strong exam-prep verticals.
- **Weaknesses:** Language content reviewed as shallow ("all the vocabulary in the world won't help if you can't use it"); dated UI; no desktop card-creation delight; learning curve for its own conventions.
- **Lesson:** Self-rated confidence (Again/Hard/Good/Easy) is intuitive; keep it. Pure flashcards without usage practice caps out — pair cards with production exercises.

### 2.8 Vocabulary.com
- **Model:** Freemium + school licenses.
- **Strengths:** The best dictionary-definition *writing* in the business (witty, memorable definitions); adaptive question engine; huge question bank.
- **Weaknesses:** English-only explanations (useless for low-level L2 learners); US-school-centric; dated design; weak mobile experience; no real SRS visibility.
- **Lesson:** Definition *quality* is a differentiator — invest in human-written, learner-appropriate definitions in Uzbek/Russian, not dictionary dumps.

### 2.9 WordUp
- **Model:** Freemium, one-time/lifetime offers. The closest analog to our product.
- **Strengths:** "Knowledge map" — ranks 25K words by real-world usage frequency and finds your personal frontier; examples from movies/news/quotes; AI celebrity chat; spaced repetition.
- **Weaknesses / complaints:** Crashes/white-screens after updates; subscribers losing access to paid content; no grammar/sentence-structure instruction; small free tier.
- **Lesson:** Frequency-ranked personal word frontier is the right content model — we adopt it (word frequency + CEFR + IELTS lists). Engineering reliability is table stakes; broken updates cost paying users.

### 2.10 Drops
- **Model:** Freemium, 5-min/day free limit; Premium removes limit.
- **Strengths:** Gorgeous visual design (best-in-class illustrations), relaxing UX, drag-based interactions, good for absolute beginners.
- **Weaknesses:** Deliberately shallow — no context, no grammar, no sentences, no conversation; 5-minute cap frustrates motivated learners; same 15 words drilled repeatedly; can't reach fluency with it.
- **Lesson:** Visual polish drives downloads and word-of-mouth. But depth must exist underneath, or retention decays once novelty fades.

### 2.11 StudySmarter (now Vaia)
- **Model:** Freemium, school/university content.
- **Strengths:** All-in-one study (notes+flashcards+textbooks); strong in DACH market — proof that a *regional* player with localized content beats global generalists at home.
- **Weaknesses:** Bloated all-in-one UX; flashcards not the core competency; ads on free tier.
- **Lesson:** Regional localization wins regional markets. That's our entire thesis.

---

## 3. Synthesis: The Complaint Map → Our Answers

| Recurring complaint (across apps) | Words.uz answer |
|---|---|
| "Features I had were paywalled" (Quizlet) | Core loop (learn, SRS review, basic games, one AI action/day) **free forever** — written into the pricing page as a public promise. |
| "Too complicated to start" (Anki) | Zero-setup onboarding: pick level (or take 3-min placement test) → first review session within 60 seconds. SRS runs invisibly; power settings exist but are opt-in. |
| "I plateau at intermediate" (Duolingo) | Full A1→C2 ladder, 10,000+ word corpus ranked by frequency, IELTS band-targeted tracks, production-mode exercises (typing/speaking) not just recognition. |
| "Recognition, not recall" (Duolingo) | Default review escalates: recognize → recall (type it) → produce (use in sentence) → hear it. Mastery % is per-word and honest. |
| "Streaks give me anxiety" (Duolingo) | Streak freezes earned (not only bought), "weekend shield," streak repair via a review session — streaks reward consistency, never punish life. |
| "They deleted community content" (Memrise) | Community decks are permanent; export (CSV/Anki) always available. Your data is yours. |
| "AI content is wrong/generic" (Knowt, Memrise) | Core A1–C2 corpus is human-curated by CELTA-qualified teachers; AI generates *supplementary* material clearly labeled, with report-a-mistake one tap away. |
| "No Uzbek support" (everyone) | Uzbek-first UI (Latin script), Uzbek + Russian translations on every word, definitions written for Uzbek learner pain points (e.g. articles, /θ/ sounds, false friends via Russian). |
| "Can't pay" (everyone) | Payme, Click, Uzum + cards. Priced in so'm at local purchasing power (~29,000 so'm/mo ≈ $2.30, vs $13 Duolingo Super). |
| "App broke after update / lost my data" (WordUp, Knowt) | Boring reliability engineering: migrations tested, review history append-only, offline queue, staged rollouts. |
| "Shallow, no context" (Drops, Brainscape) | Every word ships with examples, collocations, IPA+audio, dialogue, mini-story, common mistakes — depth is the content spec, not an add-on. |

## 4. Competitive positioning

```
            Serious learning outcomes
                      ▲
                      │      Anki ●            ★ Words.uz
                      │              WordUp ●   (target)
                      │   Brainscape ●
   Global/generic ◄───┼──────────────────────► Localized for Uzbekistan
                      │   Quizlet ●
                      │        Memrise ●
                      │   Drops ●  Duolingo ●
                      ▼
              Casual entertainment
```

Nobody occupies the top-right quadrant. The global players can't justify Uzbek localization economics; local players lack product depth. That quadrant is ours.

## 5. Threats & honest risks

1. **Duolingo adds Uzbek base language.** Mitigation: they've had 12 years to do it; our moat is IELTS-focused depth + local payments + teacher network, not just UI language.
2. **Low willingness to pay for apps.** Mitigation: price at 2–5% of offline course cost; school/teacher B2B channel; family plans (culturally strong fit).
3. **Content cost.** 10K words × full spec is expensive. Mitigation: milestone content strategy — A1–B1 human-curated first (≈3,000 words covers 80% of usage), AI-drafted + teacher-reviewed for the rest.
4. **Piracy/sharing of accounts.** Mitigation: value lives in personal SRS history, which can't be shared.

## Sources

- [Uzbekistan EF EPI 2025 — yep.uz](https://yep.uz/en/2025/11/english-level-uzbekistan-ef-epi-2025/) · [UzDaily](https://www.uzdaily.uz/en/uzbekistan-ranks-104th-in-2025-ef-epi-global-english-proficiency-index/) · [EF EPI fact sheet (PDF)](https://www.ef.com/assetscdn/WIBIwq6RdJvcD9bc8RMd/cefcom-epi-site/fact-sheets/2025/ef-epi-fact-sheet-uzbekistan-english.pdf)
- [Uzbekistan digital market stats — 101digital.uz](https://101digital.uz/en/blog/uzbekistan-digital-marketing-report-2026/) · [Payments deep dive — Sam Boboev](https://samboboev.medium.com/deep-dive-payments-in-uzbekistan-f07981902911) · [Startup ecosystem 2025](https://www.elpislabs.com/post/uzbekistan-s-startup-ecosystem-in-2025-a-funding-revolution-underway)
- Quizlet backlash: [NT Daily op-ed](https://www.ntdaily.com/opinion/quizlet-s-paywalls-place-priority-on-profits-over-pupils/article_848d54c6-4eca-11ef-b6bd-bba8eff900d3.html) · [MintDeck summary](https://www.mintdeck.app/blog/quizlet-paywall-free-alternative) · [Quizlet Plus review](https://www.myengineeringbuddy.com/blog/quizlet-reviews-alternatives-pricing-offerings/)
- Anki abandonment: [Tactyqal analysis](https://tactyqal.com/blog/why-anki-failed-an-entrepreneurs-perspective/) · [Anki alternatives roundups](https://www.studley.ai/blog/anki-alternatives)
- Memrise community courses: [official blog](https://www.memrise.com/blog/changes-to-the-memrise-app) · [Language Hobo](https://languagehobo.com/reviews/memrise-community-courses-how-to-keep-learning-despite-the-app-changes/) · [Trustpilot](https://www.trustpilot.com/review/www.memrise.com?page=2)
- Duolingo plateau & AI backlash: [Clozemaster analysis](https://www.clozemaster.com/blog/duolingo-intermediate-english/) · [Fortune](https://fortune.com/2025/06/09/duolingo-ceo-surprised-backlash-ai-first-company-announcement/) · [TechCrunch](https://techcrunch.com/2025/08/07/the-backlash-against-duolingo-going-ai-first-didnt-even-matter/)
- Drops limitations: [FluentU review](https://www.fluentu.com/blog/reviews/drops-language-app/) · [All Language Resources](https://www.alllanguageresources.com/language-drops-app/)
- WordUp complaints: [JustUseApp reviews](https://justuseapp.com/en/app/1365078730/wordup-vocabulary-of-english/reviews) · [Educational App Store](https://www.educationalappstore.com/app/wordup-vocabulary-builder)
- Knowt/Brainscape: [Unstar comparison](https://unstar.app/blog/quizlet-anki-brainscape-knowt-studysmarter-flashcard-study-apps-ranked-2026) · [FluentU Brainscape review](https://www.fluentu.com/blog/reviews/brainscape/)
