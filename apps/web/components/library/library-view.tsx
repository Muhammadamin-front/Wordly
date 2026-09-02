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
import { expressionsApi } from "@/lib/expressions";
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
        className="text-accent-400"
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
    <div className="rounded-xl border border-sand-100/25 bg-brand-900 px-4 py-3 shadow-[3px_4px_0_rgba(0,0,0,0.28)]">
      <Icon className={`size-5 ${tone}`} aria-hidden />
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-sand-100/66">{label}</p>
      <p className="font-display text-3xl tracking-wide text-brand-50">{value}</p>
    </div>
  );
}

export function LibraryView({
  lang,
  t,
  vocab,
}: {
  lang: string;
  t: Dictionary["library"];
  vocab: Dictionary["vocab"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [shelves, setShelves] = useState<Record<string, Shelf> | null>(null);
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [report, setReport] = useState<DeckImportReport | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState(false);
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
      expressionsApi.meta().catch(() => null),
    ]).then(([overview, deckList, q, expressionMeta]) => {
      if (cancelled) return;
      const shelfMap = Object.fromEntries(overview.shelves.map((s) => [s.key, s]));
      if (expressionMeta) {
        shelfMap.expressions = {
          key: "expressions",
          total: expressionMeta.total,
          added: 0,
          learned: 0,
        };
      }
      setShelves(shelfMap);
      setDecks(deckList);
      setQueue(q);
      setLoadError(false);
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    });
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

  if (!ready || !user || (!loadError && (shelves === null || decks === null))) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6 sm:py-10">
        <Skeleton className="mx-auto h-11 w-72 rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-14 w-full max-w-2xl rounded-2xl" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  if (loadError || shelves === null || decks === null) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Alert tone="error">{t.loadError}</Alert>
        <Button className="mt-4" variant="secondary" onClick={reload}>
          {t.retry}
        </Button>
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
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-(--app-container-width) flex-1 px-3 py-6 sm:px-6 sm:py-10">
      {/* Hero with circular progress */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[22px] border-2 border-brand-950 bg-brand-950 shadow-[10px_12px_0_rgba(84,37,15,0.55)]"
      >
        <div aria-hidden className="absolute -left-20 -top-20 size-72 rounded-full border-[32px] border-accent-400/45" />
        <div aria-hidden className="absolute -right-16 bottom-0 size-64 rotate-12 bg-brand-500/80" />
        <p aria-hidden className="absolute right-5 top-3 font-display text-[8rem] leading-none tracking-wide text-sand-100/10 sm:right-10 sm:text-[12rem]">WORDS</p>

        <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="max-w-2xl">
            <span className="print-label inline-flex items-center gap-2 border-sand-100/45 bg-sand-100/10 text-sand-100">
              <LibraryBig className="size-4" aria-hidden />
              Vocora library
            </span>
            <h1 className="editorial-title mt-6 max-w-[11ch] text-5xl text-brand-50 sm:text-7xl lg:text-8xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-sand-100/82 sm:text-lg">
              {t.subtitle}
            </p>

            <div className="mt-7 grid gap-3 min-[460px]:grid-cols-3">
              <StatTile
                icon={BookOpenCheck}
                label={t.words}
                value={totalAdded}
                tone="text-brand-200"
              />
              <StatTile
                icon={CheckCircle2}
                label={t.learned}
                value={totalLearned}
                tone="text-accent-300"
              />
              <StatTile
                icon={Layers3}
                label="Levels"
                value="6"
                tone="text-brand-200"
              />
            </div>
          </div>

          <div className="flex items-end justify-start lg:justify-end">
            <div className="relative min-h-52 w-full max-w-sm overflow-hidden rounded-[18px] border-2 border-brand-950 bg-sand-100 p-5 text-brand-950 shadow-[6px_7px_0_rgba(0,0,0,0.32)]">
              <div aria-hidden className="absolute -right-10 -top-8 h-40 w-24 rotate-12 border border-brand-800/28 bg-brand-500/18" />
              <div className="relative text-accent-text">
                <CircularProgress percent={progressPercent} size={136} />
              </div>
              <div className="relative mt-4">
                <p className="font-display text-6xl leading-none tracking-wide text-brand-950">{progressPercent}%</p>
                <p className="mt-2 text-sm font-bold text-[#6c4935]">{t.continue.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Corpus-wide search + add */}
      <div className="mt-8">
        <SearchPanel lang={lang} t={t} vocab={vocab} />
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
        className="relative mt-8 overflow-hidden rounded-[18px] border-2 border-brand-800 bg-brand-950 p-4 shadow-[7px_8px_0_rgba(84,37,15,0.5)] sm:mt-10 sm:p-6"
        >
          <Link href={`/${lang}/library/my-cards`} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="icon-tile flex size-14 shrink-0 items-center justify-center rounded-lg">
              <BookOpenCheck className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-3xl tracking-wide text-brand-50">{t.myCards}</h2>
              <div className="mt-2 h-2 w-full rounded-full bg-white/14">
                <div
                  className="h-full rounded-full bg-sand-100 transition-all"
                  style={{
                    width: `${queue.due_count + queue.new_count > 0 ? Math.min((queue.due_count + queue.new_count) / (totalAdded * 0.3) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-sand-100/80 sm:text-sm">
                <strong className="text-brand-50">{queue.due_count + queue.new_count}</strong> {t.due}{" "}
                · <strong className="text-brand-50">{totalAdded}</strong> {t.words.toLowerCase()}
              </p>
            </div>
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
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
      <section className="mt-10 sm:mt-12">
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <Target className="size-6 text-accent-600 dark:text-accent-300" aria-hidden />
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t.title}</h2>
        </div>
        <p className="mb-5 text-sm leading-6 text-ink-soft sm:mb-6">{t.subtitle}</p>
        <div className="grid grid-cols-2 gap-3 min-[390px]:gap-4 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
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
      <section className="mt-12 sm:mt-16">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-brand-600 dark:text-brand-300" />
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t.collections}</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{t.collectionsDesc}</p>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
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
            className="premium-card flex h-full min-h-40 flex-col items-stretch justify-center rounded-lg border-2 border-dashed border-line bg-card/40 p-6 backdrop-blur-sm"
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
