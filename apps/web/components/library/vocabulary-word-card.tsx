"use client";

import { ArrowUpRight, Volume2 } from "lucide-react";
import Link from "next/link";

import { WordFlipCard } from "@/components/ui/word-flip-card";
import { speak } from "@/lib/games";
import type { WordListItem } from "@/lib/vocab";

export function VocabularyWordCard({
  word,
  lang,
  labels,
}: {
  word: WordListItem;
  lang: string;
  labels: {
    listen: string;
    flip: string;
    unflip: string;
    details: string;
  };
}) {
  const primaryTranslation =
    lang === "ru" ? word.primary_translation_ru : word.primary_translation_uz;

  return (
    <WordFlipCard
      minHeight={238}
      frontLabel={`${word.headword}. ${labels.flip}`}
      backLabel={`${word.headword}. ${labels.unflip}`}
      flipTitle={labels.flip}
      unflipTitle={labels.unflip}
      frontActions={
        <button
          type="button"
          onClick={() => speak(word.headword)}
          aria-label={labels.listen}
          title={labels.listen}
          className="flex size-9 items-center justify-center rounded-full border border-line/70 bg-raised/90 text-ink-soft shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:text-brand-600 dark:hover:text-brand-300"
        >
          <Volume2 className="size-4" />
        </button>
      }
      backActions={
        <Link
          href={`/${lang}/words/${word.slug}`}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-500"
        >
          {labels.details}
          <ArrowUpRight className="size-4" />
        </Link>
      }
      front={
        <div className="flex h-full flex-col p-5">
          <div className="pr-12">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-600/10 px-2 py-1 text-[11px] font-black text-brand-600 dark:text-brand-300">
                {word.cefr_level}
              </span>
              <span className="text-xs font-bold text-ink-soft">{word.pos}</span>
            </div>
            <h2 className="mt-5 truncate text-2xl font-black tracking-tight text-ink">
              {word.headword}
            </h2>
            {word.ipa && <p className="mt-1 text-sm text-ink-soft">/{word.ipa}/</p>}
          </div>
          {word.primary_example_en && (
            <p className="mt-auto line-clamp-2 border-l-2 border-brand-400/30 pl-3 text-sm leading-relaxed text-ink-soft">
              {word.primary_example_en}
            </p>
          )}
        </div>
      }
      back={
        <div className="flex h-full flex-col p-5 pb-20">
          <p className="pr-7 text-xs font-black uppercase text-ink-soft">{word.headword}</p>
          <p className="mt-4 text-2xl font-black leading-tight text-ink">{primaryTranslation}</p>
          {lang !== "ru" && word.primary_translation_ru && (
            <p className="mt-2 text-sm font-semibold text-ink-soft">
              {word.primary_translation_ru}
            </p>
          )}
          {word.category && (
            <span className="mt-4 w-fit rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-bold text-accent-600 dark:text-accent-300">
              {word.category.emoji}{" "}
              {lang === "uz"
                ? word.category.name_uz
                : lang === "ru"
                  ? word.category.name_ru
                  : word.category.name_en}
            </span>
          )}
        </div>
      }
    />
  );
}
