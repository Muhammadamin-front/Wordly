"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { aiApi, type WritingCheck } from "@/lib/ai";
import { skillsApi } from "@/lib/skills";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export function WritingView({ lang, skills }: { lang: string; skills: Dictionary["skills"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [level, setLevel] = useState<string>("A1");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<WritingCheck | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    skillsApi.writingPrompts(level).then((r) => {
      if (cancelled) return;
      setPrompts(r.prompts);
      setPromptIndex(0);
    }).catch(() => {});
    aiApi.quota().then((q) => {
      if (!cancelled) setAiEnabled(q.enabled);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ready, user, level]);

  const nextPrompt = () => {
    setPromptIndex((i) => (prompts.length ? (i + 1) % prompts.length : 0));
    setFeedback(null);
  };

  const check = () => {
    if (!text.trim() || checking) return;
    setChecking(true);
    aiApi
      .writingCheck(text)
      .then((r) => setFeedback(r))
      .catch(() => setFeedback(null))
      .finally(() => setChecking(false));
  };

  if (!ready || !user) return null;

  const prompt = prompts[promptIndex];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">
        ✍️ {skills.writing.name}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{skills.writing.desc}</p>

      <div className="mt-6 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
              level === l ? "bg-brand-600 text-white" : "bg-card text-ink-soft hover:text-ink"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {prompt && (
        <div className="mt-4 rounded-xl2 border border-brand-400/35 bg-linear-to-br from-brand-500/10 to-transparent p-5">
          <p className="font-medium text-ink">{prompt}</p>
          <button
            type="button"
            onClick={nextPrompt}
            className="mt-2 text-sm text-ink-soft underline-offset-2 hover:underline"
          >
            ↻ {skills.newPrompt}
          </button>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={skills.yourText}
        className="mt-4 w-full rounded-xl border border-line bg-card p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-brand-400"
      />
      <p className="mt-1 text-right text-xs text-ink-soft">{wordCount} {skills.words}</p>

      {aiEnabled ? (
        <Button fullWidth className="mt-3" loading={checking} disabled={!text.trim()} onClick={check}>
          {skills.checkWriting}
        </Button>
      ) : (
        <Alert tone="info" className="mt-3">
          {skills.aiUnavailable}
        </Alert>
      )}

      {feedback && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl2 border border-success/30 bg-success/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-success-text">
              {skills.corrected}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {feedback.corrected}
            </p>
          </div>
          <div className="rounded-xl2 border border-line bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              {skills.feedback}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {feedback.feedback}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
