"use client";

import { Lock, PenLine, Target, Trophy } from "lucide-react";
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
  // Seeded via the useState initializer rather than an effect: loadProgress()
  // is a safe no-op on the server (its own try/catch swallows the
  // window-is-undefined error), and seeding here avoids the render-then-
  // correct flash a same-tick setState-in-effect would cause.
  const [progress, setProgress] = useState<WritingMasterProgress>(() => loadProgress());
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
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
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
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

      {(() => {
        const masteredCount = MASTER_UNITS.filter((u) => (progress[u.slug]?.best_score ?? 0) >= 100).length;
        return (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
            <Trophy className={`size-6 shrink-0 ${masteredCount > 0 ? "text-brand-500" : "text-ink-soft"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-ink">{masteredCount} / {MASTER_UNITS.length} units mastered</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-line/60">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                  style={{ width: `${(masteredCount / MASTER_UNITS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MASTER_UNITS.map((unit) => {
          const locked = isPremium === false && !FREE_WRITING_MASTER_UNITS.includes(unit.slug);
          const entry = progress[unit.slug];
          const mastered = (entry?.best_score ?? 0) >= 100;
          return (
            <Link
              key={unit.slug}
              href={locked ? `/${lang}/pricing` : `/${lang}/ielts/writing/master/${unit.slug}`}
              className={`relative rounded-2xl border p-5 transition ${
                locked
                  ? "border-line/70 bg-card/60 opacity-70"
                  : mastered
                    ? "border-success/40 bg-success/5 hover:border-success"
                    : "border-line bg-card hover:border-brand-400"
              }`}
            >
              {locked && <Lock className="absolute right-4 top-4 size-4 text-ink-soft" />}
              {mastered && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-black text-success-text">
                  <Trophy className="size-3" /> Mastered
                </span>
              )}
              <p className="font-black text-ink">{lang === "uz" ? unit.titleUz : unit.title}</p>
              <div className="mt-3 h-1.5 rounded-full bg-line/60">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${mastered ? "bg-success" : "bg-brand-500"}`}
                  style={{ width: `${entry?.best_score ?? 0}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
