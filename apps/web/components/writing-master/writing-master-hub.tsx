"use client";

import { CheckCircle2, Lock, PenLine, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { usePremiumStatus } from "@/components/billing/use-premium-status";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/lib/api";
import { FREE_WRITING_MASTER_UNITS, MASTER_UNITS } from "@/lib/writing-master/curriculum";
import {
  loadProgress, syncProgress, WRITING_MASTER_PROGRESS_EVENT, type WritingMasterProgress,
} from "@/lib/writing-master/progress";

const BAND_GOALS = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5];

export function WritingMasterHub({ lang }: { lang: string }) {
  const { user, ready, updateUser } = useAuth();
  const isPremium = usePremiumStatus();
  const [progress, setProgress] = useState<WritingMasterProgress>({});
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    const onChange = () => setProgress(loadProgress());
    window.addEventListener(WRITING_MASTER_PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(WRITING_MASTER_PROGRESS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  useEffect(() => {
    if (ready && user) void syncProgress(user.id).then(setProgress);
  }, [ready, user]);

  async function setGoal(band: number) {
    if (!user || savingGoal) return;
    setSavingGoal(true);
    try {
      const updated = await profileApi.update({ target_band_score: band });
      updateUser(updated);
    } finally {
      setSavingGoal(false);
    }
  }

  if (!ready) return null;

  const goal = user?.profile.target_band_score ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2 text-brand-700">
        <PenLine className="size-5" />
        <span className="text-xs font-black uppercase tracking-wide">Master Writing</span>
      </div>
      <h1 className="mt-2 font-display text-4xl text-ink">Task 1, one chart type at a time</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Vocabulary, title paraphrasing and the overview paragraph for each chart type, then a full timed practice.
      </p>

      {user && !goal && (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center gap-2 text-ink"><Target className="size-4" /><p className="font-black">Set your target band</p></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {BAND_GOALS.map((b) => (
              <Button key={b} size="sm" variant="secondary" disabled={savingGoal} onClick={() => void setGoal(b)}>
                {b.toFixed(1)}
              </Button>
            ))}
          </div>
        </div>
      )}
      {goal && (
        <p className="mt-4 text-sm text-ink-soft">
          Goal: <span className="font-bold text-ink">{goal.toFixed(1)}</span>
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {MASTER_UNITS.map((unit) => {
          const locked = isPremium === false && !FREE_WRITING_MASTER_UNITS.includes(unit.slug);
          const entry = progress[unit.slug];
          const mastered = (entry?.best_score ?? 0) >= 100;
          return (
            <Link
              key={unit.slug}
              href={locked ? `/${lang}/pricing` : `/${lang}/ielts/writing/master/${unit.slug}`}
              className={`relative rounded-2xl border p-5 transition ${
                locked ? "border-line/70 bg-card/60 opacity-70" : "border-line bg-card hover:border-brand-400"
              }`}
            >
              {locked && <Lock className="absolute right-4 top-4 size-4 text-ink-soft" />}
              {mastered && <CheckCircle2 className="absolute right-4 top-4 size-4 text-success" />}
              <p className="font-black text-ink">{lang === "uz" ? unit.titleUz : unit.title}</p>
              <div className="mt-3 h-1.5 rounded-full bg-line/60">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${entry?.best_score ?? 0}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
