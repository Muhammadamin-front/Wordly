import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  Gamepad2,
  Languages,
  Layers3,
  Mic2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { HeroCta } from "@/components/site/hero-cta";
import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "./dictionaries";

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
      tone: "text-brand-300",
    },
    {
      icon: Languages,
      title: landing.feature2Title,
      body: landing.feature2Body,
      tone: "text-accent-300",
    },
    {
      icon: Target,
      title: landing.feature3Title,
      body: landing.feature3Body,
      tone: "text-rose-300",
    },
    {
      icon: Gamepad2,
      title: landing.feature4Title,
      body: landing.feature4Body,
      tone: "text-amber-300",
    },
  ];

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={nav} />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden pb-12 pt-8 sm:pb-16 lg:pb-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/28 to-transparent" />
            <div className="absolute left-1/2 top-10 h-[640px] w-[min(980px,90vw)] -translate-x-1/2 rounded-lg border border-white/8 bg-[linear-gradient(120deg,rgba(50,108,255,0.16),transparent_32%,rgba(16,201,150,0.14)_52%,transparent_74%,rgba(244,63,94,0.12))] opacity-90 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.03fr_0.97fr]">
            <div className="max-w-3xl">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/74 px-3 py-2 text-xs font-black uppercase text-brand-600 shadow-[0_16px_48px_rgba(10,17,36,0.1)] backdrop-blur-xl dark:text-brand-200">
                  <Sparkles className="size-4 text-accent-400" aria-hidden />
                  {visualCopy.eyebrow}
                </div>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="mt-7 max-w-4xl text-balance text-5xl font-black leading-[0.96] tracking-tight text-ink sm:text-7xl lg:text-8xl">
                  {landing.heroTitle}
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-ink-soft sm:text-lg">
                  {landing.heroSubtitle}
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <HeroCta
                    lang={lang}
                    guestLabel={landing.heroCta}
                    userLabel={landing.heroCtaContinue}
                  />
                  <Link href={`/${lang}#features`}>
                    <Button size="lg" variant="secondary">
                      {landing.heroSecondary}
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2">
                  <Metric icon={BookOpenCheck} value="10 000+" label={landing.statWords} />
                  <Metric icon={Layers3} value="6" label={landing.statLevels} />
                  <Metric icon={ShieldCheck} value="100%" label={landing.statPrice} />
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <LearningConsole visualCopy={visualCopy} />
            </Reveal>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:py-20">
          <Reveal>
            <div className="mb-9 max-w-3xl">
              <p className="text-sm font-black uppercase text-accent-600 dark:text-accent-300">
                {visualCopy.featuresKicker}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black tracking-tight text-ink sm:text-5xl">
                {visualCopy.featuresTitle}
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.06}>
                <Card className="group h-full p-5 light-sweep">
                  <span className="icon-tile size-11 rounded-lg">
                    <feature.icon className={`size-5 ${feature.tone}`} aria-hidden />
                  </span>
                  <CardTitle className="mt-6 text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                  <div className="mt-7 h-1 overflow-hidden rounded-full bg-line/80">
                    <div className="h-full w-1/3 rounded-full bg-linear-to-r from-brand-400 via-accent-400 to-rose-300 transition-all duration-500 group-hover:w-full" />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
          <Reveal>
            <div className="surface-panel rounded-lg p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm font-black uppercase text-brand-600 dark:text-brand-200">
                    {visualCopy.pricingKicker}
                  </p>
                  <h2 className="mt-3 text-balance text-3xl font-black tracking-tight text-ink sm:text-5xl">
                    {landing.pricingTitle}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-ink-soft">{landing.pricingNote}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-5">
                    <CardTitle>{landing.pricingFreeName}</CardTitle>
                    <p className="mt-5 text-4xl font-black text-ink">0</p>
                    <CardDescription>{landing.pricingFreeDesc}</CardDescription>
                  </Card>
                  <Card className="overflow-hidden border-brand-400/50 bg-linear-to-br from-brand-500/16 via-card to-accent-400/14 p-5">
                    <div className="mb-5 inline-flex rounded-lg bg-brand-600 px-3 py-1 text-xs font-black text-white">
                      Pro
                    </div>
                    <CardTitle className="text-brand-600 dark:text-brand-200">
                      {landing.pricingPremiumName}
                    </CardTitle>
                    <p className="mt-5 text-4xl font-black text-ink">
                      {landing.pricingPremiumPrice}
                    </p>
                    <CardDescription>{landing.pricingPremiumDesc}</CardDescription>
                  </Card>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <div className="surface-panel rounded-lg bg-ink p-6 text-white dark:bg-white dark:text-brand-950 sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="max-w-3xl text-balance text-3xl font-black tracking-tight sm:text-5xl">
                    {landing.ctaTitle}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 dark:text-brand-950/65">
                    {landing.ctaBody}
                  </p>
                </div>
                <HeroCta
                  lang={lang}
                  guestLabel={landing.heroCta}
                  userLabel={landing.heroCtaContinue}
                  variant="accent"
                />
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-soft sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {common.appName}. {landing.footerRights}
          </span>
          <span>{common.tagline}</span>
        </div>
      </footer>
    </>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="surface-panel rounded-lg px-3 py-4">
      <Icon className="size-4 text-accent-400" aria-hidden />
      <p className="mt-3 text-xl font-black text-ink sm:text-2xl">{value}</p>
      <p className="mt-1 text-[11px] font-bold leading-snug text-ink-soft">{label}</p>
    </div>
  );
}

function LearningConsole({
  visualCopy,
}: {
  visualCopy: (typeof landingVisualCopy)[Locale];
}) {
  return (
    <div className="depth-scene relative mx-auto w-full max-w-[560px]">
      <div className="surface-panel premium-card rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="text-xs font-black uppercase text-ink-soft">{visualCopy.panelKicker}</p>
            <h2 className="mt-1 text-xl font-black text-ink">{visualCopy.panelTitle}</h2>
          </div>
          <span className="icon-tile size-11 rounded-lg">
            <Rocket className="size-5 text-accent-300" aria-hidden />
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="light-sweep rounded-lg border border-white/10 bg-ink p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.24)] dark:bg-white dark:text-brand-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold opacity-64">{visualCopy.wordLabel}</p>
                <p className="mt-2 text-5xl font-black tracking-tight">achieve</p>
              </div>
              <span className="rounded-lg border border-current/12 px-3 py-1 text-xs font-black">B2</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 opacity-72">
              to succeed in finishing something important
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {visualCopy.cards.map((card) => (
              <div key={card.title} className="rounded-lg border border-line bg-page/62 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-ink">{card.title}</p>
                  <span className="text-xs font-black text-brand-600 dark:text-brand-200">
                    {card.value}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className={card.bar} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-lg border border-accent-500/25 bg-accent-500/8 p-4">
              <div className="flex items-center gap-3">
                <span className="icon-tile size-10 rounded-lg">
                  <Mic2 className="size-5 text-accent-300" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">{visualCopy.speakingTitle}</p>
                  <p className="text-xs font-medium text-ink-soft">{visualCopy.speakingBody}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-page/62 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-ink">
                <Trophy className="size-4 text-amber-300" aria-hidden />
                {visualCopy.streakTitle}
              </div>
              <p className="mt-2 text-3xl font-black text-brand-500 dark:text-brand-200">12</p>
              <p className="text-xs font-semibold text-ink-soft">{visualCopy.streakUnit}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-panel float-medium absolute -right-4 top-12 hidden rounded-lg p-3 lg:block">
        <div className="flex items-center gap-2 text-sm font-black text-ink">
          <ChartNoAxesColumnIncreasing className="size-4 text-rose-300" aria-hidden />
          IELTS
        </div>
        <div className="mt-3 flex items-end gap-1.5">
          {[34, 48, 40, 64, 76].map((height) => (
            <span
              key={height}
              className="w-3 rounded-full bg-linear-to-t from-brand-500 via-accent-400 to-rose-300"
              style={{ height }}
            />
          ))}
        </div>
      </div>

      <div className="surface-panel float-slow absolute -left-6 bottom-12 hidden rounded-lg p-3 lg:block">
        <div className="flex items-center gap-2 text-sm font-black text-ink">
          <AudioLines className="size-4 text-accent-300" aria-hidden />
          91%
        </div>
        <p className="mt-1 text-xs font-semibold text-ink-soft">{visualCopy.accuracyLabel}</p>
      </div>
    </div>
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
    pricingKicker: string;
    accuracyLabel: string;
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
    pricingKicker: "Oddiy va halol",
    accuracyLabel: "aniqlik",
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
    pricingKicker: "Просто и честно",
    accuracyLabel: "точность",
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
    pricingKicker: "Simple and honest",
    accuracyLabel: "accuracy",
    cards: [
      { title: "Review", value: "18/24", bar: "h-full w-3/4 rounded-full bg-brand-500" },
      { title: "Accuracy", value: "91%", bar: "h-full w-[91%] rounded-full bg-accent-500" },
    ],
  },
};
