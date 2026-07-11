"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Plus, Volume2 } from "lucide-react";

import { speak } from "@/lib/games";
import type { WordListItem } from "@/lib/vocab";
import { cn } from "@/lib/utils";

export function WordCard({
  word,
  lang,
  accentText,
  added,
  onAdd,
  labels,
}: {
  word: WordListItem;
  lang: string;
  accentText: string;
  added: boolean;
  onAdd: () => void;
  labels: { add: string; addedLabel: string; listen: string };
}) {
  const translation =
    lang === "ru" ? word.primary_translation_ru : word.primary_translation_uz;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="flex h-full flex-col rounded-2xl border border-line/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        {word.image_url && (
          <Image
            src={word.image_url}
            alt={word.headword}
            width={56}
            height={56}
            unoptimized
            className="size-14 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold tracking-tight text-ink">
            {word.headword}
          </h3>
          <p className={cn("truncate font-semibold", accentText)}>{translation}</p>
        </div>
        <button
          type="button"
          onClick={() => speak(word.headword)}
          title={labels.listen}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-soft transition-colors hover:bg-brand-600/10 hover:text-brand-600 dark:bg-white/10 dark:hover:text-brand-300"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium text-ink-soft dark:bg-white/10">
          {word.pos}
        </span>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-medium text-ink-soft dark:bg-white/10">
          {word.cefr_level}
        </span>
        {word.ipa && <span className="text-ink-soft/70">/{word.ipa}/</span>}
      </div>

      {word.primary_example_en && (
        <p className="mt-3 border-l-2 border-line pl-3 text-sm italic leading-relaxed text-ink-soft">
          {word.primary_example_en}
        </p>
      )}

      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={added}
          onClick={onAdd}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-colors",
            added
              ? "bg-success/10 text-success"
              : "bg-brand-600/10 text-brand-600 hover:bg-brand-600/20 dark:text-brand-300"
          )}
        >
          {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          {added ? labels.addedLabel : labels.add}
        </button>
      </div>
    </motion.div>
  );
}
