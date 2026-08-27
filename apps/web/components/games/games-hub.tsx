"use client";

import { motion } from "framer-motion";
import {
  AudioLines,
  BrainCircuit,
  CircleDot,
  Gamepad2,
  Headphones,
  Keyboard,
  Mic2,
  Puzzle,
  Search,
  SpellCheck,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { DailyQuestsPanel } from "@/components/gamification/daily-quests";
import { GAME_TYPES, type GameType } from "@/lib/games";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const GAME_ICONS: Record<GameType, LucideIcon> = {
  word_match: Puzzle,
  speed_quiz: Timer,
  fill_blank: SpellCheck,
  audio_guess: Headphones,
  typing_race: Keyboard,
  memory: BrainCircuit,
  hangman: CircleDot,
  spelling_bee: SpellCheck,
  sentence_builder: Puzzle,
  word_search: Search,
  crossword: Gamepad2,
  listening: AudioLines,
  speaking: Mic2,
};

const GAME_ACCENT: Record<GameType, string> = {
  word_match: "from-brand-400/24 via-card to-accent-400/10",
  speed_quiz: "from-[#c88a55]/24 via-card to-brand-400/10",
  fill_blank: "from-accent-400/24 via-card to-brand-400/10",
  audio_guess: "from-brand-600/24 via-card to-accent-400/10",
  typing_race: "from-accent-500/22 via-card to-brand-400/10",
  memory: "from-brand-700/24 via-card to-accent-400/10",
  hangman: "from-[#c88a55]/24 via-card to-brand-400/10",
  spelling_bee: "from-brand-200/34 via-card to-accent-400/10",
  sentence_builder: "from-accent-400/20 via-card to-brand-400/10",
  word_search: "from-accent-500/22 via-card to-brand-400/10",
  crossword: "from-[#c88a55]/24 via-card to-brand-400/10",
  listening: "from-brand-600/24 via-card to-accent-400/10",
  speaking: "from-accent-500/22 via-card to-brand-400/10",
};

export function GamesHub({
  lang,
  games,
  gam,
}: {
  lang: string;
  games: Dictionary["games"];
  gam: Dictionary["gam"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  return (
    <main className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel relative overflow-hidden rounded-[18px] p-5 sm:p-7">
        <span aria-hidden className="absolute -right-5 -top-6 font-display text-[10rem] leading-none tracking-wide text-brand-600/8">PLAY</span>
        <span className="icon-tile size-12 rounded-lg">
          <Gamepad2 className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
        </span>
        <h1 className="type-h1 mt-5 text-ink">{games.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">{games.subtitle}</p>
      </section>

      <DailyQuestsPanel lang={lang} gam={gam} />

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        initial="hidden"
        animate="show"
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GAME_TYPES.map((type) => {
          const meta = games[type];
          const Icon = GAME_ICONS[type];
          return (
            <motion.div
              key={type}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
              }}
            >
              <Link
                href={`/${lang}/games/${type}`}
                className={`premium-card group flex h-full min-h-44 flex-col rounded-[14px] bg-linear-to-br ${GAME_ACCENT[type]} p-5 active:scale-[0.98]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="icon-tile size-12 rounded-lg">
                    <Icon className="size-6 text-ink" aria-hidden />
                  </span>
                  <span className="h-1 w-14 bg-brand-500 opacity-70 transition-all group-hover:w-20" />
                </div>
                <h2 className="mt-6 font-display text-3xl tracking-wide text-ink">{meta.name}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{meta.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  );
}
