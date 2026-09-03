import { ArrowRight, Check, PenLine, Trophy, Wallet } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/lib/locales";

/** The three things a visitor has to see before they will sign up: that the
 *  exam practice is real and free to try, what the AI feedback actually looks
 *  like, and what it costs. Everything here is a fact the product already
 *  ships — the free allowances match services/plans.py, and the price comes
 *  from the live plan list rather than a number typed into the page. */
type ProofCopy = {
  kicker: string;
  mockTitle: string;
  mockBody: string;
  mockCta: string;
  feedbackTitle: string;
  feedbackBody: string;
  feedbackCta: string;
  sampleLabel: string;
  sampleBand: string;
  sampleQuote: string;
  sampleNote: string;
  priceTitle: string;
  priceFrom: string;
  priceMonth: string;
  priceUnknown: string;
  priceCta: string;
  freeTitle: string;
  freeItems: string[];
};

const COPY: Record<Locale, ProofCopy> = {
  uz: {
    kicker: "Ro'yxatdan o'tishdan oldin",
    mockTitle: "To'liq mock imtihon — bepul sinab ko'ring",
    mockBody: "4 ta ko'nikma, real vaqt, bitta umumiy band. Oyiga bitta mock bepul, karta talab qilinmaydi.",
    mockCta: "Mock imtihonni ko'rish",
    feedbackTitle: "Insho ballini emas, sababini ko'rasiz",
    feedbackBody: "Har bir gap tekshiriladi: xato, tuzatish va nega shundayligi. Band 4 ta mezon bo'yicha ajratiladi.",
    feedbackCta: "Writing bo'limi",
    sampleLabel: "Namuna",
    sampleBand: "Band 6.5 · Lexical Resource 6.0",
    sampleQuote: "“The graph shows about the number of cars.”",
    sampleNote: "“shows about” → “shows the number of cars” — “show” dan keyin “about” ishlatilmaydi.",
    priceTitle: "Narx",
    priceFrom: "dan",
    priceMonth: "so'm / oy",
    priceUnknown: "Narxlar sahifasida",
    priceCta: "Barcha rejalar",
    freeTitle: "Bepul rejada nima bor",
    freeItems: [
      "A1–A2 lug'at, cheksiz takrorlash",
      "A1 grammatika kursi",
      "Reading amaliyoti — cheksiz",
      "Oyiga 1 ta to'liq mock",
      "Haftasiga 3 ta AI writing tekshiruvi",
      "5 turdagi so'z o'yinlari",
    ],
  },
  ru: {
    kicker: "До регистрации",
    mockTitle: "Полный пробный экзамен — попробуйте бесплатно",
    mockBody: "4 навыка, реальное время, один общий балл. Один пробный экзамен в месяц бесплатно, карта не нужна.",
    mockCta: "Посмотреть пробный экзамен",
    feedbackTitle: "Вы видите не балл, а причину",
    feedbackBody: "Разбирается каждое предложение: ошибка, исправление и почему. Балл разложен по четырём критериям.",
    feedbackCta: "Раздел Writing",
    sampleLabel: "Пример",
    sampleBand: "Band 6.5 · Lexical Resource 6.0",
    sampleQuote: "“The graph shows about the number of cars.”",
    sampleNote: "“shows about” → “shows the number of cars” — после “show” не ставится “about”.",
    priceTitle: "Цена",
    priceFrom: "от",
    priceMonth: "сум / мес",
    priceUnknown: "На странице тарифов",
    priceCta: "Все тарифы",
    freeTitle: "Что входит в бесплатный план",
    freeItems: [
      "Словарь A1–A2, повторение без лимита",
      "Курс грамматики A1",
      "Практика Reading — без лимита",
      "1 полный пробный экзамен в месяц",
      "3 проверки эссе ИИ в неделю",
      "5 видов словарных игр",
    ],
  },
  en: {
    kicker: "Before you sign up",
    mockTitle: "A full mock exam — try it free",
    mockBody: "Four skills, real timing, one overall band. One mock a month is free, and no card is asked for.",
    mockCta: "See the mock exam",
    feedbackTitle: "You see the reason, not just the band",
    feedbackBody: "Every sentence is checked: the error, the fix, and why. The band is broken down across all four criteria.",
    feedbackCta: "Writing section",
    sampleLabel: "Sample",
    sampleBand: "Band 6.5 · Lexical Resource 6.0",
    sampleQuote: "“The graph shows about the number of cars.”",
    sampleNote: "“shows about” → “shows the number of cars” — “show” is not followed by “about”.",
    priceTitle: "Price",
    priceFrom: "from",
    priceMonth: "so'm / month",
    priceUnknown: "On the pricing page",
    priceCta: "All plans",
    freeTitle: "What the free plan includes",
    freeItems: [
      "A1–A2 vocabulary, unlimited review",
      "The A1 grammar course",
      "Reading practice — unlimited",
      "One full mock exam a month",
      "Three AI writing checks a week",
      "Five vocabulary game types",
    ],
  },
};

export function ProofBand({ lang, priceSom }: { lang: Locale; priceSom: number | null }) {
  const copy = COPY[lang];
  const price = priceSom === null ? null : new Intl.NumberFormat(lang).format(priceSom);

  return (
    <section className="mx-auto mt-5 max-w-370" aria-labelledby="proof-title">
      <div className="surface-panel rounded-[22px] p-5 sm:p-7">
        <p className="print-label inline-flex border-accent-500 bg-accent-400/12 text-accent-700 dark:text-accent-300">
          {copy.kicker}
        </p>
        <h2 id="proof-title" className="sr-only">
          {copy.kicker}
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* 1 — the exam practice, which is the reason most visitors came. */}
          <Link
            href={`/${lang}/ielts/mock`}
            className="group flex flex-col gap-3 rounded-[16px] border border-line bg-card p-5 transition-transform hover:-translate-y-1"
          >
            <span className="icon-tile size-11 rounded-lg">
              <Trophy className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            </span>
            <h3 className="font-display text-2xl leading-tight tracking-wide text-ink">{copy.mockTitle}</h3>
            <p className="text-[0.9375rem] leading-7 text-ink-soft">{copy.mockBody}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-black text-brand-700 dark:text-brand-200">
              {copy.mockCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>

          {/* 2 — the feedback, shown rather than described. Marked as a
              sample so it is never mistaken for the visitor's own result. */}
          <Link
            href={`/${lang}/ielts/writing`}
            className="group flex flex-col gap-3 rounded-[16px] border border-line bg-card p-5 transition-transform hover:-translate-y-1"
          >
            <span className="icon-tile size-11 rounded-lg">
              <PenLine className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            </span>
            <h3 className="font-display text-2xl leading-tight tracking-wide text-ink">{copy.feedbackTitle}</h3>
            <p className="text-[0.9375rem] leading-7 text-ink-soft">{copy.feedbackBody}</p>

            <figure className="mt-1 rounded-[12px] border border-line bg-page/60 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <figcaption className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-line px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-ink-soft">
                  {copy.sampleLabel}
                </span>
                <span className="text-xs font-black tabular-nums text-brand-700 dark:text-brand-200">
                  {copy.sampleBand}
                </span>
              </figcaption>
              <blockquote className="mt-2.5 text-[0.8125rem] italic leading-6 text-ink-soft">
                {copy.sampleQuote}
              </blockquote>
              <p className="mt-2 text-[0.8125rem] leading-6 text-ink">{copy.sampleNote}</p>
            </figure>

            <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-black text-brand-700 dark:text-brand-200">
              {copy.feedbackCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>

          {/* 3 — the price, and exactly what costs nothing. */}
          <div className="flex flex-col gap-3 rounded-[16px] border border-line bg-card p-5">
            <span className="icon-tile size-11 rounded-lg">
              <Wallet className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-ink-soft">{copy.priceTitle}</p>
              {price ? (
                <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
                  <span className="text-sm font-bold text-ink-soft">{copy.priceFrom}</span>
                  <span className="font-display text-4xl leading-none tracking-wide tabular-nums text-ink">{price}</span>
                  <span className="text-sm font-bold text-ink-soft">{copy.priceMonth}</span>
                </p>
              ) : (
                <p className="mt-1 text-sm font-bold text-ink-soft">{copy.priceUnknown}</p>
              )}
            </div>

            <p className="text-xs font-black uppercase tracking-wide text-ink-soft">{copy.freeTitle}</p>
            <ul className="flex flex-col gap-2">
              {copy.freeItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[0.875rem] leading-6 text-ink">
                  <Check className="mt-1 size-3.5 shrink-0 text-success-text" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/${lang}/pricing`}
              className="group mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-black text-brand-700 dark:text-brand-200"
            >
              {copy.priceCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
