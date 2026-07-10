"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { GAME_TYPES, type GameType } from "@/lib/games";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const GAME_ICONS: Record<GameType, string> = {
  word_match: "🔗",
  speed_quiz: "⚡",
  fill_blank: "✏️",
  audio_guess: "🎧",
  typing_race: "⌨️",
  memory: "🧠",
  boss_battle: "🐉",
  hangman: "🪢",
  spelling_bee: "🐝",
  sentence_builder: "🧩",
  word_search: "🔍",
  // Skill drills live under /skills; keys exist so the Records stay total.
  listening: "🎧",
  speaking: "🗣️",
};

const GAME_ACCENT: Record<GameType, string> = {
  word_match: "from-brand-500/15",
  speed_quiz: "from-amber-500/15",
  fill_blank: "from-accent-500/15",
  audio_guess: "from-purple-500/15",
  typing_race: "from-sky-500/15",
  memory: "from-rose-500/15",
  boss_battle: "from-red-500/15",
  hangman: "from-slate-500/15",
  spelling_bee: "from-yellow-500/15",
  sentence_builder: "from-emerald-500/15",
  word_search: "from-cyan-500/15",
  listening: "from-sky-500/15",
  speaking: "from-orange-500/15",
};

export function GamesHub({ lang, games }: { lang: string; games: Dictionary["games"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{games.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{games.subtitle}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_TYPES.map((type) => {
          const meta = games[type];
          return (
            <Link
              key={type}
              href={`/${lang}/games/${type}`}
              className={`group flex flex-col rounded-xl2 border border-line bg-linear-to-br ${GAME_ACCENT[type]} to-transparent p-5 transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <span className="text-4xl transition-transform group-hover:scale-110" aria-hidden>
                {GAME_ICONS[type]}
              </span>
              <h2 className="mt-3 text-lg font-bold text-ink">{meta.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{meta.desc}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
