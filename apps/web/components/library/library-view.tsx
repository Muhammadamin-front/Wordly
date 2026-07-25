"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  Layers3,
  LibraryBig,
  Plus,
  Sparkles,
  Target,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

/** Circular progress ring SVG. */
function CircularProgress({ percent, size = 120 }: { percent: number; size?: number }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-line/40"
      />
      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-brand-600 dark:text-brand-300"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="premium-card rounded-lg px-4 py-3">
      <Icon className={`size-5 ${tone}`} aria-hidden />
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}

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

  async function onCreate(event: { preventDefault: () => void; currentTarget: HTMLFormElement; target: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    await flashcardsApi.createDeck(name, String(form.get("description") ?? "") || undefined);
    event.target.reset();
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
  const totalLearned = ["A1", "A2", "B1", "B2", "C1", "C2"].reduce(
    (sum, key) => sum + (shelves[key]?.learned ?? 0),
    0
  );
  const progressPercent = totalAdded > 0 ? Math.round((totalLearned / totalAdded) * 100) : 0;

  const shelfStrings = t.shelves as Record<string, { name: string; desc: string }>;
  const labels = {
    words: t.words,
    learned: t.learned,
    continue: t.continue,
    start: t.start,
    soon: t.soon,
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      {/* Hero with circular progress */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-panel light-sweep rounded-lg p-6 sm:p-8 lg:p-10"
      >
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Left: title + description */}
          <div>
            <span className="icon-tile size-12 rounded-lg">
              <LibraryBig className="size-6 text-brand-300" aria-hidden />
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-lg text-base text-ink-soft sm:text-lg">{t.subtitle}</p>

            {/* Quick stats row */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatTile icon={BookOpenCheck} label={t.words} value={totalAdded} tone="text-brand-300" />
              <StatTile icon={CheckCircle2} label={t.learned} value={totalLearned} tone="text-accent-300" />
              <StatTile icon={Layers3} label="Levels" value="6" tone="text-rose-300" />
            </div>
          </div>

          {/* Right: circular progress */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-brand-600 dark:text-brand-300">
              <CircularProgress percent={progressPercent} size={140} />
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-ink">{progressPercent}%</p>
              <p className="mt-1 text-sm font-semibold text-ink-soft">{t.continue.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Corpus-wide search + add */}
      <div className="mt-8">
        <SearchPanel lang={lang} t={t} />
      </div>

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
        className="surface-panel mt-10 rounded-lg p-5 sm:p-6"
        >
          <Link href={`/${lang}/library/my-cards`} className="flex items-center gap-4">
            <span className="icon-tile flex size-14 shrink-0 items-center justify-center rounded-lg">
              <BookOpenCheck className="size-6 text-accent-300" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-ink">{t.myCards}</h2>
              <div className="mt-2 h-2 w-full rounded-full bg-line/40">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-500 transition-all"
                  style={{
                    width: `${queue.due_count + queue.new_count > 0 ? Math.min((queue.due_count + queue.new_count) / (totalAdded * 0.3) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-soft sm:text-sm">
                <strong className="text-ink">{queue.due_count + queue.new_count}</strong> {t.due}{" "}
                · <strong className="text-brand-600 dark:text-brand-300">{totalAdded}</strong> {t.words.toLowerCase()}
              </p>
            </div>
          </Link>
          <div className="mt-4 flex gap-2">
            <Link href={`/${lang}/library/my-cards`}>
              <Button variant="secondary" size="sm">
                {t.manage}
              </Button>
            </Link>
            <Link href={`/${lang}/review`}>
              <Button size="sm">{t.review} →</Button>
            </Link>
          </div>
        </motion.section>
      )}

      {/* Level shelves */}
      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <Target className="size-6 text-accent-300" aria-hidden />
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.title}</h2>
        </div>
        <p className="mb-6 text-sm text-ink-soft">{t.subtitle}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>

      {/* Your collections */}
      <section className="mt-16">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-brand-600 dark:text-brand-300" />
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.collections}</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{t.collectionsDesc}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {decks.map((deck) => (
            <CollectionCard
              key={deck.id}
              lang={lang}
              deck={deck}
              labels={{
                cards: t.cards,
                due: t.due,
                review: t.review,
                import: t.importCsv,
                export: t.exportCsv,
                delete: t.delete,
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
            className="premium-card flex h-full min-h-44 flex-col items-stretch justify-center rounded-lg border-2 border-dashed border-line bg-card/40 p-6 backdrop-blur-sm"
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
                  <Button type="submit" size="sm">
                    {t.create}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex flex-col items-center gap-2 text-ink-soft transition-colors hover:text-ink"
              >
                <span className="icon-tile flex size-12 items-center justify-center rounded-lg text-brand-600 dark:text-brand-300">
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
