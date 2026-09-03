"use client";

import { motion } from "framer-motion";
import {
  AlignJustify,
  AudioLines,
  BrainCircuit,
  CaseUpper,
  CircleDot,
  Gamepad2,
  Grid2x2,
  Headphones,
  Keyboard,
  Crown,
  Lock,
  Mic2,
  Puzzle,
  ScanSearch,
  Swords,
  TextCursorInput,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { usePremiumStatus } from "@/components/billing/use-premium-status";
import { DailyQuestsPanel } from "@/components/gamification/daily-quests";
import { FREE_GAME_TYPES, GAME_TYPES, type GameType } from "@/lib/games";
import type { Dictionary } from "@/app/[lang]/dictionaries";

import styles from "./games-hub.module.css";

const GAME_ICONS: Record<GameType, LucideIcon> = {
  word_match: Puzzle,
  speed_quiz: Timer,
  fill_blank: TextCursorInput,
  audio_guess: Headphones,
  typing_race: Keyboard,
  memory: BrainCircuit,
  hangman: CircleDot,
  spelling_bee: CaseUpper,
  sentence_builder: AlignJustify,
  word_search: ScanSearch,
  crossword: Grid2x2,
  listening: AudioLines,
  speaking: Mic2,
};

export function GamesHub({
  lang,
  games,
  gam,
  wordChain,
}: {
  lang: string;
  games: Dictionary["games"];
  gam: Dictionary["gam"];
  wordChain: Dictionary["wordChain"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const isPremium = usePremiumStatus();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <section className="surface-panel relative overflow-hidden rounded-[18px] p-5 sm:p-7">
        <span aria-hidden className="absolute -right-5 -top-6 font-display text-[10rem] leading-none tracking-wide text-brand-600/8">PLAY</span>
        <span className="icon-tile size-12 rounded-lg">
          <Gamepad2 className="size-6 text-brand-600 dark:text-brand-300" aria-hidden />
        </span>
        <h1 className="type-h1 mt-5 text-ink">{games.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">{games.subtitle}</p>
      </section>

      <DailyQuestsPanel lang={lang} gam={gam} />

      <section
        className="surface-panel relative mt-6 overflow-hidden rounded-[18px] p-5 sm:p-7"
        aria-labelledby="word-chain-practice-title"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="icon-tile size-12 shrink-0 rounded-lg bg-accent-500/12">
              <Swords className="size-6 text-accent-600 dark:text-accent-300" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="word-chain-practice-title" className="type-h2 text-ink">
                {wordChain.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
                {wordChain.playOnlineHint}
              </p>
            </div>
          </div>
          <Link
            href={`/${lang}/multiplayer/word-chain`}
            aria-label={`${wordChain.title} — ${wordChain.playOnline}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-black text-white shadow-[0_8px_18px_rgb(126_45_28_/_0.22)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_12px_24px_rgb(126_45_28_/_0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-0"
          >
            <Swords className="size-4" aria-hidden />
            {wordChain.playOnline}
          </Link>
        </div>
      </section>

      <h2 className="type-h2 mt-8 text-ink">{games.soloPracticeTitle}</h2>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        initial="hidden"
        animate="show"
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GAME_TYPES.map((type) => {
          const meta = games[type];
          const Icon = GAME_ICONS[type];
          // Unknown while isPremium === null (still loading) renders as
          // unlocked rather than flashing a lock that then disappears —
          // the backend is the real gate either way, this is just a hint.
          const locked = isPremium === false && !FREE_GAME_TYPES.includes(type);
          // The same tiles, once paid for: the lock becomes a crown in place,
          // which is the only signal a subscriber gets that anything changed.
          const premiumUnlocked = isPremium === true && !FREE_GAME_TYPES.includes(type);
          return (
            <motion.div
              key={type}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
              }}
            >
              <Link
                href={locked ? `/${lang}/pricing` : `/${lang}/games/${type}`}
                aria-label={locked ? `${meta.name} — ${games.unlockPremium}` : meta.name}
                data-game={type}
                className={`${styles.gameCard} ${locked ? styles.locked : ""} ${premiumUnlocked ? styles.premiumCard : ""}`}
              >
                {locked && (
                  <span className={styles.lockedLabel}>
                    <Lock className="size-3" aria-hidden />
                    {games.premiumLocked}
                  </span>
                )}
                {premiumUnlocked && (
                  <span className={styles.premiumMark}>
                    <Crown className="size-3" aria-hidden />
                    {games.premiumUnlocked}
                  </span>
                )}
                <div className={styles.cardHeader}>
                  <span className={styles.iconTile}>
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <Icon className={styles.artIcon} strokeWidth={1.45} aria-hidden />
                </div>
                <div className={styles.cardCopy}>
                  <h2 className={styles.cardTitle}>{meta.name}</h2>
                  <p className={styles.cardDescription}>{meta.desc}</p>
                </div>
                {locked && (
                  <p className={styles.unlockCopy}>
                    {games.unlockPremium}
                  </p>
                )}
                {!locked && <span className={styles.playMark} aria-hidden />}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </main>
  );
}
