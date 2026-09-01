"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Trophy } from "lucide-react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { WordChainState } from "@/lib/word-chain";
import styles from "./word-chain.module.css";

type Copy = Dictionary["wordChain"];

function template(value: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) => result.replace(`{${key}}`, String(replacement)),
    value
  );
}

export function WinnerScreen({
  copy,
  state,
  myUserId,
  onPlayAgain,
}: {
  copy: Copy;
  state: WordChainState;
  myUserId: string;
  onPlayAgain: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const winner = state.players.find((player) => player.id === state.winner_id);
  const won = winner?.id === myUserId;
  const minutes = Math.floor((state.duration_seconds ?? 0) / 60);
  const seconds = Math.round((state.duration_seconds ?? 0) % 60);

  return (
    <div className={styles.winnerWrap}>
      <motion.section
        className={styles.winnerPanel}
        aria-labelledby="winner-heading"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.winnerIcon}><Trophy size={42} aria-hidden /></div>
        <p className={styles.label} style={{ marginTop: "1.2rem" }}>{copy.winner}</p>
        <h2 id="winner-heading" className={styles.winnerName}>
          {won ? copy.youWin : template(copy.wins, { name: winner?.username ?? "—" })}
        </h2>
        <p style={{ marginTop: ".8rem", color: "var(--wc-muted)" }}>{winner?.username}</p>

        <div className={styles.winnerStats}>
          <div className={styles.winnerStat}>
            <strong>{state.round}</strong>
            <span>{copy.roundsSurvived}</span>
          </div>
          <div className={styles.winnerStat}>
            <strong>{winner?.words_submitted ?? 0}</strong>
            <span>{copy.wordsSubmitted}</span>
          </div>
          <div className={styles.winnerStat}>
            <strong>{minutes}:{String(seconds).padStart(2, "0")}</strong>
            <span>{copy.duration}</span>
          </div>
        </div>

        <button type="button" className={styles.primaryButton} onClick={onPlayAgain} style={{ marginTop: "2rem" }}>
          <RotateCcw size={18} aria-hidden />
          {copy.playAgain}
        </button>
      </motion.section>
    </div>
  );
}
