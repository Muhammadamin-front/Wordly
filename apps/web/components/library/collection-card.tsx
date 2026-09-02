"use client";

import { motion } from "framer-motion";
import { Download, FolderHeart, Play, Trash2, Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createTiltHandlers } from "@/components/ui/tilt-card";
import type { Deck } from "@/lib/flashcards";

export function CollectionCard({
  lang,
  deck,
  labels,
  onImport,
  onExport,
  onDelete,
}: {
  lang: string;
  deck: Deck;
  labels: { cards: string; due: string; review: string; import: string; export: string; delete: string };
  onImport: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const tilt = createTiltHandlers({ rotateX: 8, rotateY: 10, lift: -7 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      onPointerCancel={tilt.onPointerCancel}
      className="premium-card group relative flex h-full flex-col overflow-hidden rounded-[14px] p-5"
    >
      <div aria-hidden className="absolute -right-10 -top-12 size-36 rounded-full border border-brand-400/25 bg-brand-500/10" />
      <div aria-hidden className="absolute -bottom-14 -left-10 size-36 rounded-full border border-accent-500/25 bg-accent-500/10" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-brand-600 shadow-[2px_3px_0_rgb(84,37,15,0.14)] dark:text-brand-300">
            <FolderHeart className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-tight text-ink">{deck.name}</h3>
            {deck.description && <p className="truncate text-sm text-ink-soft">{deck.description}</p>}
          </div>
        </div>
        <span className="print-label border-line bg-raised text-ink-soft">
          {deck.due_count} due
        </span>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-raised px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{labels.cards}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink">{deck.card_count}</p>
        </div>
        <div className="rounded-md border border-brand-400/30 bg-brand-500/8 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
            {labels.due}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink">{deck.due_count}</p>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
        <Link href={`/${lang}/review?deck=${deck.id}`}>
          <Button size="sm">
            <Play className="mr-1 size-3.5" /> {labels.review}
          </Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onImport} title={labels.import}>
          <Upload className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onExport} title={labels.export}>
          <Download className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-danger-text" onClick={onDelete} title={labels.delete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
