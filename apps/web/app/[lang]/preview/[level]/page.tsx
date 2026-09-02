import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VocabularyWordCard } from "@/components/library/vocabulary-word-card";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { fetchWords } from "@/lib/vocab";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function generateStaticParams() {
  return LEVELS.flatMap((level) =>
    ["uz", "ru", "en"].map((lang) => ({ lang, level: level.toLowerCase() }))
  );
}

export default async function PublicLevelPreview({
  params,
}: {
  params: Promise<{ lang: string; level: string }>;
}) {
  const { lang, level: rawLevel } = await params;
  if (!hasLocale(lang)) notFound();
  const level = rawLevel.toUpperCase();
  if (!LEVELS.includes(level as (typeof LEVELS)[number])) notFound();

  const dict = await getDictionary(lang);
  const words = await fetchWords({ level, page: 1, pageSize: 5 });
  const copy = dict.preview;

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href={`/${lang}/vocabulary`}
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {copy.allLevels}
        </Link>

        <section className="mt-5 grid gap-6 border-b border-line pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-brand-400/20 bg-brand-600/8 px-3 py-2 text-xs font-black text-brand-700 dark:text-brand-200">
              <BookOpen className="size-4" aria-hidden />
              {copy.sample}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight text-ink sm:text-5xl">
              {copy.title.replace("{level}", level)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {copy.subtitle.replace("{count}", "5")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${lang}/vocabulary?level=${level}`}>
              <Button variant="secondary">{copy.viewAll}</Button>
            </Link>
            <Link href={`/${lang}/auth/register`}>
              <Button>
                {copy.start}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>

        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {words.items.map((word) => (
            <li key={word.id} className="h-full">
              <VocabularyWordCard
                word={word}
                lang={lang}
                labels={{
                  listen: dict.library.listen,
                  flip: dict.library.flipCard,
                  unflip: dict.library.flipBack,
                  details: dict.library.viewDetails,
                }}
              />
            </li>
          ))}
        </ul>

        <section className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-6 text-ink-soft">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            {copy.note}
          </p>
          <Link href={`/${lang}/auth/register`} className="shrink-0">
            <Button>{copy.createPath}</Button>
          </Link>
        </section>
      </main>
    </>
  );
}
