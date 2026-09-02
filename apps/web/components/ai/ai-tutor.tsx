"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { aiApi, type ChatMessage, type WritingCheck } from "@/lib/ai";
import { CEFR_LEVELS } from "@/lib/vocab";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Tab = "chat" | "writing";

function useQuota() {
  const [quota, setQuota] = useState<{ remaining: number; enabled: boolean } | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    aiApi
      .quota()
      .then((q) => !cancelled && setQuota({ remaining: q.remaining, enabled: q.enabled }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [reload]);
  return { quota, refresh: () => setReload((n) => n + 1) };
}

export function AiTutor({ lang, ai }: { lang: string; ai: Dictionary["ai"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chat");
  const { quota, refresh } = useQuota();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  if (!ready || !user) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">🐆 {ai.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{ai.subtitle}</p>
        </div>
        {quota && (
          <span className="shrink-0 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-bold text-brand-600 dark:text-brand-300">
            ✨ {quota.remaining} {ai.quotaLeft}
          </span>
        )}
      </div>

      {quota && !quota.enabled && (
        <Alert tone="info" className="mt-4">
          {ai.notConfigured}
        </Alert>
      )}

      <div className="mt-5 flex gap-1 rounded-xl border border-line p-1">
        {(["chat", "writing"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === t ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            {t === "chat" ? ai.chatTab : ai.writingTab}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "chat" ? (
          <ChatPanel ai={ai} onAction={refresh} />
        ) : (
          <WritingPanel ai={ai} onAction={refresh} />
        )}
      </div>
    </main>
  );
}

function errorMessage(err: unknown, ai: Dictionary["ai"]): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return ai.quotaOut;
    if (err.status === 503) return ai.notConfigured;
  }
  return ai.error;
}

function ChatPanel({ ai, onAction }: { ai: Dictionary["ai"]; onAction: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [level, setLevel] = useState("A2");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const content = String(form.get("message") ?? "").trim();
    if (!content || pending) return;
    (event.target as HTMLFormElement).reset();
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setPending(true);
    setError(null);
    try {
      const { text } = await aiApi.chat(next, level);
      setMessages([...next, { role: "assistant", content: text }]);
      onAction();
    } catch (err) {
      setError(errorMessage(err, ai));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        <Bubble role="assistant" text={ai.chatIntro} />
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} />
        ))}
        {pending && <Bubble role="assistant" text="…" />}
      </div>

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-ink-soft">{ai.level}:</span>
        {CEFR_LEVELS.slice(0, 4).map((cefr) => (
          <button
            key={cefr}
            type="button"
            onClick={() => setLevel(cefr)}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-bold",
              level === cefr ? "bg-brand-600 text-white" : "text-ink-soft hover:bg-line"
            )}
          >
            {cefr}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-2 flex gap-2">
        <input
          name="message"
          autoComplete="off"
          placeholder={ai.chatPlaceholder}
          className="h-11 flex-1 rounded-xl border border-line bg-card px-4 text-sm text-ink focus:border-brand-400 focus:outline-none"
        />
        <Button type="submit" loading={pending}>
          {ai.send}
        </Button>
      </form>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "rounded-br-sm bg-brand-600 text-white"
            : "rounded-bl-sm border border-line bg-card text-ink"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function WritingPanel({ ai, onAction }: { ai: Dictionary["ai"]; onAction: () => void }) {
  const [result, setResult] = useState<WritingCheck | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") ?? "").trim();
    if (!text || pending) return;
    setPending(true);
    setError(null);
    try {
      setResult(await aiApi.writingCheck(text));
      onAction();
    } catch (err) {
      setError(errorMessage(err, ai));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <textarea
        name="text"
        rows={5}
        maxLength={2000}
        placeholder={ai.writingPlaceholder}
        className="w-full rounded-xl border border-line bg-card p-4 text-sm text-ink focus:border-brand-400 focus:outline-none"
      />
      <Button type="submit" className="mt-3" loading={pending}>
        {ai.checkWriting}
      </Button>

      {error && (
        <Alert tone="error" className="mt-3">
          {error}
        </Alert>
      )}

      {result && (
        <Card className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{ai.corrected}</p>
          <p className="mt-1 text-ink">{result.corrected}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-ink-soft">
            {ai.feedback}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{result.feedback}</p>
          <p className="mt-3 text-[11px] italic text-ink-soft/70">✨ {ai.aiLabel}</p>
        </Card>
      )}
    </form>
  );
}
