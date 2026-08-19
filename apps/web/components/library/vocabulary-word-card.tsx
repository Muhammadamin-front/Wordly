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
      responsiveHeightClass="min-h-40 sm:min-h-[238px]"
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
          className="flex size-7 items-center justify-center rounded-md border border-line bg-raised text-ink-soft shadow-[2px_2px_0_rgb(84,37,15,0.16)] transition-all hover:-translate-y-0.5 hover:text-brand-600 sm:size-9 dark:hover:text-brand-300"
        >
          <Volume2 className="size-3 sm:size-4" />
        </button>
      }
      backActions={
        <Link
          href={`/${lang}/words/${word.slug}`}
          className="flex h-7 w-full items-center justify-center gap-1 rounded-md border border-brand-950 bg-brand-600 px-1 text-[10px] font-bold text-white shadow-[2px_3px_0_#54250f] transition-all hover:-translate-y-0.5 hover:bg-brand-500 sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {labels.details}
          <ArrowUpRight className="size-4" />
        </Link>
      }
      front={
        <div className="flex h-full flex-col p-2 sm:p-5">
          <div className="pr-7 sm:pr-12">
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <span className="print-label border-brand-600 bg-brand-600/10 px-1.5 py-0.5 text-[9px] text-brand-600 sm:px-2 sm:py-1 sm:text-[11px] dark:text-brand-300">
                {word.cefr_level}
              </span>
              <span className="truncate text-[9px] font-bold text-ink-soft sm:text-xs">{word.pos}</span>
            </div>
            <h2 className="mt-3 truncate font-display text-xl tracking-wide text-ink sm:mt-5 sm:text-4xl">
              {word.headword}
            </h2>
            {word.ipa && <p className="mt-1 hidden text-sm text-ink-soft sm:block">/{word.ipa}/</p>}
          </div>
          {word.primary_example_en && (
            <p className="mt-auto line-clamp-3 border-l border-brand-400/60 pl-1.5 text-[9px] leading-snug text-ink-soft sm:line-clamp-2 sm:border-l-2 sm:pl-3 sm:text-sm sm:leading-relaxed">
              {word.primary_example_en}
            </p>
          )}
        </div>
      }
      back={
        <div className="flex h-full flex-col p-2 pb-10 sm:p-5 sm:pb-20">
          <p className="truncate pr-5 text-[9px] font-black uppercase text-ink-soft sm:pr-7 sm:text-xs">{word.headword}</p>
          <p className="mt-2 line-clamp-3 font-display text-2xl leading-none tracking-wide text-ink sm:mt-4 sm:text-4xl">{primaryTranslation}</p>
          {lang !== "ru" && word.primary_translation_ru && (
            <p className="mt-1 line-clamp-2 text-[9px] font-semibold text-ink-soft sm:mt-2 sm:text-sm">
              {word.primary_translation_ru}
            </p>
          )}
          {word.category && (
            <span className="print-label mt-2 line-clamp-2 w-fit border-accent-600 bg-accent-500/10 px-1.5 py-0.5 text-[9px] text-accent-600 sm:mt-4 sm:px-2.5 sm:py-1 sm:text-xs dark:text-accent-300">
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
