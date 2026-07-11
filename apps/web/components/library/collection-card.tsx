"use client";

import { motion } from "framer-motion";
import { Download, FolderHeart, Play, Trash2, Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="flex h-full flex-col rounded-2xl border border-line/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-300">
          <FolderHeart className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-ink">{deck.name}</h3>
          {deck.description && (
            <p className="truncate text-sm text-ink-soft">{deck.description}</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {deck.card_count} {labels.cards} ·{" "}
        <span className="font-semibold text-brand-600 dark:text-brand-300">
          {deck.due_count} {labels.due}
        </span>
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
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
