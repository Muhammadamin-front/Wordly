import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Gamepad2,
  Languages,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCta } from "@/components/site/hero-cta";
import { AnimatedShaderBackground } from "@/components/site/animated-shader-background";
import { SiteHeader } from "@/components/site/header";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "./dictionaries";

const LEVEL_COVERS = [
  { slug: "a1", level: "A1", image: "/images/levels/a1-rookie.png", tone: "bg-emerald-400" },
  { slug: "a2", level: "A2", image: "/images/levels/a2-apprentice.png", tone: "bg-teal-400" },
  { slug: "b1", level: "B1", image: "/images/levels/b1-communicator.png", tone: "bg-blue-400" },
  { slug: "b2", level: "B2", image: "/images/levels/b2-guardian.png", tone: "bg-cyan-400" },
  { slug: "c1", level: "C1", image: "/images/levels/c1-scholar.png", tone: "bg-rose-400" },
  { slug: "c2", level: "C2", image: "/images/levels/c2-master.png", tone: "bg-amber-300" },
] as const;

const HERO_LEVELS = [LEVEL_COVERS[0], LEVEL_COVERS[2], LEVEL_COVERS[5]];

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { common, landing, library, nav } = dict;
  const copy = homeCopy[lang as Locale];
  const shelfLabels = library.shelves as Record<string, { name: string; desc: string }>;

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
        <section className="relative isolate mx-auto min-h-[660px] w-full max-w-[1600px] overflow-hidden border-y border-white/10 bg-[#090d18] text-white sm:min-h-[720px] lg:min-h-[calc(100dvh-80px)]">
          <div aria-hidden className="absolute inset-0 grid grid-cols-3">
            {HERO_LEVELS.map((item, index) => (
              <div className="relative overflow-hidden" key={item.level}>
                <Image
                  alt=""
                  className="object-cover object-top"
                  fill
                  priority
                  sizes="33vw"
                  src={item.image}
                />
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-emerald-950/24"
                      : index === 1
                        ? "bg-blue-950/24"
                        : "bg-amber-950/18"
                  } mix-blend-color`}
                />
              </div>
            ))}
          </div>
          <AnimatedShaderBackground />
          <div aria-hidden className="absolute inset-0 bg-linear-to-r from-[#080c18]/96 via-[#080c18]/72 to-[#080c18]/28" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#080c18] via-transparent to-[#080c18]/26" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px]"
          />

          <div className="relative z-10 mx-auto flex min-h-[660px] max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[720px] sm:px-6 lg:min-h-[calc(100dvh-80px)]">
            <Reveal>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/16 bg-black/30 px-3 py-2 text-xs font-black uppercase text-white/88 backdrop-blur-xl">
                <Sparkles className="size-4 text-accent-300" aria-hidden />
                {copy.eyebrow}
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.96] text-white sm:text-7xl lg:text-8xl">
                {landing.heroTitle}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/76 sm:text-lg">
                {landing.heroSubtitle}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <HeroCta
                  guestLabel={landing.heroCta}
                  lang={lang}
                  userLabel={landing.heroCtaContinue}
                />
                <Link href={`/${lang}/decks`}>
                  <Button
                    className="border-white/22 bg-white/10 text-white hover:border-white/42 hover:bg-white/16 hover:text-white"
                    size="lg"
                    variant="secondary"
                  >
                    {copy.exploreLevels}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/14 bg-white/12 backdrop-blur-xl">
                <HeroMetric value="10 000+" label={landing.statWords} />
                <HeroMetric value="6" label={landing.statLevels} />
                <HeroMetric value="100%" label={landing.statPrice} />
              </div>
            </Reveal>

            <div className="absolute right-4 bottom-6 hidden items-end gap-3 lg:flex">
              {HERO_LEVELS.map((item, index) => (
                <div className="text-right" key={item.level}>
                  <p className="text-xs font-black uppercase text-white/54">
                    {copy.stage} {index + 1}
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">{item.level}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase text-accent-600 dark:text-accent-300">
                  {copy.pathKicker}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black text-ink sm:text-5xl">
                  {copy.pathTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">{copy.pathBody}</p>
              </div>
              <Link className="shrink-0" href={`/${lang}/decks`}>
                <Button variant="secondary">
                  {copy.allLevels}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </Reveal>

          <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {LEVEL_COVERS.map((item, index) => (
              <Reveal delay={index * 0.05} key={item.level}>
                <Link
                  className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-white/12 bg-[#0b1020] shadow-[0_20px_55px_rgba(10,17,36,0.16)]"
                  href={`/${lang}/library/${item.slug}`}
                >
                  <Image
                    alt=""
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.06]"
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 17vw"
                    src={item.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/94 via-black/12 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <span className={`mb-2 block h-1 w-7 rounded-full ${item.tone}`} />
                    <p className="text-xl font-black text-white">{item.level}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/68">
                      {shelfLabels[item.slug].name}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-line/70 bg-card/24">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase text-brand-600 dark:text-brand-200">
                  {copy.featuresKicker}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black text-ink sm:text-5xl">
                  {copy.featuresTitle}
                </h2>
              </div>
            </Reveal>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Reveal delay={index * 0.06} key={feature.title}>
                  <Card className="group h-full p-5">
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
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="surface-panel rounded-lg p-6 sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-sm font-black uppercase text-accent-600 dark:text-accent-300">
                    {landing.pricingTitle}
                  </p>
                  <h2 className="mt-3 max-w-3xl text-balance text-3xl font-black text-ink sm:text-5xl">
                    {landing.ctaTitle}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft">
                    {landing.ctaBody}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-ink-soft">
                    <span className="flex items-center gap-2">
                      <BookOpenCheck className="size-4 text-brand-300" aria-hidden />
                      10 000+
                    </span>
                    <span className="flex items-center gap-2">
                      <Layers3 className="size-4 text-accent-300" aria-hidden />
                      A1–C2
                    </span>
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-rose-300" aria-hidden />
                      {landing.pricingFreeName}
                    </span>
                  </div>
                </div>
                <HeroCta
                  guestLabel={landing.heroCta}
                  lang={lang}
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

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-black/24 px-3 py-4 sm:px-5">
      <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] font-bold leading-snug text-white/58 sm:text-xs">{label}</p>
    </div>
  );
}

const homeCopy: Record<
  Locale,
  {
    eyebrow: string;
    exploreLevels: string;
    stage: string;
    pathKicker: string;
    pathTitle: string;
    pathBody: string;
    allLevels: string;
    featuresKicker: string;
    featuresTitle: string;
  }
> = {
  uz: {
    eyebrow: "Har bir darajada yangi kuch",
    exploreLevels: "Darajalarni ko'rish",
    stage: "Bosqich",
    pathKicker: "A1 dan C2 gacha",
    pathTitle: "Bilimingiz oshgani sari qahramoningiz ham kuchayadi",
    pathBody:
      "Oddiy boshlovchidan erkin va ishonchli til ustasigacha. Har bir daraja yangi so'zlar, yangi vazifalar va yangi vizual bosqichni ochadi.",
    allLevels: "Barcha kartalar",
    featuresKicker: "Bitta o'quv tizimi",
    featuresTitle: "Yodlash, tushunish va gapirish uchun kerakli vositalar",
  },
  ru: {
    eyebrow: "Новая сила на каждом уровне",
    exploreLevels: "Смотреть уровни",
    stage: "Этап",
    pathKicker: "От A1 до C2",
    pathTitle: "Ваш герой становится сильнее вместе с вашими знаниями",
    pathBody:
      "От первых слов до свободного и уверенного английского. Каждый уровень открывает новые слова, задания и визуальный этап.",
    allLevels: "Все карточки",
    featuresKicker: "Единая система обучения",
    featuresTitle: "Все необходимое для запоминания, понимания и речи",
  },
  en: {
    eyebrow: "New strength at every level",
    exploreLevels: "Explore levels",
    stage: "Stage",
    pathKicker: "From A1 to C2",
    pathTitle: "Your hero grows stronger as your English improves",
    pathBody:
      "Move from your first words to fluent, confident English. Every level unlocks new vocabulary, challenges, and a new visual stage.",
    allLevels: "All decks",
    featuresKicker: "One learning system",
    featuresTitle: "Everything you need to remember, understand, and speak",
  },
};
