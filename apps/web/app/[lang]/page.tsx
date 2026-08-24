import {
  ArrowRight,
  BrainCircuit,
  BookOpen,
  Crown,
  Gamepad2,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { Reveal } from "@/components/site/reveal";
import type { Locale } from "@/lib/locales";
import { fetchCatalogMeta } from "@/lib/vocab";
import { getDictionary, hasLocale } from "./dictionaries";

const LEVELS = [
  { slug: "a1", level: "A1", tone: "orange" },
  { slug: "a2", level: "A2", tone: "rose" },
  { slug: "b1", level: "B1", tone: "emerald" },
  { slug: "b2", level: "B2", tone: "brown" },
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

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={nav} />

      <main className="min-h-screen flex-1 bg-[#fff8ed] px-3 pb-10 pt-4 text-[#2a1811] dark:bg-[#081612] dark:text-white sm:px-5 lg:px-7">
        <section className="mx-auto max-w-[1480px]">
          <Reveal>
            <HeroRail />
          </Reveal>

          <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.92fr)_minmax(360px,1fr)]">
            <Reveal>
              <section className="relative overflow-hidden rounded-[28px] border border-[#ead8c4] bg-[linear-gradient(135deg,#fffdf9_0%,#fff6e9_100%)] p-6 shadow-[0_16px_35px_rgba(113,72,37,0.13)] sm:p-9 dark:border-white/10 dark:bg-[#10241e]">
                <ArchBackdrop />
                <div className="relative z-10 max-w-[500px]">
                  <p className="inline-flex items-center gap-2 rounded-lg border border-[#edcda8] bg-[#fffaf2]/90 px-2.5 py-1.5 text-xs font-bold text-[#9a421e] dark:border-white/15 dark:bg-white/10 dark:text-[#ffc78e]"><ShieldCheck className="size-4" aria-hidden /> {copy.pathKicker}</p>
                  <h1 className="mt-4 max-w-[520px] font-serif text-4xl font-medium leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[56px]">{copy.pathTitle}</h1>
                  <p className="mt-4 max-w-[470px] text-sm leading-6 text-[#6f5141] sm:text-base dark:text-white/70">{copy.pathBody}</p>
                  <Link href={`/${lang}/vocabulary`} className="mt-4 inline-flex items-center gap-3 text-sm font-bold text-[#bf4f22] transition hover:gap-4 dark:text-[#ffbb86]">{copy.allLevels}<ArrowRight className="size-4" aria-hidden /></Link>
                </div>

                <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {LEVELS.map((item, index) => (
                    <LevelCard
                      key={item.level}
                      href={`/${lang}/preview/${item.slug}`}
                      level={item.level}
                      title={shelfLabels[item.slug]?.name.split("·").at(-1)?.trim() ?? item.level}
                      description={shelfLabels[item.slug]?.desc ?? ""}
                      words={catalog ? new Intl.NumberFormat(lang).format(catalog.levels[item.level] ?? 0) : "-"}
                      wordsLabel={library.words}
                      previewLabel={copy.previewLevel}
                      tone={item.tone}
                      delay={index}
                    />
                  ))}
                </div>

                <LearningFeatures />
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <IeltsPanel lang={lang} copy={copy} />
            </Reveal>
          </section>
        </section>
      </main>

      <footer className="mt-4 border-t border-line/70 py-7">
        <div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-3 px-5 text-sm text-ink-soft sm:flex-row">
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


function LevelCard({
  href,
  level,
  title,
  description,
  words,
  wordsLabel,
  previewLabel,
  tone,
  delay,
}: {
  href: string;
  level: string;
  title: string;
  description: string;
  words: string;
  wordsLabel: string;
  previewLabel: string;
  tone: "orange" | "rose" | "emerald" | "brown";
  delay: number;
}) {
  const styles = {
    orange: {
      badge: "bg-[#cf5e30]",
      accent: "text-[#c94e26]",
      border: "border-[#efcbb9] hover:border-[#de7146]",
      arch: "border-[#e8c9b1] bg-[#f9ecdf]",
      leaf: "bg-[#b26c3c]",
    },
    rose: {
      badge: "bg-[#b8422a]",
      accent: "text-[#ad3a27]",
      border: "border-[#efd2c4] hover:border-[#db8062]",
      arch: "border-[#e8bdaa] bg-[#fbe8df]",
      leaf: "bg-[#b95c46]",
    },
    emerald: {
      badge: "bg-[#3e7975]",
      accent: "text-[#2e6864]",
      border: "border-[#d3dfd9] hover:border-[#7da5a0]",
      arch: "border-[#b9cbc6] bg-[#e8efeb]",
      leaf: "bg-[#5f8e7b]",
    },
    brown: {
      badge: "bg-[#65351d]",
      accent: "text-[#60371e]",
      border: "border-[#e8d6c1] hover:border-[#b88456]",
      arch: "border-[#dec6aa] bg-[#f7ecdf]",
      leaf: "bg-[#9b7047]",
    },
  }[tone];

  return (
    <Link href={href} className={`group relative min-h-[264px] overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,#fffefa,#fff7ed)] p-4 shadow-[0_9px_19px_rgba(108,66,35,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(108,66,35,0.13)] dark:bg-[#14231e] ${styles.border}`}>
      <span className={`relative z-10 flex size-11 items-center justify-center rounded-full text-base font-bold text-white shadow-[0_7px_16px_rgba(73,37,20,0.22)] ${styles.badge}`}>{level}</span>
      <LevelArch styles={styles} delay={delay} />
      <div className="relative z-10 mt-3 flex h-[154px] flex-col">
        <h2 className="text-lg font-medium tracking-[-0.04em] text-[#332017] dark:text-white">{title}</h2>
        <p className="mt-1 max-w-[140px] text-xs leading-5 text-[#765d4e] dark:text-white/62">{description}</p>
        <p className={`mt-auto flex items-center gap-1.5 text-xs font-medium ${styles.accent}`}><BookOpen className="size-3.5" aria-hidden />{words} {wordsLabel}</p>
      </div>
      <span className={`relative z-10 mt-3 inline-flex w-full items-center justify-between rounded-lg border bg-white/65 px-3 py-2 text-xs font-semibold dark:bg-white/5 ${styles.border} ${styles.accent}`}>{previewLabel}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
    </Link>
  );
}

function LevelArch({ styles, delay }: { styles: { arch: string; leaf: string }; delay: number }) {
  return <div aria-hidden className="pointer-events-none absolute right-2 top-5 h-[120px] w-[92px] opacity-90"><span className={`absolute bottom-0 left-1/2 h-[100px] w-[65px] -translate-x-1/2 rounded-t-[44px] border-[4px] shadow-[inset_0_0_0_9px_rgba(255,255,255,0.48)] ${styles.arch}`}><span className={`absolute bottom-0 left-1/2 h-11 w-3.5 -translate-x-1/2 rounded-t-full ${styles.leaf}`} /><span className={`absolute bottom-8 left-[16px] h-4 w-7 rotate-[-25deg] rounded-[100%_0_100%_0] ${styles.leaf}`} /><span className={`absolute bottom-[41px] left-[31px] h-4 w-7 rotate-[25deg] rounded-[0_100%_0_100%] ${styles.leaf}`} /></span><span className="absolute bottom-0 left-1/2 h-2.5 w-[88px] -translate-x-1/2 rounded-sm bg-[#c59e7f]/25" /><i className="absolute right-1 top-4 text-sm text-[#d69b64]/65">{delay % 2 ? "✦" : "·"}</i></div>;
}

function HeroRail() {
  const tiles = [
    { src: "/images/vocora-study-kitten.png", label: "SO‘Z BOYLIGI" },
    { src: "/images/vocora-study-desk-hero.png", label: "GRAMMATIKA" },
    { src: "/images/vocora-study-desk-hero.png", label: "IELTS" },
  ];
  return <section className="relative min-h-[162px] overflow-hidden rounded-[0_0_25px_25px] border border-[#45291b] bg-[#211109] px-5 py-4 shadow-[0_18px_32px_rgba(55,28,16,0.17)] sm:px-9 lg:flex lg:items-center lg:gap-7"><Image src="/images/vocora-study-desk-hero.png" alt="" fill priority sizes="1480px" className="pointer-events-none object-cover object-[71%_54%] opacity-55 mix-blend-screen" /><div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#211109_0%,rgba(33,17,9,0.92)_31%,rgba(33,17,9,0.66)_67%,rgba(33,17,9,0.9)_100%)]" /><div className="relative z-10 flex shrink-0 gap-2">{tiles.map((tile) => <div key={tile.label} className="w-[86px]"><div className="relative h-[86px] overflow-hidden rounded-xl border border-[#945422] bg-[#160b06]"><Image src={tile.src} alt="" fill sizes="86px" className={tile.label === "SO‘Z BOYLIGI" ? "object-cover object-center" : "object-cover object-[78%_80%]"} /></div><p className="mt-1 text-center text-[10px] font-bold text-[#f7ddbc]">{tile.label}</p></div>)}</div><div className="relative z-10 mt-5 flex items-center gap-4 lg:mt-0 lg:ml-1"><span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#7f4d2a] text-[#f7d2a0]"><ArrowRight className="size-5" /></span><p className="max-w-[355px] text-sm leading-6 text-[#f5e0c8]"><b className="block font-medium text-[#da8240]">TO‘LIQ INGLIZ TILI YO‘LI</b>A1 dan C2 gacha — har bir daraja o‘z lug‘ati va mashqlari bilan.</p></div><div className="relative z-10 mt-4 inline-flex items-center gap-3 rounded-xl border border-[#7f4d2a] bg-[#24120a]/75 px-4 py-3 text-xs text-[#f5dfc8] lg:mt-0 lg:ml-auto"><Sparkles className="size-6 text-[#d87d2f]" /><span><b className="block font-medium">O‘ZBEK TILIDA</b>IZOHLAR VA TARJIMALAR<br />ONA TILINGIZDA</span></div></section>;
}

function ArchBackdrop() {
  return <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[285px] w-[53%] overflow-hidden opacity-50 lg:block"><div className="absolute -right-8 bottom-0 h-[258px] w-[265px] rounded-t-[145px] border-[14px] border-[#f0dbc3] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,220,190,0.58))] shadow-[inset_0_0_0_28px_rgba(255,250,241,0.56)]" /><div className="absolute bottom-0 right-[224px] h-[150px] w-[102px] rounded-t-[60px] border-[8px] border-[#ebd4bc] bg-[#fff9ef]/60" /><div className="absolute bottom-4 right-20 h-10 w-[320px] rounded-sm bg-[#e4c6a5]/36" /></div>;
}

function LearningFeatures() {
  const items = [
    { icon: BrainCircuit, title: "Ilmiy takrorlash (SRS)", text: "Yodda qolishi isbotlangan takrorlash tizimi." },
    { icon: MessageCircle, title: "O‘zbekcha va ruscha izohlar", text: "So‘zlar ona tilingizda tushuntiriladi." },
    { icon: ShieldCheck, title: "IELTS va CEFR yo‘nalishi", text: "A1 dan C2 gacha aniq reja." },
    { icon: Gamepad2, title: "O‘yin, ammo bosimsiz", text: "Qiziqarli jarayon, erkin o‘rganish muhiti." },
  ];
  return <div className="relative z-10 mt-4 grid gap-2 rounded-2xl border border-[#ead8c4] bg-[#fffaf3]/75 p-3 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/5">{items.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-2.5 px-1.5 py-2 lg:border-r lg:border-[#eddcca] lg:last:border-0 dark:lg:border-white/10"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f8ead9] text-[#9d552a] dark:bg-white/10 dark:text-[#ffc38b]"><Icon className="size-4" /></span><p className="text-[11px] leading-4 text-[#806653] dark:text-white/60"><b className="block text-xs font-semibold text-[#4e3021] dark:text-white">{title}</b>{text}</p></div>)}</div>;
}

function IeltsPanel({ lang, copy }: { lang: string; copy: (typeof homeCopy)[Locale] }) {
  const featureIcons = [Crown, MessageCircle, BookOpen, Sparkles];
  return <section className="relative flex min-h-[560px] overflow-hidden rounded-[28px] border border-[#4d2b1b] bg-[#24130b] p-7 text-[#fff5e8] shadow-[0_18px_38px_rgba(65,30,13,0.2)] sm:p-9"><Image src="/images/vocora-study-desk-hero.png" alt="" fill sizes="(max-width: 1280px) 100vw, 490px" className="pointer-events-none object-cover object-[77%_32%] opacity-25 mix-blend-screen" /><div aria-hidden className="absolute -right-28 -top-24 size-[480px] rounded-full border border-[#d69048]/25" /><div aria-hidden className="absolute -right-10 -top-9 size-[320px] rounded-full border border-[#d69048]/22" /><div aria-hidden className="absolute bottom-0 left-0 h-32 w-[62%] bg-[#a64a22] [clip-path:polygon(0_28%,100%_100%,0_100%)]" /><div className="relative z-10 flex w-full flex-col"><p className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#b8793d] bg-[#2b170d]/80 px-3 py-2 text-xs font-semibold text-[#f6d7ad]"><GraduationCap className="size-4" />IELTS</p><h2 className="mt-7 max-w-[440px] font-serif text-4xl leading-[1.1] tracking-[-0.045em] sm:text-[43px]">{copy.ieltsTitle}</h2><p className="mt-4 max-w-[430px] text-sm leading-6 text-[#f0daca]">{copy.ieltsBody}</p><div className="mt-7 space-y-2">{copy.ieltsFeatures.map((feature, index) => { const Icon = featureIcons[index] ?? Sparkles; return <div key={feature} className="flex items-center gap-3 rounded-lg border border-[#674122]/80 bg-[#28160d]/70 px-3 py-2.5 text-sm text-[#f6e4d0]"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#714724] bg-[#3b210f] text-[#e2ad6b]"><Icon className="size-4" /></span>{feature}</div>; })}</div><Link href={`/${lang}/ielts`} className="mt-auto inline-flex items-center justify-center gap-3 rounded-xl border border-[#f1bf81] bg-[linear-gradient(135deg,#bc7439,#edb36d)] px-5 py-4 text-base font-medium text-white shadow-[0_8px_22px_rgba(0,0,0,0.2)] transition hover:brightness-110">{copy.openIelts}<ArrowRight className="size-5" /></Link></div></section>;
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
  },
};
