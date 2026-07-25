import Link from "next/link";
import {
  BookOpenCheck,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  Gamepad2,
  Languages,
  Mic2,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/site/reveal";
import { HeroCta } from "@/components/site/hero-cta";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { landing, nav, common } = dict;

  const visualCopy = landingVisualCopy[lang as Locale];

  const features: {
    icon: LucideIcon;
    title: string;
    body: string;
    tone: string;
  }[] = [
    {
      icon: BrainCircuit,
      title: landing.feature1Title,
      body: landing.feature1Body,
      tone: "bg-brand-600/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-200",
    },
    {
      icon: Languages,
      title: landing.feature2Title,
      body: landing.feature2Body,
      tone: "bg-accent-500/12 text-accent-600 dark:bg-accent-400/15 dark:text-accent-300",
    },
    {
      icon: Target,
      title: landing.feature3Title,
      body: landing.feature3Body,
      tone: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300",
    },
    {
      icon: Gamepad2,
      title: landing.feature4Title,
      body: landing.feature4Body,
      tone: "bg-amber-500/14 text-amber-700 dark:bg-amber-300/15 dark:text-amber-200",
    },
  ];

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={nav} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(90deg,rgba(79,86,211,0.18),rgba(20,184,166,0.13),rgba(244,114,182,0.11))]" />
            <div className="absolute left-1/2 top-6 h-[560px] w-[960px] -translate-x-1/2 rounded-[48px] bg-[radial-gradient(circle_at_22%_20%,rgba(45,212,191,0.25),transparent_34%),radial-gradient(circle_at_76%_10%,rgba(244,114,182,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0))] blur-2xl dark:bg-[radial-gradient(circle_at_22%_20%,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_76%_10%,rgba(244,114,182,0.11),transparent_30%),linear-gradient(135deg,rgba(79,86,211,0.16),rgba(12,13,28,0))]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(31,31,78,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(31,31,78,0.045)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60 dark:opacity-20" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-6 pt-10 sm:px-6 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[1fr_0.86fr] lg:pb-12 lg:pt-12">
            <div className="max-w-3xl text-center lg:text-left">
              <Reveal>
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3 py-1.5 text-xs font-bold uppercase text-brand-600 shadow-sm shadow-brand-950/5 dark:text-brand-200 lg:mx-0">
                  <Sparkles className="size-4 text-accent-500" aria-hidden />
                  {visualCopy.eyebrow}
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 text-balance text-4xl font-extrabold leading-tight text-ink sm:text-6xl lg:text-7xl">
                  {landing.heroTitle}
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0">
                  {landing.heroSubtitle}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <HeroCta
                    lang={lang}
                    guestLabel={landing.heroCta}
                    userLabel={landing.heroCtaContinue}
                  />
                  <Link href={`/${lang}#features`}>
                    <Button size="lg" variant="secondary">
                      {landing.heroSecondary}
                    </Button>
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.24}>
                <dl className="mt-10 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-card/70 p-2 shadow-sm shadow-brand-950/5 backdrop-blur sm:max-w-2xl sm:gap-3 lg:max-w-xl">
                  {[
                    ["10 000+", landing.statWords],
                    ["6", landing.statLevels],
                    ["100%", landing.statPrice],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl bg-page/80 px-3 py-4">
                      <dt className="sr-only">{label}</dt>
                      <dd className="text-xl font-extrabold text-ink sm:text-2xl">
                        {value}
                      </dd>
                      <dd className="mt-1 text-[11px] font-semibold leading-snug text-ink-soft sm:text-xs">
                        {label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal delay={0.16} className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-[520px]">
                <div className="absolute top-28 hidden w-28 rounded-2xl border border-line bg-card/90 p-3 shadow-xl shadow-brand-950/10 backdrop-blur lg:-left-32 lg:block">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink">
                    <Trophy className="size-4 text-amber-500" aria-hidden />
                    {visualCopy.streakTitle}
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-brand-600 dark:text-brand-300">
                    12
                  </div>
                  <div className="text-xs font-semibold text-ink-soft">{visualCopy.streakUnit}</div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-line bg-card shadow-2xl shadow-brand-950/12">
                  <div className="flex items-center justify-between border-b border-line bg-raised px-5 py-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-ink-soft">{visualCopy.panelKicker}</p>
                      <h2 className="text-lg font-extrabold text-ink">{visualCopy.panelTitle}</h2>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-500/12 text-accent-600 dark:text-accent-300">
                      <BookOpenCheck className="size-5" aria-hidden />
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="rounded-2xl bg-ink p-5 text-white dark:bg-white dark:text-brand-950">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold opacity-70">{visualCopy.wordLabel}</p>
                          <p className="mt-1 text-4xl font-extrabold">achieve</p>
                        </div>
                        <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold dark:bg-brand-950/10">
                          B2
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed opacity-80">
                        to succeed in finishing something important
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {visualCopy.cards.map((card) => (
                        <div key={card.title} className="rounded-2xl border border-line bg-page/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-ink">{card.title}</p>
                            <span className="text-xs font-extrabold text-brand-600 dark:text-brand-300">
                              {card.value}
                            </span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                            <div className={card.bar} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-accent-500/25 bg-accent-500/8 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-500 text-white">
                          <Mic2 className="size-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-sm font-extrabold text-ink">{visualCopy.speakingTitle}</p>
                          <p className="text-xs font-medium text-ink-soft">{visualCopy.speakingBody}</p>
                        </div>
                      </div>
                      <Zap className="size-5 text-amber-500" aria-hidden />
                    </div>
                  </div>
                </div>

                <div className="absolute -right-3 bottom-8 hidden rounded-2xl border border-line bg-card/90 p-4 shadow-xl shadow-brand-950/10 backdrop-blur sm:block">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink">
                    <ChartNoAxesColumnIncreasing className="size-4 text-rose-500" aria-hidden />
                    IELTS
                  </div>
                  <div className="mt-3 flex items-end gap-1.5">
                    {[34, 48, 40, 64, 76].map((height) => (
                      <span
                        key={height}
                        className="w-3 rounded-full bg-gradient-to-t from-brand-600 to-rose-400"
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <p className="text-sm font-extrabold uppercase text-accent-600 dark:text-accent-300">
                {visualCopy.featuresKicker}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-ink sm:text-4xl">
                {visualCopy.featuresTitle}
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.07}>
                <Card className="group h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-950/10">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex size-11 items-center justify-center rounded-2xl ${feature.tone}`}>
                      <feature.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-xs font-extrabold text-ink-soft">0{i + 1}</span>
                  </div>
                  <CardTitle className="mt-5 text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-brand-500 via-accent-500 to-rose-400 transition-all duration-300 group-hover:w-full" />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold text-ink sm:text-4xl">
              {landing.pricingTitle}
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
            <Reveal delay={0.05}>
              <Card className="h-full p-7">
                <CardTitle>{landing.pricingFreeName}</CardTitle>
                <p className="mt-2 text-3xl font-extrabold text-ink">0</p>
                <CardDescription>{landing.pricingFreeDesc}</CardDescription>
              </Card>
            </Reveal>
            <Reveal delay={0.12}>
              <Card className="relative h-full overflow-hidden border-brand-400/50 bg-gradient-to-br from-brand-600/10 via-card to-accent-500/10 p-7">
                <div className="absolute right-5 top-5 rounded-full bg-brand-600 px-3 py-1 text-xs font-extrabold text-white">
                  Pro
                </div>
                <CardTitle className="pr-14 text-brand-600 dark:text-brand-300">
                  {landing.pricingPremiumName}
                </CardTitle>
                <p className="mt-2 text-3xl font-extrabold text-ink">
                  {landing.pricingPremiumPrice}
                </p>
                <CardDescription>{landing.pricingPremiumDesc}</CardDescription>
              </Card>
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <p className="mt-6 text-center text-sm text-ink-soft">{landing.pricingNote}</p>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] bg-ink text-white shadow-xl shadow-brand-950/20 dark:bg-white dark:text-brand-950">
              <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">
                    {landing.ctaTitle}
                  </h2>
                  <p className="mt-3 max-w-xl text-white/70 dark:text-brand-950/65">{landing.ctaBody}</p>
                </div>
                <div className="inline-block">
                  <HeroCta
                    lang={lang}
                    guestLabel={landing.heroCta}
                    userLabel={landing.heroCtaContinue}
                    variant="accent"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-soft sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {common.appName}. {landing.footerRights}
          </span>
          <span>{common.tagline}</span>
        </div>
      </footer>
    </>
  );
}

const landingVisualCopy: Record<
  Locale,
  {
    eyebrow: string;
    panelKicker: string;
    panelTitle: string;
    wordLabel: string;
    streakTitle: string;
    streakUnit: string;
    speakingTitle: string;
    speakingBody: string;
    featuresKicker: string;
    featuresTitle: string;
    cards: { title: string; value: string; bar: string }[];
  }
> = {
  uz: {
    eyebrow: "Talabalar uchun yangi o'quv ritmi",
    panelKicker: "Bugungi fokus",
    panelTitle: "5 daqiqalik mashq",
    wordLabel: "Kun so'zi",
    streakTitle: "Seriya",
    streakUnit: "kun ketma-ket",
    speakingTitle: "Talaffuz mashqi",
    speakingBody: "Qisqa gapni ovoz bilan ayting",
    featuresKicker: "Hammasi bir joyda",
    featuresTitle: "So'z yodlash, gapirish va IELTS tayyorgarligi bitta oqimda",
    cards: [
      { title: "Takrorlash", value: "18/24", bar: "h-full w-3/4 rounded-full bg-brand-500" },
      { title: "Aniqlik", value: "91%", bar: "h-full w-[91%] rounded-full bg-accent-500" },
    ],
  },
  ru: {
    eyebrow: "Новый учебный ритм для студентов",
    panelKicker: "Фокус дня",
    panelTitle: "Тренировка на 5 минут",
    wordLabel: "Слово дня",
    streakTitle: "Серия",
    streakUnit: "дней подряд",
    speakingTitle: "Практика произношения",
    speakingBody: "Произнесите короткую фразу",
    featuresKicker: "Все в одном месте",
    featuresTitle: "Слова, говорение и IELTS-подготовка в одном потоке",
    cards: [
      { title: "Повторение", value: "18/24", bar: "h-full w-3/4 rounded-full bg-brand-500" },
      { title: "Точность", value: "91%", bar: "h-full w-[91%] rounded-full bg-accent-500" },
    ],
  },
  en: {
    eyebrow: "A fresher study rhythm for learners",
    panelKicker: "Today's focus",
    panelTitle: "5-minute practice",
    wordLabel: "Word of the day",
    streakTitle: "Streak",
    streakUnit: "days in a row",
    speakingTitle: "Pronunciation drill",
    speakingBody: "Say a short sentence out loud",
    featuresKicker: "Everything in one place",
    featuresTitle: "Vocabulary, speaking, and IELTS prep in one learning flow",
    cards: [
      { title: "Review", value: "18/24", bar: "h-full w-3/4 rounded-full bg-brand-500" },
      { title: "Accuracy", value: "91%", bar: "h-full w-[91%] rounded-full bg-accent-500" },
    ],
  },
};
