"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { aiApi } from "@/lib/ai";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/** Inline "Explain with AI" / "Memory hook" actions on the word detail page. */
export function AiExplain({ wordId, ai }: { wordId: string; ai: Dictionary["ai"] }) {
  const { user, ready } = useAuth();
  const [text, setText] = useState<string | null>(null);
  const [kind, setKind] = useState<"explain" | "mnemonic">("explain");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  if (!ready || !user) return null;

  async function run(which: "explain" | "mnemonic") {
    setPending(true);
    setError(null);
    setReported(false);
    setKind(which);
    try {
      const result = which === "explain" ? await aiApi.explain(wordId) : await aiApi.mnemonic(wordId);
      setText(result.text);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setError(ai.quotaOut);
      else if (err instanceof ApiError && err.status === 503) setError(ai.notConfigured);
      else setError(ai.error);
    } finally {
      setPending(false);
    }
  }

  async function report() {
    if (!text) return;
    await aiApi.report(kind, text);
    setReported(true);
  }

  return (
    <div className="mt-5 rounded-xl2 border border-brand-400/40 bg-brand-600/5 p-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" loading={pending && kind === "explain"} onClick={() => run("explain")}>
          ✨ {ai.explain}
        </Button>
        <Button size="sm" variant="ghost" loading={pending && kind === "mnemonic"} onClick={() => run("mnemonic")}>
          🧠 {ai.mnemonic}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {text && !error && (
        <div className="mt-3">
          <p className="whitespace-pre-wrap text-sm text-ink">{text}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[11px] italic text-ink-soft/70">✨ {ai.aiLabel}</span>
            {reported ? (
              <span className="text-[11px] text-success">{ai.reported}</span>
            ) : (
              <button
                type="button"
                onClick={() => void report()}
                className="text-[11px] text-ink-soft underline hover:text-ink"
              >
                {ai.report}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
