"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { CheatsheetPanel } from "@/components/ielts/cheatsheet";
import { ComprehensionTest } from "@/components/ielts/comprehension-test";
import { WritingPractice } from "@/components/ielts/writing-practice";
import { Button } from "@/components/ui/button";
import { cheatsheetFor, type CheatsheetSkill } from "@/lib/ielts-content";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];

const EMOJI: Record<CheatsheetSkill, string> = {
  reading: "📖",
  listening: "🎧",
  writing: "✍️",
  speaking: "🎙️",
};

/** One IELTS skill page: Strategy (cheatsheet) first, Practice second. */
export function SkillView({
  lang,
  skill,
  t,
}: {
  lang: string;
  skill: CheatsheetSkill;
  t: Ielts;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"strategy" | "practice">("strategy");

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const sheet = cheatsheetFor(skill, lang);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href={`/${lang}/ielts`} className="text-sm font-medium text-ink-soft hover:text-ink">
          ← IELTS
        </Link>
        <h1 className="text-lg font-bold text-ink">
          {EMOJI[skill]} {t[skill]}
        </h1>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-line p-1">
        {(["strategy", "practice"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === key ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            {key === "strategy" ? `📋 ${t.strategyTab}` : `📝 ${t.practiceTab}`}
          </button>
        ))}
      </div>

      {tab === "strategy" ? (
        <>
          <CheatsheetPanel sheet={sheet} t={t} />
          <Button fullWidth className="mt-6" onClick={() => setTab("practice")}>
            {t.startPractice} →
          </Button>
        </>
      ) : skill === "writing" ? (
        <WritingPractice lang={lang} t={t} embedded />
      ) : skill === "speaking" ? (
        <SpeakingPanel lang={lang} t={t} />
      ) : (
        <ComprehensionTest lang={lang} kind={skill} t={t} embedded />
      )}
    </main>
  );
}

function SpeakingPanel({ lang, t }: { lang: string; t: Ielts }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-8 text-center">
      <p className="text-5xl">🎙️</p>
      <h2 className="mt-3 text-xl font-bold text-ink">{t.speakingCtaTitle}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t.speakingCtaDesc}</p>
      <Link href={`/${lang}/coach`}>
        <Button className="mt-5">{t.speakingCtaButton} →</Button>
      </Link>
    </div>
  );
}
