"use client";

import { Bot, Check, Copy, Crown, LogOut, Play, Plus, Radio, Users } from "lucide-react";
import { useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { WordChainState } from "@/lib/word-chain";
import styles from "./word-chain.module.css";

type Copy = Dictionary["wordChain"];

export function GameLobby({
  copy,
  state,
  myUserId,
  onAddBot,
  onStart,
  onLeave,
}: {
  copy: Copy;
  state: WordChainState;
  myUserId: string;
  onAddBot: () => void;
  onStart: () => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isHost = state.host_id === myUserId;
  const canAddBot = state.players.length < state.config.max_players;
  const isSearching = state.matchmaking_status === "searching";
  const isOnlineMatch = state.matchmaking_status !== null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(state.code);
    } catch {
      // Clipboard access can be denied (permissions, non-HTTPS, some
      // in-app browsers) — the room code stays visible on screen either
      // way, so this must never surface as an unhandled rejection.
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.lobbyGrid}>
      <section className={styles.lobbyPanel} aria-labelledby="room-code-heading">
        {isOnlineMatch ? (
          <div className={`${styles.lobbyHero} ${styles.matchmakingHero}`}>
            <Radio className={isSearching ? styles.matchmakingSignal : undefined} size={30} aria-hidden />
            <div>
              <h2 id="room-code-heading" style={{ fontSize: "1.5rem", fontWeight: 850 }}>
                {isSearching ? copy.findingOpponent : copy.opponentFound}
              </h2>
              <p style={{ marginTop: ".4rem", color: "var(--wc-muted)", lineHeight: 1.6 }}>
                {isSearching ? copy.findingOpponentHint : copy.onlineMatchHint}
              </p>
            </div>
            {isSearching ? (
              <p className={styles.matchmakingStatus} role="status">{copy.findingOpponent}</p>
            ) : isHost ? (
              <button type="button" className={styles.primaryButton} onClick={onStart}>
                <Play size={18} aria-hidden />
                {copy.startGame}
              </button>
            ) : (
              <p className={styles.matchmakingStatus} role="status">{copy.opponentFound}</p>
            )}
          </div>
        ) : (
          <>
            <div className={styles.lobbyHero}>
              <div>
                <p id="room-code-heading" className={styles.label}>{copy.roomCode}</p>
                <p className={styles.roomCode}>{state.code}</p>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={copyCode}>
                {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
                {copied ? copy.copied : copy.copy}
              </button>
            </div>

            <div className={styles.actionRow} style={{ marginTop: "1rem" }}>
              {isHost ? (
                <>
                  <button type="button" className={styles.secondaryButton} onClick={onAddBot} disabled={!canAddBot}>
                    <Plus size={18} aria-hidden />
                    <Bot size={18} aria-hidden />
                    {copy.addBot}
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={onStart}>
                    <Play size={18} aria-hidden />
                    {copy.startGame}
                  </button>
                </>
              ) : (
                <p style={{ color: "var(--wc-muted)", alignSelf: "center" }}>{copy.waiting}</p>
              )}
            </div>
          </>
        )}
      </section>

      <section className={styles.lobbyPanel} aria-labelledby="players-heading">
        <p id="players-heading" className={styles.label}>
          <Users size={15} aria-hidden style={{ display: "inline", marginRight: 6 }} />
          {copy.players} · {state.players.length}/{state.config.max_players}
        </p>
        <div className={styles.playerList}>
          {state.players.map((player) => (
            <div className={styles.playerRow} key={player.id}>
              <span className={styles.avatar} aria-hidden>
                {player.avatar_url ? (
                  <span style={{ width: "100%", height: "100%", backgroundImage: `url(${player.avatar_url})`, backgroundPosition: "center", backgroundSize: "cover" }} />
                ) : player.username.slice(0, 1).toUpperCase()}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {player.username} {player.id === myUserId ? `(${copy.you})` : ""}
                </p>
                <p style={{ color: "var(--wc-muted)", fontSize: ".75rem" }}>
                  {player.is_bot ? copy.bot : player.id === state.host_id ? copy.host : copy.waitingStatus}
                </p>
              </div>
              {player.id === state.host_id ? <Crown size={17} aria-label={copy.host} /> : <span className={styles.statusDot} />}
            </div>
          ))}
        </div>
        <button type="button" className={styles.quietButton} onClick={onLeave} style={{ width: "100%", marginTop: "1rem" }}>
          <LogOut size={17} aria-hidden />
          {isSearching ? copy.cancelSearch : copy.leaveGame}
        </button>
      </section>
    </div>
  );
}
