"use client";

import { ArrowRight, Link2, Plus, Radio } from "lucide-react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import styles from "./word-chain.module.css";

type Copy = Dictionary["wordChain"];

export function GameMenu({
  copy,
  connecting,
  invitationTransition,
  onCreate,
  onFindMatch,
  onJoin,
}: {
  copy: Copy;
  connecting: boolean;
  invitationTransition: "creating" | "joining" | null;
  onCreate: () => void;
  onFindMatch: () => void;
  onJoin: (code: string) => void;
}) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim().toUpperCase();
    if (code) onJoin(code);
  };

  return (
    <div className={styles.lobbyGrid}>
      {invitationTransition && (
        <section className={styles.onlinePanel} aria-labelledby="friend-invite-heading">
          <span className={styles.onlineSignal} aria-hidden>
            <Link2 size={27} />
          </span>
          <div>
            <h2 id="friend-invite-heading" className={styles.onlineHeading}>
              {invitationTransition === "creating" ? copy.creatingFriendInvite : copy.joiningFriendInvite}
            </h2>
            <p className={styles.onlineDescription} role="status">
              {invitationTransition === "creating" ? copy.creatingFriendInviteHint : copy.joiningFriendInviteHint}
            </p>
          </div>
        </section>
      )}

      <section className={styles.onlinePanel} aria-labelledby="play-online-heading">
        <span className={styles.onlineSignal} aria-hidden>
          <Radio size={27} />
        </span>
        <div>
          <h2 id="play-online-heading" className={styles.onlineHeading}>{copy.playOnline}</h2>
          <p className={styles.onlineDescription}>{copy.playOnlineHint}</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={onFindMatch} disabled={connecting}>
          {copy.playOnline}<ArrowRight size={18} aria-hidden />
        </button>
      </section>

      <section className={styles.lobbyPanel}>
        <div className={styles.lobbyHero}>
          <Plus size={30} aria-hidden style={{ color: "var(--wc-teal)" }} />
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>{copy.createGame}</h2>
            <p style={{ marginTop: ".4rem", color: "var(--wc-muted)", lineHeight: 1.6 }}>{copy.subtitle}</p>
          </div>
          <button type="button" className={styles.primaryButton} onClick={onCreate} disabled={connecting}>
            {copy.createGame}<ArrowRight size={18} aria-hidden />
          </button>
        </div>
      </section>

      <section className={styles.lobbyPanel}>
        <Link2 size={26} aria-hidden style={{ color: "var(--wc-teal)" }} />
        <h2 style={{ marginTop: ".8rem", fontSize: "1.35rem", fontWeight: 850 }}>{copy.joinGame}</h2>
        <form className={styles.formStack} onSubmit={submit}>
          <label htmlFor="word-chain-code" className={styles.label}>{copy.roomCode}</label>
          <div className={styles.joinRow}>
            <input
              id="word-chain-code"
              name="code"
              className={styles.codeInput}
              maxLength={6}
              placeholder={copy.roomCodeHint}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={connecting}
            />
            <button type="submit" className={styles.secondaryButton} disabled={connecting}>{copy.join}</button>
          </div>
        </form>
        {connecting && <p role="status" style={{ marginTop: ".8rem", color: "var(--wc-muted)" }}>{copy.connecting}</p>}
      </section>
    </div>
  );
}
