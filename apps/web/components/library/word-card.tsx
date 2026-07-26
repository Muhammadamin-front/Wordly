"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Plus, Volume2 } from "lucide-react";

import { createTiltHandlers } from "@/components/ui/tilt-card";
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
  labels: { add: string; addedLabel: string; listen: string };
}) {
  const translation = lang === "ru" ? word.primary_translation_ru : word.primary_translation_uz;
  const tilt = createTiltHandlers({ rotateX: 10, rotateY: 12, lift: -6 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onPointerCancel={tilt.onPointerCancel}
      className="premium-card group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 p-5 shadow-[0_20px_58px_rgba(8,12,20,0.12)]"
    >
      <button
        type="button"
        aria-label={`${word.headword}: ${translation ?? ""}`}
        onClick={onOpen}
        className="absolute inset-0 z-[15] cursor-pointer"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,60,255,0.12),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(20,184,166,0.12),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light [background-image:linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] [background-size:18px_18px]" />

      <div className="relative z-20 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {word.image_url && (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/30 shadow-[0_12px_30px_rgba(8,12,20,0.08)]">
              <Image
                src={word.image_url}
                alt={word.headword}
                width={56}
                height={56}
                unoptimized
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/14 via-transparent to-white/10" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-black tracking-tight text-ink">{word.headword}</h3>
            <p className={cn("truncate text-sm font-semibold", accentText)}>{translation}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            speak(word.headword);
          }}
          title={labels.listen}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line/70 bg-raised/80 text-ink-soft shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-600 dark:hover:text-brand-300"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full border border-line/70 bg-card/60 px-2.5 py-1 font-bold text-ink-soft backdrop-blur-xl">
          {word.pos}
        </span>
        <span className="rounded-full border border-brand-400/20 bg-brand-600/10 px-2.5 py-1 font-bold text-brand-600 dark:text-brand-300 backdrop-blur-xl">
          {word.cefr_level}
        </span>
        {word.ipa && <span className="text-ink-soft/70">/{word.ipa}/</span>}
      </div>

      {word.primary_example_en && (
        <p className="relative z-10 mt-4 border-l-2 border-brand-400/30 pl-3 text-sm leading-relaxed text-ink-soft">
          {word.primary_example_en}
        </p>
      )}

      <div className="relative z-20 mt-auto pt-4">
        <button
          type="button"
          disabled={added}
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all",
            added
              ? "border border-success/20 bg-success/10 text-success"
              : "border border-brand-400/20 bg-brand-600/10 text-brand-600 hover:-translate-y-0.5 hover:bg-brand-600/16 dark:text-brand-300"
          )}
        >
          {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          {added ? labels.addedLabel : labels.add}
        </button>
      </div>
    </motion.div>
  );
}
