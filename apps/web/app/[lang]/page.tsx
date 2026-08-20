import {
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Headphones,
  Languages,
  Mic2,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroCta } from "@/components/site/hero-cta";
import { SiteHeader } from "@/components/site/header";
import { HomeHero, type HomeHeroCopy } from "@/components/site/home-hero";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/locales";
import { getWordsLabel } from "@/lib/nav-labels";
import { fetchCatalogMeta } from "@/lib/vocab";
import { getDictionary, hasLocale } from "./dictionaries";

const LEVELS = [
  { slug: "a1", level: "A1", tone: "bg-brand-400" },
  { slug: "a2", level: "A2", tone: "bg-brand-600" },
  { slug: "b1", level: "B1", tone: "bg-accent-500" },
  { slug: "b2", level: "B2", tone: "bg-brand-800" },
] as const;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const catalog = await fetchCatalogMeta().catch(() => null);
  const { common, landing, library, nav } = dict;
  const copy = homeCopy[lang as Locale];
  const shelfLabels = library.shelves as Record<string, { name: string; desc: string }>;

  const features: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: BrainCircuit, title: landing.feature1Title, body: landing.feature1Body },
    { icon: Volume2, title: landing.feature2Title, body: landing.feature2Body },
    { icon: Target, title: landing.feature3Title, body: landing.feature3Body },
    { icon: Trophy, title: landing.feature4Title, body: landing.feature4Body },
  ];

  const heroNav = [
    { href: `/${lang}/vocabulary`, label: getWordsLabel(lang as Locale) },
    { href: `/${lang}/grammar`, label: nav.grammar },
    { href: `/${lang}/ielts`, label: nav.ielts },
    { href: `/${lang}/pricing`, label: nav.pricing },
  ];

  return (
    <>
      <div className="lg:hidden">
        <SiteHeader lang={lang as Locale} nav={nav} />
      </div>

      <HomeHero
        lang={lang}
        copy={copy.hero}
        ctaLabel={landing.heroCta}
        ctaContinueLabel={landing.heroCtaContinue}
        navLinks={heroNav}
        signIn={nav.login}
        signUp={nav.register}
        dashboard={nav.dashboard}
      />

      <main className="flex-1 px-3 pb-8 sm:px-5">

        <section className="mx-auto mt-5 grid max-w-370 gap-5 xl:grid-cols-[2.1fr_1fr]">
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
                          {catalog && (
                            <p className="mb-5 text-[11px] font-bold text-ink-soft">
                              {new Intl.NumberFormat(lang).format(catalog.levels[item.level] ?? 0)} {library.words}
                            </p>
                          )}
                          <p className="flex items-center justify-end gap-1.5 text-xs font-black text-brand-900 dark:text-brand-200">
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
            <div className="relative min-h-130 overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 p-7 text-white shadow-[9px_11px_0_rgba(84,37,15,0.58)]">
              <div aria-hidden className="absolute -right-20 -top-16 size-80 rounded-full border-[28px] border-accent-400/55" />
              <div aria-hidden className="absolute -bottom-24 -left-16 size-64 bg-brand-500/80 rotate-12" />
              <p aria-hidden className="absolute right-6 top-8 font-display text-[7rem] leading-none tracking-wide text-sand-100/10">IELTS</p>
              <div className="relative z-10 flex h-full flex-col">
                <span className="print-label inline-flex w-fit items-center gap-2 border-sand-100/45 bg-sand-100/10 text-sand-100">
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
                        <span className="flex size-8 items-center justify-center rounded-md border border-white/20 bg-white/8">
                          <Icon className="size-4 text-accent-300" aria-hidden />
                        </span>
                        {feature}
                      </p>
                    );
                  })}
                </div>
                <Link href={`/${lang}/ielts`} className="mt-auto pt-8">
                  <Button className="border-brand-950 bg-sand-100 text-brand-950 hover:bg-brand-50" variant="secondary">
                    {copy.openIelts}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto mt-5 max-w-370">
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
        <div className="mx-auto flex max-w-370 flex-col items-center justify-between gap-3 px-5 text-sm text-ink-soft sm:flex-row">
          <span>
            © {new Date().getFullYear()} {common.appName}. {landing.footerRights}
          </span>
          <nav className="flex items-center gap-4 text-xs font-semibold" aria-label="Legal">
            <Link href={`/${lang}/legal/privacy`}>Privacy</Link>
            <Link href={`/${lang}/legal/terms`}>Terms</Link>
            <Link href={`/${lang}/support`}>Support</Link>
          </nav>
        </div>
      </footer>
    </>
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
    hero: HomeHeroCopy;
  }
> = {
  uz: {
    eyebrow: "Har kuni aniq reja bilan ravonlik sari",
    title: "Ingliz tilini ishonch bilan o'rganing",
    subtitle: "O'zbek tilidagi aniq izohlar, aqlli takrorlash, talaffuz va IELTS uchun amaliy resurslar.",
    heroImageAlt: "Vocora uchun kitoblar va lampali sokin o'qish muhiti",
    exploreLevels: "Darajalarni ko'rish",
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
    hero: {
      eyebrow: "Aniq reja. Haqiqiy natija.",
      title: "Ingliz tili shu yerdan boshlanadi",
      subtitle:
        "O'zbek tilidagi izohlar, aqlli takrorlash va IELTS uchun amaliy mashqlar — bir joyda, har kuni.",
      heroImageAlt: "Kofe va kitob bilan ingliz tilini o'rganayotgan Vocora mushugi",
      pillars: ["So'z boyligi", "Grammatika", "Talaffuz", "IELTS"],
      shelfTitle: "To'liq ingliz tili yo'li",
      shelfBody: "A1 dan C2 gacha — har bir daraja o'z lug'ati va mashqlari bilan.",
      badgeTitle: "O'zbek tilida",
      badgeBody: "Izohlar va tarjimalar ona tilingizda",
      browseLevels: "Barcha darajalar",
      search: "So'z qidirish",
      menu: "Menyu",
    },
  },
  ru: {
    eyebrow: "Каждый день — уверенный шаг к свободной речи",
    title: "Учите английский уверенно",
    subtitle: "Понятные объяснения на узбекском, умное повторение, произношение и практические ресурсы для IELTS.",
    heroImageAlt: "Спокойная учебная атмосфера с книгами и лампой для Vocora",
    exploreLevels: "Смотреть уровни",
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
    hero: {
      eyebrow: "Чёткий план. Реальный результат.",
      title: "Английский начинается здесь",
      subtitle:
        "Объяснения на узбекском, умное повторение и практика для IELTS — в одном месте, каждый день.",
      heroImageAlt: "Кот Vocora изучает английский с кофе и книгой",
      pillars: ["Словарь", "Грамматика", "Произношение", "IELTS"],
      shelfTitle: "Полный путь в английском",
      shelfBody: "От A1 до C2 — у каждого уровня свой словарь и свои упражнения.",
      badgeTitle: "На узбекском",
      badgeBody: "Объяснения и переводы на родном языке",
      browseLevels: "Все уровни",
      search: "Поиск слова",
      menu: "Меню",
    },
  },
  en: {
    eyebrow: "A focused path to fluent English, every day",
    title: "Learn English with confidence",
    subtitle: "Clear Uzbek explanations, smart review, pronunciation, and practical IELTS resources.",
    heroImageAlt: "Calm premium study desk with books and a reading lamp for Vocora",
    exploreLevels: "Explore levels",
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
    hero: {
      eyebrow: "A clear plan. Real progress.",
      title: "English starts right here",
      subtitle:
        "Uzbek explanations, spaced repetition and hands-on IELTS practice — in one place, every day.",
      heroImageAlt: "The Vocora cat studying English with coffee and a book",
      pillars: ["Vocabulary", "Grammar", "Pronunciation", "IELTS"],
      shelfTitle: "The complete English path",
      shelfBody: "A1 through C2 — every level with its own words and drills.",
      badgeTitle: "In Uzbek",
      badgeBody: "Explanations and translations in your first language",
      browseLevels: "All levels",
      search: "Search a word",
      menu: "Menu",
    },
  },
};
