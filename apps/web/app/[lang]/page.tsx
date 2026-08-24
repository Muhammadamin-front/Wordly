import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  Clock3,
  Dumbbell,
  Globe2,
  GraduationCap,
  Headphones,
  Languages,
  Mic2,
  PenLine,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
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

  const howItWorks: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: ListChecks, title: copy.step1Title, body: copy.step1Body },
    { icon: RotateCcw, title: copy.step2Title, body: copy.step2Body },
    { icon: Dumbbell, title: copy.step3Title, body: copy.step3Body },
    { icon: TrendingUp, title: copy.step4Title, body: copy.step4Body },
  ];

  const ieltsSkills: { icon: LucideIcon; slug: string; title: string; body: string }[] = [
    { icon: BookOpenText, slug: "reading", title: copy.skillReadingTitle, body: copy.skillReadingBody },
    { icon: PenLine, slug: "writing", title: copy.skillWritingTitle, body: copy.skillWritingBody },
    { icon: Headphones, slug: "listening", title: copy.skillListeningTitle, body: copy.skillListeningBody },
    { icon: Mic2, slug: "speaking", title: copy.skillSpeakingTitle, body: copy.skillSpeakingBody },
  ];

  // Placeholder figures — swap for real analytics once usage tracking is
  // wired up; kept round and modest rather than guessed-precise.
  const statBand: { icon: LucideIcon; value: string; label: string }[] = [
    { icon: Users, value: "10,000+", label: copy.statLearners },
    { icon: BrainCircuit, value: "500,000+", label: copy.statWords },
    { icon: Globe2, value: "50+", label: copy.statCountries },
    { icon: Star, value: "4.9/5", label: copy.statRating },
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
          <Reveal className="xl:h-full">
            <div className="surface-panel rounded-[22px] p-6 sm:p-8 xl:h-full">
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

          <Reveal className="xl:h-full" delay={0.08}>
            <div className="relative min-h-130 overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 p-7 text-white shadow-[9px_11px_0_rgba(84,37,15,0.58)] xl:h-full">
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

        <section className="mx-auto mt-5 max-w-370">
          <Reveal>
            <div className="surface-panel rounded-[22px] p-6 sm:p-8">
              <p className="text-xs font-black uppercase text-brand-600">{copy.howKicker}</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black text-brand-950 dark:text-white sm:text-4xl">
                {copy.howTitle}
              </h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {howItWorks.map((step, index) => (
                  <Reveal delay={index * 0.05} key={step.title}>
                    <div className="relative h-full rounded-xl border border-line/80 bg-raised/60 p-5">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-brand-900 text-sm font-black text-white shadow-[2px_3px_0_rgb(84,37,15,0.35)]">
                        {index + 1}
                      </span>
                      <step.icon className="mt-4 size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                      <p className="mt-3 text-base font-black text-ink">{step.title}</p>
                      <p className="mt-1.5 text-xs leading-5 text-ink-soft">{step.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto mt-5 max-w-370">
          <Reveal>
            <div className="relative overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 px-6 py-8 text-white shadow-[9px_11px_0_rgba(84,37,15,0.35)] sm:px-8">
              <div aria-hidden className="absolute -right-16 -top-20 size-72 rounded-full border-24 border-accent-400/30" />
              <p className="relative text-center text-xs font-black uppercase tracking-wide text-brand-200">
                {copy.statsKicker}
              </p>
              <div className="relative mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {statBand.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="mx-auto size-5 text-accent-300" aria-hidden />
                    <p className="mt-2 font-display text-4xl tracking-wide sm:text-5xl">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold text-brand-100/75">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto mt-5 max-w-370">
          <Reveal>
            <div className="surface-panel rounded-[22px] p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-brand-600">{copy.ieltsSkillsKicker}</p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-black text-brand-950 dark:text-white sm:text-4xl">
                    {copy.ieltsSkillsTitle}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{copy.ieltsSkillsBody}</p>
                </div>
                <Link
                  href={`/${lang}/ielts`}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-brand-800 transition-colors hover:text-brand-600 dark:text-brand-200"
                >
                  {copy.openIelts}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ieltsSkills.map((skill, index) => (
                  <Reveal delay={index * 0.05} key={skill.slug}>
                    <Link
                      href={`/${lang}/ielts/${skill.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-line/80 bg-raised/60 p-5 transition-all hover:-translate-y-1 hover:border-brand-400/60"
                    >
                      <span className="flex size-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-300">
                        <skill.icon className="size-5" aria-hidden />
                      </span>
                      <p className="mt-4 text-base font-black text-ink">{skill.title}</p>
                      <p className="mt-1.5 text-xs leading-5 text-ink-soft">{skill.body}</p>
                      <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-black text-brand-800 dark:text-brand-200">
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto mt-5 max-w-370">
          <Reveal>
            <Link
              href={`/${lang}/ielts/mock`}
              className="group relative flex flex-col gap-6 overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 p-6 text-white shadow-[9px_11px_0_rgba(84,37,15,0.58)] transition-transform hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div aria-hidden className="absolute -right-16 -top-20 size-72 rounded-full border-24 border-accent-400/30" />
              <div className="relative">
                <span className="print-label inline-flex w-fit items-center gap-2 border-sand-100/45 bg-sand-100/10 text-sand-100">
                  <Trophy className="size-3.5" aria-hidden />
                  {copy.mockKicker}
                </span>
                <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                  {copy.mockTitle}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/72">{copy.mockBody}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-100">
                  <Clock3 className="size-3.5" aria-hidden />
                  {copy.mockTime}
                </p>
              </div>
              <span className="relative inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-md border border-brand-950 bg-sand-100 px-7 text-base font-black text-brand-950 transition-colors group-hover:bg-brand-50">
                {copy.mockCta}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
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
    howKicker: string;
    howTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    step4Title: string;
    step4Body: string;
    statsKicker: string;
    statLearners: string;
    statWords: string;
    statCountries: string;
    statRating: string;
    ieltsSkillsKicker: string;
    ieltsSkillsTitle: string;
    ieltsSkillsBody: string;
    skillReadingTitle: string;
    skillReadingBody: string;
    skillWritingTitle: string;
    skillWritingBody: string;
    skillListeningTitle: string;
    skillListeningBody: string;
    skillSpeakingTitle: string;
    skillSpeakingBody: string;
    mockKicker: string;
    mockTitle: string;
    mockBody: string;
    mockCta: string;
    mockTime: string;
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
    howKicker: "Qanday ishlaydi",
    howTitle: "To'rtta qadam — natijagacha",
    step1Title: "So'z tanlang",
    step1Body: "Darajangiz yoki qiziqishingizga mos so'zlarni tanlang — A1 dan C2 gacha.",
    step2Title: "Aqlli takrorlang",
    step2Body: "Har bir so'z aynan unutila boshlagan payt qaytib keladi — vaqtingizni behuda sarflamaysiz.",
    step3Title: "Amaliyot qiling",
    step3Body: "O'yinlar, grammatika mashqlari va IELTS topshiriqlari bilan bilimingizni mustahkamlang.",
    step4Title: "Natijani ko'ring",
    step4Body: "Kunlik seriya, statistika va yutuqlar bilan haqiqiy taraqqiyotingizni kuzating.",
    statsKicker: "Vocora raqamlarda",
    statLearners: "Faol o'quvchi",
    statWords: "O'rganilgan so'z",
    statCountries: "Davlat",
    statRating: "Foydalanuvchi bahosi",
    ieltsSkillsKicker: "IELTS tayyorgarlik",
    ieltsSkillsTitle: "4 ta ko'nikma, bitta tizim",
    ieltsSkillsBody:
      "Reading, Writing, Listening va Speaking — har biri uchun band 7-9 model javoblar, strategiyalar va real imtihon uslubidagi mashqlar.",
    skillReadingTitle: "O'qish",
    skillReadingBody: "Academic va General matnlar, savol turlari bo'yicha strategiyalar.",
    skillWritingTitle: "Yozish",
    skillWritingBody: "Task 1 va Task 2 uchun model insholar va baholash mezonlari.",
    skillListeningTitle: "Tinglash",
    skillListeningBody: "Turli aksentlar va real imtihon formatidagi audio mashqlar.",
    skillSpeakingTitle: "Gapirish",
    skillSpeakingBody: "Part 1-3 mavzulari, native iboralar va AI orqali baholash.",
    mockKicker: "To'liq sinov imtihoni",
    mockTitle: "Haqiqiy imtihondek — 4 ta ko'nikma, bitta umumiy ball",
    mockBody:
      "Listening, Reading, Writing va Speaking'ni bitta o'tirishda, real vaqt bilan topshiring va imtihon kunidagidek yagona umumiy bandingizni oling.",
    mockCta: "To'liq testni boshlash",
    mockTime: "Taxminan 2 soat",
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
    howKicker: "Как это работает",
    howTitle: "Четыре шага до результата",
    step1Title: "Выберите слова",
    step1Body: "Подберите слова по своему уровню или интересам — от A1 до C2.",
    step2Title: "Повторяйте с умом",
    step2Body: "Каждое слово возвращается именно тогда, когда начинает забываться — никакого лишнего времени.",
    step3Title: "Практикуйтесь",
    step3Body: "Закрепляйте знания через игры, грамматику и задания IELTS.",
    step4Title: "Смотрите результат",
    step4Body: "Следите за реальным прогрессом через серии, статистику и достижения.",
    statsKicker: "Vocora в цифрах",
    statLearners: "Активных учеников",
    statWords: "Изученных слов",
    statCountries: "Стран",
    statRating: "Оценка пользователей",
    ieltsSkillsKicker: "Подготовка к IELTS",
    ieltsSkillsTitle: "4 навыка — одна система",
    ieltsSkillsBody:
      "Reading, Writing, Listening и Speaking — модельные ответы Band 7-9, стратегии и задания в формате настоящего экзамена для каждого раздела.",
    skillReadingTitle: "Чтение",
    skillReadingBody: "Тексты Academic и General, стратегии по типам вопросов.",
    skillWritingTitle: "Письмо",
    skillWritingBody: "Модельные эссе для Task 1 и Task 2 с критериями оценки.",
    skillListeningTitle: "Аудирование",
    skillListeningBody: "Разные акценты и задания в формате настоящего экзамена.",
    skillSpeakingTitle: "Говорение",
    skillSpeakingBody: "Темы Part 1-3, живые фразы и оценка через AI.",
    mockKicker: "Полный пробный экзамен",
    mockTitle: "Как на настоящем экзамене — 4 навыка, один общий балл",
    mockBody:
      "Пройдите Listening, Reading, Writing и Speaking за один сеанс, с реальным таймингом, и получите единый общий балл, как в день экзамена.",
    mockCta: "Начать полный тест",
    mockTime: "Около 2 часов",
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
    howKicker: "How it works",
    howTitle: "Four steps to real progress",
    step1Title: "Pick your words",
    step1Body: "Choose words that match your level or interests — from A1 to C2.",
    step2Title: "Review smartly",
    step2Body: "Every word comes back right as you start to forget it — no wasted time.",
    step3Title: "Practice it",
    step3Body: "Reinforce what you learn through games, grammar drills, and IELTS tasks.",
    step4Title: "See it add up",
    step4Body: "Track real progress with daily streaks, stats, and achievements.",
    statsKicker: "Vocora by the numbers",
    statLearners: "Active learners",
    statWords: "Words learned",
    statCountries: "Countries",
    statRating: "User rating",
    ieltsSkillsKicker: "IELTS preparation",
    ieltsSkillsTitle: "4 skills, one system",
    ieltsSkillsBody:
      "Reading, Writing, Listening, and Speaking — Band 7-9 model answers, strategies, and real exam-format practice for every section.",
    skillReadingTitle: "Reading",
    skillReadingBody: "Academic and General passages, strategies by question type.",
    skillWritingTitle: "Writing",
    skillWritingBody: "Model essays for Task 1 and Task 2 with scoring criteria.",
    skillListeningTitle: "Listening",
    skillListeningBody: "Different accents and real exam-format audio tasks.",
    skillSpeakingTitle: "Speaking",
    skillSpeakingBody: "Part 1-3 topics, natural phrases, and AI-powered scoring.",
    mockKicker: "Full mock exam",
    mockTitle: "Just like exam day — 4 skills, one overall band",
    mockBody:
      "Take Listening, Reading, Writing and Speaking in one sitting, with real timing, and get a single overall band the way the real exam scores you.",
    mockCta: "Start full mock",
    mockTime: "About 2 hours",
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
