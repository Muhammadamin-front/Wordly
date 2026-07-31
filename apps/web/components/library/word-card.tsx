"use client";

import Image from "next/image";
import { BookOpen, Check, Plus, Volume2 } from "lucide-react";

import { WordFlipCard } from "@/components/ui/word-flip-card";
import { speak } from "@/lib/games";
import type { WordListItem } from "@/lib/vocab";
import { cn } from "@/lib/utils";

export function WordCard({
  word,
  lang,
  accentText,
  added,
  onAdd,
  onOpen,
  labels,
}: {
  word: WordListItem;
  lang: string;
  accentText: string;
  added: boolean;
  onAdd: () => void;
  onOpen: () => void;
  labels: {
    add: string;
    addedLabel: string;
    listen: string;
    flip: string;
    unflip: string;
    details: string;
  };
}) {
  const translation = lang === "ru" ? word.primary_translation_ru : word.primary_translation_uz;

  return (
    <WordFlipCard
      frontLabel={`${word.headword}. ${labels.flip}`}
      backLabel={`${word.headword}. ${labels.unflip}`}
      flipTitle={labels.flip}
      unflipTitle={labels.unflip}
      minHeight={292}
      responsiveHeightClass="min-h-44 sm:min-h-[292px]"
      frontActions={
        <button
          type="button"
          onClick={() => speak(word.headword)}
          title={labels.listen}
          aria-label={labels.listen}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line/70 bg-raised/90 text-ink-soft shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-600 sm:size-10 dark:hover:text-brand-300"
        >
          <Volume2 className="size-3 sm:size-4" />
        </button>
      }
      backActions={
        <>
          <button
            type="button"
            onClick={onOpen}
            title={labels.details}
            aria-label={labels.details}
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-line/70 bg-raised/85 text-ink-soft shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-600 sm:size-11 sm:rounded-lg dark:hover:text-brand-300"
          >
            <BookOpen className="size-4" />
          </button>
          <button
            type="button"
            disabled={added}
            onClick={onAdd}
            className={cn(
              "flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold transition-all sm:h-11 sm:gap-2 sm:rounded-lg sm:px-3 sm:text-sm",
              added
                ? "border border-success/20 bg-success/10 text-success"
                : "border border-brand-400/20 bg-brand-600/10 text-brand-600 hover:-translate-y-0.5 hover:bg-brand-600/16 dark:text-brand-300"
            )}
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />}
            <span className="hidden truncate sm:inline">{added ? labels.addedLabel : labels.add}</span>
          </button>
        </>
      }
      front={
        <div className="flex h-full flex-col p-2 sm:p-5">
          <div className="flex min-w-0 items-start gap-3 pr-7 sm:pr-12">
            {word.image_url && (
              <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/30 shadow-[0_12px_30px_rgba(8,12,20,0.08)] sm:block">
                <Image
                  src={word.image_url}
                  alt={word.headword}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/14 via-transparent to-white/10" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-black tracking-tight text-ink sm:text-xl">
                {word.headword}
              </h3>
              <p className={cn("mt-1 text-[9px] font-bold sm:text-sm", accentText)}>
                {word.cefr_level}
              </p>
            </div>
          </div>

          <div className="mt-2 flex min-w-0 items-center gap-1 text-[9px] sm:mt-5 sm:flex-wrap sm:gap-1.5 sm:text-xs">
            <span className="max-w-full truncate rounded-full border border-line/70 bg-card/60 px-1.5 py-0.5 font-bold text-ink-soft backdrop-blur-xl sm:px-2.5 sm:py-1">
              {word.pos}
            </span>
            {word.ipa && <span className="hidden text-ink-soft/70 sm:inline">/{word.ipa}/</span>}
          </div>

          {word.primary_example_en && (
            <p className="mt-auto line-clamp-3 border-l border-brand-400/30 pl-1.5 text-[9px] leading-snug text-ink-soft sm:border-l-2 sm:pl-3 sm:text-sm sm:leading-relaxed">
              {word.primary_example_en}
            </p>
          )}
        </div>
      }
      back={
        <div className="flex h-full flex-col p-2 pb-10 sm:p-5 sm:pb-20">
          <p className="truncate pr-5 text-[9px] font-black uppercase text-ink-soft sm:pr-7 sm:text-xs">{word.headword}</p>
          <p className="mt-2 line-clamp-3 text-xs font-black leading-tight text-ink sm:mt-4 sm:text-2xl">{translation}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[9px] sm:mt-4 sm:gap-1.5 sm:text-xs">
            <span className="rounded-full bg-brand-600/10 px-2.5 py-1 font-bold text-brand-600 dark:text-brand-300">
              {word.cefr_level}
            </span>
            <span className="rounded-full bg-ink/5 px-2.5 py-1 font-bold text-ink-soft dark:bg-white/10">
              {word.pos}
            </span>
          </div>
          {word.primary_example_en && (
            <p className="mt-2 line-clamp-2 border-l border-accent-400/40 pl-1.5 text-[9px] leading-snug text-ink-soft sm:mt-5 sm:border-l-2 sm:pl-3 sm:text-sm sm:leading-relaxed">
              {word.primary_example_en}
            </p>
          )}
        </div>
      }
    />
  );
}
