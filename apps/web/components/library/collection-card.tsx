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
      className="premium-card group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 p-6 shadow-[0_20px_60px_rgba(8,12,20,0.14)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(124,60,255,0.18),transparent_30%),radial-gradient(circle_at_84%_10%,rgba(20,184,166,0.16),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light [background-image:linear-gradient(135deg,rgba(255,255,255,0.11)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.11)_50%,rgba(255,255,255,0.11)_75%,transparent_75%,transparent)] [background-size:18px_18px]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/20 text-brand-600 shadow-[0_10px_25px_rgba(16,24,40,0.08)] backdrop-blur-2xl dark:text-white">
            <FolderHeart className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-tight text-ink">{deck.name}</h3>
            {deck.description && <p className="truncate text-sm text-ink-soft">{deck.description}</p>}
          </div>
        </div>
        <span className="rounded-full border border-line/70 bg-raised/70 px-3 py-1.5 text-xs font-bold text-ink-soft backdrop-blur-xl">
          {deck.due_count} due
        </span>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-line/70 bg-card/50 px-4 py-3 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{labels.cards}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink">{deck.card_count}</p>
        </div>
        <div className="rounded-lg border border-brand-400/20 bg-linear-to-br from-brand-600/10 to-transparent px-4 py-3 backdrop-blur-xl">
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
        <Button size="sm" variant="ghost" className="text-danger" onClick={onDelete} title={labels.delete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
