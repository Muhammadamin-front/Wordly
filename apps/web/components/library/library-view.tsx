"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { CollectionCard } from "@/components/library/collection-card";
import { LevelCard } from "@/components/library/level-card";
import { SearchPanel } from "@/components/library/search-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  exportDeckCsv,
  flashcardsApi,
  importDeckCsv,
  type Deck,
  type DeckImportReport,
  type Queue,
} from "@/lib/flashcards";
import { libraryApi, SHELVES, type Shelf } from "@/lib/library";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function LibraryView({ lang, t }: { lang: string; t: Dictionary["library"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [shelves, setShelves] = useState<Record<string, Shelf> | null>(null);
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [report, setReport] = useState<DeckImportReport | null>(null);
  const [creating, setCreating] = useState(false);
  const importTarget = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([
      libraryApi.overview(),
      flashcardsApi.decks(),
      flashcardsApi.queue(),
    ]).then(([overview, deckList, q]) => {
      if (cancelled) return;
      setShelves(Object.fromEntries(overview.shelves.map((s) => [s.key, s])));
      setDecks(deckList);
      setQueue(q);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    await flashcardsApi.createDeck(name, String(form.get("description") ?? "") || undefined);
    (event.target as HTMLFormElement).reset();
    setCreating(false);
    reload();
  }

  async function onImportFile(file: File) {
    if (!importTarget.current) return;
    setReport(await importDeckCsv(importTarget.current, file));
    reload();
  }

  if (!ready || !user || shelves === null || decks === null) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="mx-auto h-11 w-72 rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-14 w-full max-w-2xl rounded-2xl" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  // CEFR levels partition the corpus exactly once (category shelves overlap).
  const totalAdded = ["A1", "A2", "B1", "B2", "C1", "C2"].reduce(
    (sum, key) => sum + (shelves[key]?.added ?? 0),
    0
  );
  const shelfStrings = t.shelves as Record<string, { name: string; desc: string }>;
  const labels = {
    words: t.words,
    learned: t.learned,
    continue: t.continue,
    start: t.start,
    soon: t.soon,
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          📚 {t.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-ink-soft sm:text-lg">{t.subtitle}</p>
      </motion.header>

      {/* Corpus-wide search + add */}
      <SearchPanel lang={lang} t={t} />

      {report && (
        <Alert tone={report.errors.length ? "error" : "success"} className="mt-6">
          {report.created} {t.imported} · {report.skipped} {t.skipped}
          {report.errors.length > 0 && ` · ${report.errors[0]}`}
        </Alert>
      )}

      <input
        ref={fileInput}
        type="file"
        accept=".csv,.tsv,text/csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && void onImportFile(e.target.files[0])}
      />

      {/* My cards — everything added via "Add to my cards" lands here */}
      {queue && totalAdded > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-400/40 bg-linear-to-r from-brand-600/10 to-transparent p-5 sm:p-6"
        >
          <Link href={`/${lang}/library/my-cards`} className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-600/15 text-2xl">
              🃏
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-ink">{t.myCards}</h2>
              <p className="text-sm text-ink-soft">
                <strong className="text-ink">{totalAdded}</strong> {t.wordsAdded} ·{" "}
                <strong className="text-brand-600 dark:text-brand-300">
                  {queue.due_count + queue.new_count}
                </strong>{" "}
                {t.due}
              </p>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link href={`/${lang}/library/my-cards`}>
              <Button variant="secondary">{t.manage}</Button>
            </Link>
            <Link href={`/${lang}/review`}>
              <Button>{t.review} →</Button>
            </Link>
          </div>
        </motion.section>
      )}

      {/* Level shelves */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SHELVES.map((meta, i) => {
          const data = meta.soon ? undefined : shelves[meta.key];
          return (
            <motion.div
              key={meta.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <LevelCard
                lang={lang}
                meta={meta}
                strings={shelfStrings[meta.slug]}
                total={data?.total ?? 0}
                learned={data?.learned ?? 0}
                labels={labels}
              />
            </motion.div>
          );
        })}
      </section>

      {/* Your collections */}
      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-brand-600 dark:text-brand-300" />
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.collections}</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{t.collectionsDesc}</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {decks.map((deck) => (
            <CollectionCard
              key={deck.id}
              lang={lang}
              deck={deck}
              labels={{
                cards: t.cards, due: t.due, review: t.review,
                import: t.importCsv, export: t.exportCsv, delete: t.delete,
              }}
              onImport={() => {
                importTarget.current = deck.id;
                fileInput.current?.click();
              }}
              onExport={() => void exportDeckCsv(deck.id, deck.name)}
              onDelete={async () => {
                if (!window.confirm(t.deleteConfirm)) return;
                await flashcardsApi.deleteDeck(deck.id);
                reload();
              }}
            />
          ))}

          {/* Create new collection */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="flex h-full min-h-44 flex-col items-stretch justify-center rounded-2xl border-2 border-dashed border-line bg-card/40 p-6 backdrop-blur-sm"
          >
            {creating ? (
              <form onSubmit={onCreate} className="space-y-3">
                <div>
                  <Label htmlFor="name">{t.deckName}</Label>
                  <Input id="name" name="name" required maxLength={80} autoFocus />
                </div>
                <div>
                  <Label htmlFor="description">{t.deckDesc}</Label>
                  <Input id="description" name="description" maxLength={300} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">{t.create}</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
                    ✕
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex flex-col items-center gap-2 text-ink-soft transition-colors hover:text-ink"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-300">
                  <Plus className="size-6" />
                </span>
                <span className="font-semibold">{t.newCollection}</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
