"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  exportDeckCsv,
  flashcardsApi,
  importDeckCsv,
  type Deck,
  type DeckImportReport,
} from "@/lib/flashcards";
import { CEFR_LEVELS } from "@/lib/vocab";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function DecksView({ lang, decks: t }: { lang: string; decks: Dictionary["decks"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [mainDue, setMainDue] = useState<{ due: number; newCount: number } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [report, setReport] = useState<DeckImportReport | null>(null);
  const [level, setLevel] = useState("A1");
  const [adding, setAdding] = useState(false);
  const importTarget = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([flashcardsApi.decks(), flashcardsApi.queue()]).then(([deckList, queue]) => {
      if (cancelled) return;
      setDecks(deckList);
      setMainDue({ due: queue.due_count, newCount: queue.new_count });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    await flashcardsApi.createDeck(name, String(form.get("description") ?? "") || undefined);
    (event.target as HTMLFormElement).reset();
    reload();
  }

  async function onAddByLevel() {
    setAdding(true);
    try {
      const result = await flashcardsApi.addByLevel(level, 20);
      setMessage(`+${result.added} ${t.addedResult}`);
      reload();
    } finally {
      setAdding(false);
    }
  }

  async function onImportFile(file: File) {
    const deckId = importTarget.current;
    if (!deckId) return;
    const result = await importDeckCsv(deckId, file);
    setReport(result);
    reload();
  }

  if (!ready || !user || decks === null) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t.title}</h1>

      {message && (
        <Alert tone="success" className="mt-4">
          {message}
        </Alert>
      )}
      {report && (
        <Alert tone={report.errors.length ? "error" : "success"} className="mt-4">
          {report.created} {t.imported}, {report.skipped} {t.skipped}
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

      {/* Main corpus deck */}
      <Card className="mt-6 border-brand-400/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>📚 {t.mainDeck}</CardTitle>
            <CardDescription>{t.mainDeckDesc}</CardDescription>
            {mainDue && (
              <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-300">
                {mainDue.due + mainDue.newCount} {t.due}
              </p>
            )}
          </div>
          <Link href={`/${lang}/review`}>
            <Button>{t.startReview}</Button>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
          <div>
            <Label htmlFor="level">{t.addByLevel}</Label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-10 rounded-lg border border-line bg-card px-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
            >
              {CEFR_LEVELS.map((cefr) => (
                <option key={cefr} value={cefr}>
                  {cefr}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" variant="accent" loading={adding} onClick={() => void onAddByLevel()}>
            +20 · {t.addButton}
          </Button>
          <span className="text-xs text-ink-soft">{t.addByLevelHint}</span>
        </div>
      </Card>

      {/* Custom decks */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {decks.map((deck) => (
          <Card key={deck.id}>
            <CardTitle>{deck.name}</CardTitle>
            {deck.description && <CardDescription>{deck.description}</CardDescription>}
            <p className="mt-2 text-sm text-ink-soft">
              {deck.card_count} {t.cards} ·{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-300">
                {deck.due_count} {t.due}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/${lang}/review?deck=${deck.id}`}>
                <Button size="sm">{t.startReview}</Button>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  importTarget.current = deck.id;
                  fileInput.current?.click();
                }}
              >
                ⬆ {t.importCsv}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void exportDeckCsv(deck.id, deck.name)}
              >
                ⬇ {t.exportCsv}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={async () => {
                  if (!window.confirm(t.deleteConfirm)) return;
                  await flashcardsApi.deleteDeck(deck.id);
                  reload();
                }}
              >
                {t.deleteDeck}
              </Button>
            </div>
          </Card>
        ))}

        {/* Create deck */}
        <Card>
          <CardTitle>＋ {t.newDeck}</CardTitle>
          <form onSubmit={onCreate} className="mt-3 space-y-3">
            <div>
              <Label htmlFor="name">{t.deckName}</Label>
              <Input id="name" name="name" required maxLength={80} />
            </div>
            <div>
              <Label htmlFor="description">{t.deckDesc}</Label>
              <Input id="description" name="description" maxLength={300} />
            </div>
            <Button type="submit" size="sm">
              {t.createDeck}
            </Button>
          </form>
          <p className="mt-3 text-xs text-ink-soft">{t.importHint}</p>
        </Card>
      </div>
    </main>
  );
}
