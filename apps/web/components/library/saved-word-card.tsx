"use client";

import { ArrowUpRight, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";

import { WordFlipCard } from "@/components/ui/word-flip-card";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { CardOut } from "@/lib/flashcards";
import { speak } from "@/lib/games";

export function SavedWordCard({
  card,
  lang,
  labels,
  onDelete,
}: {
  card: CardOut;
  lang: string;
  labels: Dictionary["library"];
  onDelete: () => void;
}) {
  const word = card.word;
  const sense = word?.senses[0];
  const translation =
    (lang === "ru" ? sense?.translation_ru : sense?.translation_uz) ?? card.back_text;
  const frontText = word?.headword ?? card.front_text ?? "";
  const example = sense?.examples[0];

  return (
    <WordFlipCard
      minHeight={260}
      frontLabel={`${frontText}. ${labels.flipCard}`}
      backLabel={`${frontText}. ${labels.flipBack}`}
      flipTitle={labels.flipCard}
      unflipTitle={labels.flipBack}
      frontActions={
        word ? (
          <button
            type="button"
            onClick={() => speak(word.headword)}
            aria-label={labels.listen}
            title={labels.listen}
            className="flex size-11 items-center justify-center rounded-md border border-line/70 bg-raised text-ink-soft shadow-[2px_3px_0_rgb(84,37,15,0.12)] transition-all hover:-translate-y-0.5 hover:text-brand-600 dark:hover:text-brand-300"
          >
            <Volume2 className="size-4" />
          </button>
        ) : undefined
      }
      backActions={
        <>
          {word && (
            <Link
              href={`/${lang}/words/${word.slug}`}
              className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-brand-950 bg-brand-600 px-3 text-sm font-bold text-white shadow-[2px_3px_0_#54250f] transition-all hover:-translate-y-0.5 hover:bg-brand-500"
            >
              <span className="truncate">{labels.viewDetails}</span>
              <ArrowUpRight className="size-4 shrink-0" />
            </Link>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label={labels.delete}
            title={labels.delete}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 text-danger-text transition-all hover:-translate-y-0.5 hover:bg-danger/20"
          >
            <Trash2 className="size-4" />
          </button>
        </>
      }
      front={
        <div className="flex h-full flex-col p-5">
          <div className="pr-12">
            <div className="flex flex-wrap items-center gap-2">
              {word && (
                <span className="print-label border-brand-600 bg-brand-600/10 px-2 py-1 text-brand-600 dark:text-brand-300">
                  {word.cefr_level}
                </span>
              )}
              {word?.pos && <span className="text-xs font-bold text-ink-soft">{word.pos}</span>}
            </div>
            <h2 className="mt-5 break-words text-2xl font-black tracking-tight text-ink">
              {frontText}
            </h2>
            {word?.ipa && <p className="mt-1 text-sm text-ink-soft">/{word.ipa}/</p>}
          </div>
          {example?.text_en && (
            <p className="mt-auto line-clamp-2 border-l-2 border-brand-400/30 pl-3 text-sm leading-relaxed text-ink-soft">
              {example.text_en}
            </p>
          )}
        </div>
      }
      back={
        <div className="flex h-full flex-col p-5 pb-20">
          <p className="pr-7 text-xs font-black uppercase text-ink-soft">{frontText}</p>
          <p className="mt-4 break-words text-2xl font-black leading-tight text-ink">
            {translation}
          </p>
          {sense?.definition_en && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">
              {sense.definition_en}
            </p>
          )}
          {example?.text_en && (
            <p className="mt-4 line-clamp-2 border-l-2 border-accent-400/40 pl-3 text-sm leading-relaxed text-ink-soft">
              {example.text_en}
            </p>
          )}
        </div>
      }
    />
  );
}
