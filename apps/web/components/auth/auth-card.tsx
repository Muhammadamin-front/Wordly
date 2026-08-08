import Image from "next/image";
import type { ReactNode } from "react";
import { BarChart3, BookOpenText, Clock3, Sparkles } from "lucide-react";

import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import type { Locale } from "@/lib/locales";

const marketing = {
  uz: {
    eyebrow: "O'zbeklar uchun yaratilgan ingliz tili platformasi",
    title: "Har bir yangi so'z yangi imkoniyat.",
    copy: "10 000+ so'z, aqlli takrorlash va amaliy mashqlar bilan ishonchli o'rganing.",
    words: "Keng so'zlar bazasi",
    levels: "Bosqichma-bosqich",
    progress: "Aniq natijalar",
    wordsCopy: "So'zlar va iboralar doim yoningizda.",
    levelsCopy: "CEFR darajangizga mos o'quv yo'li.",
    progressCopy: "Har kuni o'sishingizni kuzating.",
    daily: "Bugungi maqsad",
    minutes: "10 daqiqa",
    footer: "Ingliz tilini o'rganish endi yanada oson.",
  },
  en: {
    eyebrow: "English learning, designed for real progress",
    title: "Every new word opens a new possibility.",
    copy: "Learn confidently with 10,000+ words, smart review, and practical exercises.",
    words: "Rich vocabulary",
    levels: "Clear learning path",
    progress: "Visible progress",
    wordsCopy: "Words and expressions ready when you are.",
    levelsCopy: "A study path matched to your CEFR level.",
    progressCopy: "See your growth every single day.",
    daily: "Today's goal",
    minutes: "10 minutes",
    footer: "A calmer, smarter way to learn English.",
  },
  ru: {
    eyebrow: "Английский язык с понятным прогрессом",
    title: "Каждое новое слово открывает возможности.",
    copy: "Учитесь уверенно: 10 000+ слов, умное повторение и практические задания.",
    words: "Большой словарь",
    levels: "Понятный путь",
    progress: "Видимый прогресс",
    wordsCopy: "Слова и выражения всегда под рукой.",
    levelsCopy: "Обучение под ваш уровень CEFR.",
    progressCopy: "Следите за ростом каждый день.",
    daily: "Цель на сегодня",
    minutes: "10 минут",
    footer: "Учить английский стало проще.",
  },
} as const;

export function AuthCard({
  lang,
  title,
  subtitle,
  children,
  showcase = false,
}: {
  lang: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  showcase?: boolean;
}) {
  if (showcase) {
    const locale = (lang in marketing ? lang : "uz") as keyof typeof marketing;
    const copy = marketing[locale];

    return (
      <main className="relative flex min-h-dvh flex-1 overflow-hidden bg-[#061a18] p-3 sm:p-5 lg:p-7">
        <div aria-hidden className="auth-background" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full max-w-[1500px] overflow-hidden rounded-[26px] border border-white/10 bg-[#0a2a25] shadow-[0_36px_120px_rgba(0,0,0,0.48)] sm:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="auth-showcase relative hidden min-h-0 overflow-hidden lg:flex lg:flex-col">
            <div className="relative z-10 flex items-center justify-between px-10 pt-9 xl:px-14 xl:pt-11">
              <Logo lang={lang} className="text-2xl" />
              <p className="max-w-[220px] text-right text-xs font-semibold leading-relaxed text-brand-950/55">
                {copy.eyebrow}
              </p>
            </div>

            <div className="relative z-10 flex min-h-0 flex-1 flex-col px-10 pb-8 pt-8 xl:px-14">
              <div className="max-w-[590px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/64 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm backdrop-blur">
                  <Sparkles className="size-3.5" aria-hidden />
                  {copy.eyebrow}
                </div>
                <h2 className="mt-5 max-w-[560px] text-4xl font-black leading-[1.02] text-[#092e29] xl:text-5xl">
                  {copy.title}
                </h2>
                <p className="mt-4 max-w-[520px] text-sm font-medium leading-6 text-[#536b65] xl:text-base">
                  {copy.copy}
                </p>
              </div>

              <div className="relative mt-7 min-h-[260px] flex-1 overflow-hidden rounded-[28px] border border-brand-900/10 bg-[#dfe9e3] shadow-[0_24px_60px_rgba(22,72,61,0.16)]">
                <Image
                  src="/images/vocora-uzbek-student-hero.png"
                  alt="A student learning English with Vocora"
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 0px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,249,244,0.18),transparent_44%),linear-gradient(0deg,rgba(4,36,31,0.18),transparent_45%)]" />
                <div className="absolute bottom-5 left-5 rounded-2xl border border-white/65 bg-white/82 p-4 shadow-[0_16px_38px_rgba(7,48,41,0.18)] backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase text-brand-700/65">{copy.daily}</p>
                  <div className="mt-2 flex items-center gap-2 text-brand-950">
                    <Clock3 className="size-5 text-[#583ee7]" aria-hidden />
                    <span className="text-lg font-black">{copy.minutes}</span>
                  </div>
                </div>
                <div className="absolute right-5 top-5 rounded-2xl border border-white/65 bg-white/82 px-4 py-3 shadow-[0_16px_38px_rgba(7,48,41,0.16)] backdrop-blur-xl">
                  <p className="text-xs font-bold text-brand-800">10 000+</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">words & expressions</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { icon: BookOpenText, label: copy.words, detail: copy.wordsCopy },
                  { icon: Clock3, label: copy.levels, detail: copy.levelsCopy },
                  { icon: BarChart3, label: copy.progress, detail: copy.progressCopy },
                ].map(({ icon: FeatureIcon, label, detail }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                      <FeatureIcon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <strong className="block text-xs font-extrabold text-brand-950">
                        {label}
                      </strong>
                      <span className="mt-1 block text-[10px] font-medium leading-4 text-ink-soft">
                        {detail}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex min-h-0 flex-col bg-[linear-gradient(145deg,#123d36_0%,#092e29_48%,#061d1a_100%)] px-5 py-5 sm:px-9 sm:py-7 lg:px-12 xl:px-20">
            <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative z-10 flex items-center justify-between lg:justify-end">
              <Logo lang={lang} tone="inverse" className="lg:hidden" />
              <LocaleSwitcher current={locale as Locale} tone="dark" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-8 sm:py-10">
              <div className="mb-7">
                <span className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-[#6ef0d2] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
                  <Sparkles className="size-5" aria-hidden />
                </span>
                <h1 className="text-3xl font-black text-white sm:text-4xl">{title}</h1>
                <p className="mt-2 text-sm font-medium text-white/56 sm:text-base">{subtitle}</p>
              </div>
              {children}
            </div>

            <p className="relative z-10 text-center text-xs font-medium text-white/32">
              © 2026 Vocora. {copy.footer}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(40,135,115,0.12),transparent_34%,rgba(210,168,79,0.1)_62%,transparent)]"
      />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo lang={lang} className="text-2xl" />
        </div>
        <div className="surface-panel rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-black text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
