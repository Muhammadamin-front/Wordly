# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are Uzbek learners of English who need a practical, motivating way to build vocabulary every day. The launch audience includes IELTS and CEFR candidates, school pupils, university students, young professionals, and teachers who assign vocabulary practice.

Secondary audiences include Russian-speaking learners in Uzbekistan, parents supporting students, school or private-course cohorts, and future Central Asian language markets.

## Product Purpose

Vocora helps learners master English vocabulary through guided CEFR levels, Uzbek-native explanations, examples, pronunciation, spaced repetition, flashcards, and games. The core promise is simple: pick the right level, learn a small number of useful words, review them at the right time, see honest progress, and return tomorrow.

IELTS, grammar, reading, listening, writing, speaking, and community features support vocabulary learning. They should not replace the main product identity.

## Positioning

Vocora combines Duolingo's motivation, Anki's spaced-repetition discipline, and Quizlet's simplicity for Uzbek learners. Its defensible difference is Uzbek-first learning content, local pricing and payment rails, CEFR/IELTS vocabulary paths, and a warm teacher-like tone that rewards effort without shame.

## Operating Context

The product is a web-first learning platform with Uzbek as the default UI language and English/Russian localization. Learners use it on mobile and desktop, often in short daily sessions and sometimes on weak connectivity. Teachers may use it to assign word lists and track class progress.

Production is deployed under the Vocora brand on the vocora.uz domain through a Cloudflare-connected Ubuntu server. The repository contains a Next.js web app, FastAPI API, PostgreSQL/Redis Docker setup, CI, local payment adapters, SRS, gamification, games, IELTS resources, teacher tools, and admin tooling.

## Capabilities and Constraints

Confirmed capabilities include localized auth, onboarding level placement, CEFR vocabulary library, word detail cards, custom decks, SRS reviews, mastery mapping, grammar lessons, IELTS resource hub, games, statistics, gamification, teacher/admin tools, local payments, and Docker-based production parity.

The current product direction avoids expensive AI-dependent IELTS speaking or writing correction as a core requirement. Educational static content, curated examples, expression libraries, and vocabulary-focused learning should remain the reliable foundation.

Open decisions: native mobile apps, full AI band scoring, offline-first behavior, marketplace content, and broader Central Asian localization are future roadmap items rather than current launch requirements.

## Brand Commitments

Current product name: Vocora.

Voice: warm, encouraging, practical, and teacher-like. The product should motivate without guilt, explain clearly in Uzbek, and keep learning honest.

Visual commitments already established in the app: premium education platform, deep emerald and ivory base, refined light and dark themes, restrained cultural texture, modern typography, responsive mobile-first UI, production-quality imagery, and polished interaction states.

Design work must preserve the vocabulary-first identity. IELTS is a supporting hub, not the product's center of gravity.

## Evidence on Hand

Repository README describes Vocora as "Duolingo's fun + Anki's science + Quizlet's simplicity — built for Uzbekistan." The web app dictionary confirms the Vocora brand, Uzbek default copy, auth flows, onboarding, CEFR levels, IELTS hub, and navigation structure.

Product specification in `docs/02-product-spec.md` documents the original mission for Uzbek learners, local pricing, CEFR/IELTS learning paths, teacher distribution, SRS, games, and trust principles. Product audit in `docs/PRODUCT_AUDIT_2026-07-31.md` confirms the vocabulary-first launch recommendation and current technical evidence.

Existing visual implementation lives in `apps/web`, with shared site components, Tailwind v4 globals, localized dictionaries, auth screens, landing page, learning flows, and game surfaces.

## Product Principles

1. Vocabulary mastery comes first; every extra feature should help learners acquire, recall, or use words better.
2. Uzbek-native explanation is a product advantage, not a translation afterthought.
3. Daily learning should feel achievable, honest, and encouraging rather than punitive.
4. Premium design should make the product feel trustworthy and modern without turning operational screens into marketing pages.
5. Launch-critical learning loops and production trust matter more than adding broad feature surface area.

## Accessibility & Inclusion

The platform must work well across desktop and mobile, support Uzbek Latin text clearly, preserve readable contrast in light and dark modes, respect reduced-motion preferences, and keep touch targets and keyboard/focus behavior usable for real learners.
