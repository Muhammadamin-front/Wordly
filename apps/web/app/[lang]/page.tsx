import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Headphones,
  Languages,
  Mic2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCta } from "@/components/site/hero-cta";
import { SiteHeader } from "@/components/site/header";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/locales";
import { fetchCatalogMeta, type CatalogMeta } from "@/lib/vocab";
import { getDictionary, hasLocale } from "./dictionaries";

const LEVELS = [
  { slug: "a1", level: "A1", tone: "bg-[#9a9668]" },
  { slug: "a2", level: "A2", tone: "bg-brand-600" },
  { slug: "b1", level: "B1", tone: "bg-[#327f8d]" },
  { slug: "b2", level: "B2", tone: "bg-[#3d6264]" },
] as const;

const FALLBACK_CATALOG: CatalogMeta = {
  word_total: 8963,
  expression_total: 812,
  learning_item_total: 9775,
  levels: { A1: 816, A2: 1425, B1: 1855, B2: 3025, C1: 1609, C2: 233 },
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const catalog = await fetchCatalogMeta().catch(() => FALLBACK_CATALOG);
  const { common, landing, library, nav } = dict;
  const copy = homeCopy[lang as Locale];
  const itemCount = new Intl.NumberFormat(lang).format(catalog.learning_item_total);
  const shelfLabels = library.shelves as Record<string, { name: string; desc: string }>;

  const features: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: BrainCircuit, title: landing.feature1Title, body: landing.feature1Body },
    { icon: Volume2, title: landing.feature2Title, body: landing.feature2Body },
    { icon: Target, title: landing.feature3Title, body: landing.feature3Body },
    { icon: Trophy, title: landing.feature4Title, body: landing.feature4Body },
  ];

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={nav} />

      <main className="flex-1 px-3 pb-8 sm:px-5">
        <section className="relative mx-auto min-h-[620px] max-w-[1480px] overflow-hidden rounded-[22px] border border-line bg-[#faf8f2] shadow-[0_28px_90px_rgba(39,67,59,0.1)] dark:bg-[#0b211b]">
          <Image
            src="/images/wordly-uzbek-student-hero.png"
            alt={copy.heroImageAlt}
            fill
            priority
            sizes="(max-width: 768px) 160vw, 1480px"
            className="object-cover object-[61%_center] dark:brightness-[0.58]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-r from-[#fbfaf5] via-[#fbfaf5]/96 via-[42%] to-transparent to-[72%] dark:from-[#0b211b] dark:via-[#0b211b]/94"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(7,58,53,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(7,58,53,0.08)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:linear-gradient(to_right,black,transparent_46%)]"
          />

          <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1380px] flex-col px-6 py-12 sm:px-10 lg:px-14 lg:py-14">
            <div className="max-w-[650px] lg:max-w-[610px]">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-900/8 bg-brand-900/5 px-3.5 py-2 text-xs font-bold text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-brand-200">
                  <Sparkles className="size-3.5" aria-hidden />
                  {copy.eyebrow}
                </span>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="mt-6 text-balance text-[44px] font-black leading-[1.02] text-brand-950 sm:text-6xl lg:text-[66px] dark:text-white">
                  {copy.title}
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-5 max-w-[570px] text-pretty text-base leading-7 text-ink-soft sm:text-lg">
                  {copy.subtitle.replace("{count}", itemCount)}
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <HeroCta
                    guestLabel={landing.heroCta}
                    lang={lang}
                    userLabel={landing.heroCtaContinue}
                  />
                  <Link href={`/${lang}/preview/a1`}>
                    <Button size="lg" variant="secondary">
                      {copy.exploreLevels}
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.24}>
              <div className="mt-auto grid max-w-[630px] grid-cols-3 gap-3 pt-9">
                <HeroMetric icon={BookOpen} value={itemCount} label={copy.wordsMetric} />
                <HeroMetric
                  icon={ChartNoAxesColumnIncreasing}
                  value="6"
                  label={copy.levelsMetric}
                />
                <HeroMetric icon={GraduationCap} value="4" label={copy.skillsMetric} />
              </div>
            </Reveal>
          </div>

          <div className="absolute left-[53%] top-[18%] z-20 hidden w-[194px] xl:block">
            <FloatingCard className="float-slow">
              <div className="flex items-center justify-between text-[10px] text-ink-soft">
                <span>{copy.todayWord}</span>
                <Headphones className="size-3.5" aria-hidden />
              </div>
              <p className="mt-3 text-xl font-black text-ink">achieve</p>
              <p className="mt-1 text-xs text-ink-soft">/əˈtʃiːv/</p>
              <p className="mt-3 text-[11px] font-semibold text-brand-700 dark:text-brand-200">
                {copy.achieveTranslation}
              </p>
            </FloatingCard>
          </div>

          <div className="absolute left-[53%] top-[46%] z-20 hidden w-[194px] xl:block">
            <FloatingCard className="float-medium">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <span className="text-lg">🔥</span>
                </span>
                <div>
                  <p className="text-[10px] text-ink-soft">{copy.streak}</p>
                  <p className="text-sm font-black text-ink">12 {copy.days}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {[1, 1, 1, 1, 1, 1, 0].map((active, index) => (
                  <span
                    key={index}
                    className={`aspect-square rounded-full border ${
                      active ? "border-brand-500 bg-brand-500" : "border-line bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </FloatingCard>
          </div>

          <div className="absolute right-[2.5%] top-[20%] z-20 hidden w-[220px] 2xl:block">
            <FloatingCard className="float-medium">
              <p className="text-[10px] text-ink-soft">{copy.pronunciation}</p>
              <div className="mt-4 flex h-10 items-center gap-1">
                {[14, 24, 18, 31, 22, 38, 28, 17, 34, 26, 20, 30, 16, 24].map(
                  (height, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-full ${
                        index < 7 ? "bg-accent-400" : "bg-brand-500"
                      }`}
                      style={{ height }}
                    />
                  )
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-ink-soft">{copy.good}</span>
                <strong className="text-ink">87%</strong>
              </div>
            </FloatingCard>
          </div>

          <div className="absolute right-[3%] top-[55%] z-20 hidden w-[214px] 2xl:block">
            <FloatingCard className="float-slow">
              <p className="text-[10px] text-ink-soft">{copy.cefrLevel}</p>
              <p className="mt-3 text-2xl font-black text-brand-900 dark:text-brand-200">B1</p>
              <p className="text-xs text-ink-soft">{copy.intermediate}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line/60">
                <div className="h-full w-[68%] rounded-full bg-brand-500" />
              </div>
            </FloatingCard>
          </div>
        </section>

        <section className="mx-auto mt-5 grid max-w-[1480px] gap-5 xl:grid-cols-[2.1fr_1fr]">
          <Reveal>
            <div className="surface-panel rounded-[22px] p-6 sm:p-8">
              <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
                <div className="flex flex-col">
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase text-ink-soft">
                    <ShieldCheck className="size-4 text-brand-600" aria-hidden />
                    {copy.pathKicker}
                  </p>
                  <h2 className="mt-5 text-3xl font-black leading-tight text-brand-950 dark:text-white">
                    {copy.pathTitle}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-ink-soft">{copy.pathBody}</p>
                  <Link
                    href={`/${lang}/vocabulary`}
                    className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-black text-brand-800 transition-colors hover:text-brand-600 dark:text-brand-200"
                  >
                    {copy.allLevels}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {LEVELS.map((item, index) => (
                    <Reveal delay={index * 0.05} key={item.level}>
                      <Link
                        href={`/${lang}/preview/${item.slug}`}
                        className="group flex h-full min-h-[258px] flex-col overflow-hidden rounded-xl border border-line/80 bg-raised/72 p-4 transition-all hover:-translate-y-1 hover:border-brand-400/60 hover:shadow-[0_18px_45px_rgba(24,63,57,0.1)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`flex size-10 items-center justify-center rounded-full text-xs font-black text-white ${item.tone}`}
                          >
                            {item.level}
                          </span>
                          <ArchitecturalMotif tone={item.tone} />
                        </div>
                        <p className="mt-4 text-base font-black text-ink">
                          {shelfLabels[item.slug].name.split("·").at(-1)?.trim()}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-soft">
                          {shelfLabels[item.slug].desc}
                        </p>
                        <div className="mt-auto pt-5">
                          <p className="text-[11px] font-bold text-ink-soft">
                            {new Intl.NumberFormat(lang).format(catalog.levels[item.level] ?? 0)} {library.words}
                          </p>
                          <p className="mt-5 flex items-center justify-end gap-1.5 text-xs font-black text-brand-900 dark:text-brand-200">
                            {copy.previewLevel}
                            <ArrowRight className="size-3.5" aria-hidden />
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid gap-3 border-t border-line/70 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-300">
                      <feature.icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-xs font-black text-ink">{feature.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-ink-soft">
                        {feature.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative min-h-[520px] overflow-hidden rounded-[22px] bg-brand-950 p-7 text-white shadow-[0_24px_70px_rgba(7,58,53,0.22)]">
              <Image
                src="/images/wordly-uzbek-student-hero.png"
                alt=""
                fill
                sizes="480px"
                className="object-cover object-[72%_center] opacity-24 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-linear-to-r from-brand-950 via-brand-950/94 to-brand-900/42" />
              <div
                aria-hidden
                className="absolute inset-0 opacity-10 [background-image:linear-gradient(60deg,transparent_46%,rgba(255,255,255,.45)_48%,transparent_50%)] [background-size:26px_26px]"
              />
              <div className="relative z-10 flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase text-white/72">
                  <GraduationCap className="size-3.5" aria-hidden />
                  IELTS
                </span>
                <h2 className="mt-6 max-w-sm text-3xl font-black leading-tight">
                  {copy.ieltsTitle}
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">{copy.ieltsBody}</p>
                <div className="mt-7 space-y-3 text-sm font-semibold text-white/88">
                  {copy.ieltsFeatures.map((feature, index) => {
                    const icons = [Mic2, Languages, Headphones, Star];
                    const Icon = icons[index] ?? Star;
                    return (
                      <p key={feature} className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-lg border border-white/12 bg-white/8">
                          <Icon className="size-4 text-accent-300" aria-hidden />
                        </span>
                        {feature}
                      </p>
                    );
                  })}
                </div>
                <Link href={`/${lang}/ielts`} className="mt-auto pt-8">
                  <Button className="bg-[#faf7ef] text-brand-950 hover:bg-white" variant="secondary">
                    {copy.openIelts}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto mt-5 max-w-[1480px]">
          <Reveal>
            <div className="surface-panel grid gap-6 rounded-[22px] p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-black uppercase text-brand-600">{copy.systemKicker}</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-black text-brand-950 dark:text-white sm:text-4xl">
                  {copy.systemTitle}
                </h2>
              </div>
              <div className="flex items-center lg:justify-end">
                <HeroCta
                  guestLabel={landing.heroCta}
                  lang={lang}
                  userLabel={landing.heroCtaContinue}
                />
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mt-4 border-t border-line/70 py-7">
        <div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-3 px-5 text-sm text-ink-soft sm:flex-row">
          <span>
            © {new Date().getFullYear()} {common.appName}. {landing.footerRights}
          </span>
          <span>{common.tagline}</span>
        </div>
      </footer>
    </>
  );
}

function FloatingCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/70 bg-white/88 p-4 shadow-[0_20px_55px_rgba(38,57,52,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-brand-950/82 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-brand-900/8 bg-white/48 px-3 py-3 backdrop-blur-sm dark:border-white/8 dark:bg-white/5">
      <Icon className="size-7 shrink-0 text-brand-800 dark:text-brand-200" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0">
        <p className="text-lg font-black text-ink">{value}</p>
        <p className="truncate text-[11px] text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

function ArchitecturalMotif({ tone }: { tone: string }) {
  return (
    <span
      aria-hidden
      className="relative h-20 w-12 overflow-hidden rounded-t-full border border-line/70 bg-sand-50/70"
    >
      <span className={`absolute inset-x-2 bottom-0 h-14 rounded-t-full opacity-18 ${tone}`} />
      <span className="absolute inset-x-0 top-7 h-px rotate-45 bg-brand-900/18" />
      <span className="absolute inset-x-0 top-7 h-px -rotate-45 bg-brand-900/18" />
      <span className="absolute inset-x-2 bottom-2 h-8 rounded-t-full border border-brand-900/16" />
    </span>
  );
}

const homeCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    heroImageAlt: string;
    exploreLevels: string;
    wordsMetric: string;
    levelsMetric: string;
    skillsMetric: string;
    todayWord: string;
    achieveTranslation: string;
    streak: string;
    days: string;
    pronunciation: string;
    good: string;
    cefrLevel: string;
    intermediate: string;
    pathKicker: string;
    pathTitle: string;
    pathBody: string;
    allLevels: string;
    ieltsTitle: string;
    ieltsBody: string;
    ieltsFeatures: string[];
    openIelts: string;
    systemKicker: string;
    systemTitle: string;
    previewLevel: string;
  }
> = {
  uz: {
    eyebrow: "O'zbeklar uchun yaratilgan ingliz tili platformasi",
    title: "Ingliz tilini ishonch bilan o'rganing",
    subtitle:
      "O'zbek tilida tushuntirilgan {count} ta so'z va ibora, aqlli takrorlash, talaffuz hamda IELTS uchun statik o'quv resurslari.",
    heroImageAlt: "Ingliz tilini o'rganayotgan o'zbek studenti",
    exploreLevels: "Darajalarni ko'rish",
    wordsMetric: "so'z va ibora",
    levelsMetric: "CEFR darajasi",
    skillsMetric: "asosiy ko'nikma",
    todayWord: "Bugungi so'z",
    achieveTranslation: "erishmoq, amalga oshirmoq",
    streak: "Ketma-ketlik",
    days: "kun",
    pronunciation: "Talaffuz mashqi",
    good: "Yaxshi",
    cefrLevel: "CEFR darajangiz",
    intermediate: "o'rta",
    pathKicker: "CEFR bo'yicha o'rganish",
    pathTitle: "O'zingizga mos darajadan boshlang",
    pathBody:
      "Har bir daraja kundalik hayot, o'qish va ish uchun kerakli so'zlar asosida bosqichma-bosqich tuzilgan.",
    allLevels: "Barcha darajalarni ko'rish",
    ieltsTitle: "IELTS natijangizni bosqichma-bosqich oshiring",
    ieltsBody:
      "Writing, speaking, reading va listening uchun model javoblar, strategiyalar va akademik lug'at.",
    ieltsFeatures: [
      "Band 7–9 model javoblar",
      "Speaking topic va native iboralar",
      "Reading va listening strategiyalari",
      "Academic collocationlar",
    ],
    openIelts: "IELTS bo'limini ochish",
    systemKicker: "Bitta o'quv tizimi",
    systemTitle: "So'z yodlashdan ravon gapirishgacha hammasi bir joyda",
    previewLevel: "5 ta so'zni sinash",
  },
  ru: {
    eyebrow: "Платформа английского для Узбекистана",
    title: "Учите английский уверенно",
    subtitle:
      "{count} слов и выражений с понятными объяснениями, умное повторение, произношение и статические ресурсы IELTS.",
    heroImageAlt: "Узбекский студент изучает английский язык",
    exploreLevels: "Смотреть уровни",
    wordsMetric: "слов и фраз",
    levelsMetric: "уровней CEFR",
    skillsMetric: "основных навыка",
    todayWord: "Слово дня",
    achieveTranslation: "достигать, осуществлять",
    streak: "Серия",
    days: "дней",
    pronunciation: "Практика произношения",
    good: "Хорошо",
    cefrLevel: "Ваш уровень CEFR",
    intermediate: "средний",
    pathKicker: "Обучение по CEFR",
    pathTitle: "Начните с подходящего уровня",
    pathBody:
      "Каждый уровень построен вокруг слов, необходимых для повседневной жизни, учебы и работы.",
    allLevels: "Смотреть все уровни",
    ieltsTitle: "Повышайте результат IELTS шаг за шагом",
    ieltsBody:
      "Модельные ответы, стратегии и академическая лексика для Writing, Speaking, Reading и Listening.",
    ieltsFeatures: [
      "Модельные ответы Band 7–9",
      "Темы Speaking и живые фразы",
      "Стратегии Reading и Listening",
      "Академические коллокации",
    ],
    openIelts: "Открыть IELTS",
    systemKicker: "Единая система обучения",
    systemTitle: "От запоминания слов до свободной речи в одном месте",
    previewLevel: "Попробовать 5 слов",
  },
  en: {
    eyebrow: "English learning built for Uzbekistan",
    title: "Learn English with confidence",
    subtitle:
      "{count} clearly explained words and expressions, smart review, pronunciation, and static IELTS resources.",
    heroImageAlt: "Uzbek student learning English",
    exploreLevels: "Explore levels",
    wordsMetric: "words and phrases",
    levelsMetric: "CEFR levels",
    skillsMetric: "core skills",
    todayWord: "Word of the day",
    achieveTranslation: "to reach or accomplish",
    streak: "Learning streak",
    days: "days",
    pronunciation: "Pronunciation practice",
    good: "Good",
    cefrLevel: "Your CEFR level",
    intermediate: "intermediate",
    pathKicker: "Learn by CEFR",
    pathTitle: "Start at the level that fits you",
    pathBody:
      "Every level is built step by step around the words you need for daily life, study, and work.",
    allLevels: "Explore all levels",
    ieltsTitle: "Improve your IELTS score step by step",
    ieltsBody:
      "Model answers, strategies, and academic vocabulary for Writing, Speaking, Reading, and Listening.",
    ieltsFeatures: [
      "Band 7–9 model answers",
      "Speaking topics and natural phrases",
      "Reading and listening strategies",
      "Academic collocations",
    ],
    openIelts: "Open IELTS",
    systemKicker: "One learning system",
    systemTitle: "Everything from memorizing words to speaking fluently",
    previewLevel: "Try 5 words",
  },
};
