"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Check, Clock3, Flame, Heart, History, LogOut, Sparkles, WifiOff, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useServerCountdown } from "@/lib/multiplayer-timer";
import type { WordChainChallenge, WordChainPlayer, WordChainState } from "@/lib/word-chain";
import { cn } from "@/lib/utils";
import styles from "./word-chain.module.css";

type Copy = Dictionary["wordChain"];

export interface SubmissionFeedback {
  tone: "good" | "bad";
  message: string;
  word?: string;
}

function template(value: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) => result.replace(`{${key}}`, String(replacement)),
    value
  );
}

export function GameTable({
  copy,
  state,
  myUserId,
  feedback,
  reconnecting,
  onSubmit,
  onLeave,
}: {
  copy: Copy;
  state: WordChainState;
  myUserId: string;
  feedback: SubmissionFeedback | null;
  reconnecting: boolean;
  onSubmit: (word: string) => void;
  onLeave: () => void;
}) {
  const orderedPlayers = useMemo(() => rotatePlayers(state.players, myUserId), [state.players, myUserId]);
  const currentPlayer = state.players.find((player) => player.id === state.current_player_id);
  const mine = state.players.find((player) => player.id === myUserId);
  const myTurn = state.current_player_id === myUserId && mine?.status === "active" && !reconnecting;
  const turnText = myTurn
    ? copy.yourTurn
    : template(copy.playersTurn, { name: currentPlayer?.username ?? copy.waitingStatus });
  const letterStats = state.letter_stats[state.current_letter];

  return (
    <div className={styles.gameGrid}>
      <div>
        <section className={styles.stage} aria-label={`${turnText}. ${template(copy.mustStart, { letter: state.current_letter })}`}>
          <div className={styles.table}>
            <div className={styles.tableCenter}>
              <p className={styles.label}>{copy.requiredLetter}</p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={`${state.turn}-${state.current_letter}`}
                  className={styles.letter}
                  initial={{ opacity: 0.35, x: -28, filter: "blur(5px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 22, filter: "blur(4px)" }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                >
                  {state.current_letter}
                </motion.p>
              </AnimatePresence>
              <p className={styles.turnLine}>{turnText}</p>
              <p className={styles.lastWord}>
                {copy.lastWord}: {state.last_word ?? copy.noWordYet}
              </p>
              {state.turn_ends_at !== null && (
                <TurnTimer copy={copy} endsAt={state.turn_ends_at} serverNow={state.server_now} />
              )}
            </div>
          </div>

          {orderedPlayers.map((player, index) => {
            const position = seatPosition(index, orderedPlayers.length);
            return (
              <PlayerSeat
                key={player.id}
                copy={copy}
                player={player}
                mine={player.id === myUserId}
                current={player.id === state.current_player_id}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              />
            );
          })}
        </section>

        <WordInput
          key={state.turn}
          copy={copy}
          requiredLetter={state.current_letter}
          turn={state.turn}
          enabled={myTurn}
          challenge={state.challenge}
          streak={mine?.streak ?? 0}
          streakBonusThreshold={state.config.streak_bonus_threshold}
          streakTimeBonus={state.config.streak_time_bonus}
          feedback={feedback}
          reconnecting={reconnecting}
          onSubmit={onSubmit}
        />
      </div>

      <aside aria-label={copy.usedWords}>
        <section className={styles.sidePanel}>
          <p className={styles.label}>
            <History size={15} aria-hidden style={{ display: "inline", marginRight: 6 }} />
            {copy.usedWords} · {state.used_words.length}
          </p>
          <div className={styles.historyList}>
            {state.used_words.length ? state.used_words.map((word, index) => (
              <span className={styles.historyWord} key={`${word}-${index}`}>{word}</span>
            )) : <p style={{ color: "var(--wc-muted)", fontSize: ".8rem" }}>{copy.noUsedWords}</p>}
          </div>
          <div style={{ marginTop: ".9rem" }}>
            {state.players.map((player) => (
              <details key={player.id} style={{ borderTop: "1px solid var(--wc-line)", paddingBlock: ".6rem" }}>
                <summary style={{ cursor: "pointer", color: "var(--wc-muted)", fontSize: ".76rem", fontWeight: 750 }}>
                  {player.username} · {player.words_submitted}
                </summary>
                <p style={{ marginTop: ".4rem", color: "var(--wc-ink)", fontSize: ".72rem", lineHeight: 1.55 }}>
                  {player.word_history.join(" · ") || copy.noUsedWords}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.sidePanel}>
          <p className={styles.label}>{copy.letterSupply}</p>
          <div className={styles.statRow}>
            <span>{state.current_letter}</span>
            <strong className={styles.statValue}>{letterStats?.remaining_words ?? 0}</strong>
          </div>
          <p style={{ marginTop: ".4rem", color: "var(--wc-muted)", fontSize: ".75rem" }}>
            {template(copy.remaining, { count: letterStats?.remaining_words ?? 0 })}
          </p>
          {letterStats?.is_restricted && (
            <p style={{ marginTop: ".55rem", color: "#f2bd6f", fontSize: ".72rem", fontWeight: 800 }}>
              {copy.restricted}
            </p>
          )}
          <div className={styles.statRow}>
            <span>{copy.round}</span>
            <strong className={styles.statValue}>{state.round}</strong>
          </div>
          <div className={styles.statRow}>
            <span>{copy.active}</span>
            <strong className={styles.statValue}>{state.active_players}</strong>
          </div>
        </section>

        <section className={styles.sidePanel}>
          <p className={styles.label}>{copy.rules}</p>
          <ul className={styles.rulesList}>
            <li>{copy.ruleChain}</li>
            <li>{copy.ruleUnique}</li>
            <li>{template(copy.ruleTimer, { lives: state.config.lives_per_player })}</li>
            <li>{template(copy.ruleCombo, { count: state.config.streak_bonus_threshold, seconds: state.config.streak_time_bonus })}</li>
          </ul>
        </section>

        <button type="button" className={styles.quietButton} onClick={onLeave} style={{ width: "100%", marginTop: "1rem" }}>
          <LogOut size={16} aria-hidden />
          {copy.leaveGame}
        </button>
      </aside>
    </div>
  );
}

function PlayerSeat({
  copy,
  player,
  mine,
  current,
  style,
}: {
  copy: Copy;
  player: WordChainPlayer;
  mine: boolean;
  current: boolean;
  style: React.CSSProperties;
}) {
  const status = player.status === "eliminated"
    ? copy.eliminated
    : player.status === "disconnected"
      ? copy.disconnected
      : current
        ? mine ? copy.yourTurn : copy.active
        : copy.waitingStatus;

  return (
    <div
      className={cn(
        styles.seat,
        current && styles.seatActive,
        mine && styles.seatMine,
        player.status === "eliminated" && styles.seatEliminated,
        player.status === "disconnected" && styles.seatDisconnected
      )}
      style={style}
      aria-label={`${player.username}, ${status}, ${copy.lives}: ${player.lives_remaining}. ${copy.combo}: ${player.streak}. ${player.words_submitted} ${copy.wordsSubmitted}`}
    >
      <span className={styles.seatAvatar} aria-hidden>
        {player.avatar_url ? (
          <span style={{ width: "100%", height: "100%", backgroundImage: `url(${player.avatar_url})`, backgroundPosition: "center", backgroundSize: "cover" }} />
        ) : player.is_bot ? <Bot size={22} /> : player.username.slice(0, 1).toUpperCase()}
      </span>
      <span className={styles.seatName}>{player.username}{mine ? ` · ${copy.you}` : ""}</span>
      <span className={styles.seatStatus}>
        {player.status === "disconnected" && <WifiOff size={11} aria-hidden style={{ display: "inline", marginRight: 3 }} />}
        {status}
      </span>
      <span className={styles.seatStats} aria-hidden>
        <span><Heart size={12} fill="currentColor" />{player.lives_remaining}</span>
        <span><Flame size={12} fill="currentColor" />×{player.streak}</span>
      </span>
    </div>
  );
}

function TurnTimer({ copy, endsAt, serverNow }: { copy: Copy; endsAt: number; serverNow: number }) {
  const { secondsLeft } = useServerCountdown(endsAt, serverNow);
  const urgency = secondsLeft <= 2 ? "critical" : secondsLeft <= 5 ? "warning" : "normal";
  return (
    <div aria-live={urgency === "critical" ? "assertive" : "off"}>
      <div
        className={cn(
          styles.timer,
          urgency === "warning" && styles.timerWarning,
          urgency === "critical" && styles.timerCritical
        )}
        aria-label={`${secondsLeft} ${copy.seconds}`}
      >
        {secondsLeft}
      </div>
      {urgency === "critical" && (
        <p style={{ marginTop: ".45rem", color: "#ffb094", fontSize: ".68rem", fontWeight: 800 }}>
          {copy.hurry}
        </p>
      )}
    </div>
  );
}

function WordInput({
  copy,
  requiredLetter,
  turn,
  enabled,
  challenge,
  streak,
  streakBonusThreshold,
  streakTimeBonus,
  feedback,
  reconnecting,
  onSubmit,
}: {
  copy: Copy;
  requiredLetter: string;
  turn: number;
  enabled: boolean;
  challenge: WordChainChallenge | null;
  streak: number;
  streakBonusThreshold: number;
  streakTimeBonus: number;
  feedback: SubmissionFeedback | null;
  reconnecting: boolean;
  onSubmit: (word: string) => void;
}) {
  const [word, setWord] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [enabled, turn]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enabled) onSubmit(word);
  };

  return (
    <form className={styles.inputDock} onSubmit={submit} aria-label={copy.yourTurn}>
      <AnimatePresence mode="wait" initial={false}>
        {feedback ? (
          <motion.div
            key={`${feedback.tone}-${feedback.message}`}
            className={cn(styles.feedback, feedback.tone === "good" ? styles.feedbackGood : styles.feedbackBad)}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role={feedback.tone === "bad" ? "alert" : "status"}
          >
            {feedback.tone === "good" ? <Check size={18} aria-hidden /> : <X size={18} aria-hidden />}
            {feedback.message}{feedback.word ? ` · ${feedback.word}` : ""}
          </motion.div>
        ) : (
          <div className={styles.feedback} key="prompt" style={{ color: "var(--wc-muted)" }}>
            <Clock3 size={17} aria-hidden />
            {reconnecting ? copy.reconnecting : enabled ? template(copy.startsWith, { letter: requiredLetter }) : copy.waitingStatus}
          </div>
        )}
      </AnimatePresence>
      {challenge && (
        <section className={styles.challengeStrip} aria-label={copy.bonusChallenge}>
          <Sparkles size={18} aria-hidden />
          <div className={styles.challengeCopy}>
            <span className={styles.challengeLabel}>{copy.bonusChallenge}</span>
            <strong>{challengeText(copy, challenge)}</strong>
          </div>
          <span className={styles.challengeReward}>{copy.challengeReward}</span>
        </section>
      )}
      {streak >= streakBonusThreshold ? (
        <p className={styles.comboHint}>{template(copy.comboReady, { seconds: streakTimeBonus })}</p>
      ) : (
        <p className={styles.comboHint}>{template(copy.comboProgress, { count: streakBonusThreshold, seconds: streakTimeBonus })}</p>
      )}
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.wordInput}
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder={copy.enterWord}
          aria-label={template(copy.mustStart, { letter: requiredLetter })}
          disabled={!enabled}
          maxLength={80}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="send"
        />
        <button className={styles.primaryButton} type="submit" disabled={!enabled || !word.trim()}>
          {copy.submit}
        </button>
      </div>
    </form>
  );
}

function challengeText(copy: Copy, challenge: WordChainChallenge): string {
  if (challenge.kind === "min_length") {
    return template(copy.challengeMinLength, { count: challenge.target });
  }
  if (challenge.kind === "minimum_vowels") {
    return template(copy.challengeMinimumVowels, { count: challenge.target });
  }
  return template(copy.challengeLonger, { count: challenge.target });
}

function rotatePlayers(players: WordChainPlayer[], myUserId: string): WordChainPlayer[] {
  const mine = players.findIndex((player) => player.id === myUserId);
  if (mine <= 0) return players;
  return [...players.slice(mine), ...players.slice(0, mine)];
}

function seatPosition(index: number, count: number): { x: number; y: number } {
  const angle = Math.PI / 2 + (index / count) * Math.PI * 2;
  // Keep labels inside the stage on narrow screens while leaving enough room
  // below the "you" seat for the persistent answer dock.
  return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 34 };
}

export { seatPosition, template };
