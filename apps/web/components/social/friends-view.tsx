"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import {
  socialApi,
  type Friend,
  type LeaderboardEntry,
  type PendingRequest,
} from "@/lib/social";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function FriendsView({ lang, social }: { lang: string; social: Dictionary["social"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  const load = useCallback(() => {
    Promise.all([socialApi.friends(), socialApi.pending(), socialApi.leaderboard()])
      .then(([f, p, b]) => {
        setFriends(f);
        setPending(p);
        setBoard(b);
      })
      .catch(() => {});
    socialApi
      .friendCode()
      .then((r) => setCode(r.message))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ready && user) load();
  }, [ready, user, load]);

  function addFriend(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    socialApi
      .request(trimmed)
      .then(() => {
        setNotice({ tone: "success", text: social.sent });
        setInput("");
        load();
      })
      .catch((err) => {
        const text = err instanceof ApiError ? err.detail : social.invalidCode;
        setNotice({ tone: "error", text });
      });
  }

  const respond = (id: string, accept: boolean) => {
    (accept ? socialApi.accept(id) : socialApi.decline(id)).then(load).catch(() => {});
  };

  const removeFriend = (id: string) => {
    socialApi.remove(id).then(load).catch(() => {});
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  if (!ready || !user) return null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{social.title}</h1>
        <Link
          href={`/${lang}/multiplayer`}
          className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-400"
        >
          🎯 {social.multiplayer}
        </Link>
      </div>

      {/* Friend code */}
      <div className="mt-6 rounded-xl2 border border-line bg-linear-to-br from-brand-500/10 to-transparent p-5">
        <p className="text-sm text-ink-soft">{social.friendCode}</p>
        <div className="mt-2 flex items-center gap-3">
          <code className="rounded-lg bg-card px-4 py-2 text-xl font-extrabold tracking-widest text-brand-600 dark:text-brand-300">
            {code || "····"}
          </code>
          <Button variant="secondary" size="sm" onClick={copyCode} disabled={!code}>
            {copied ? social.copied : social.copy}
          </Button>
        </div>
      </div>

      {/* Add friend */}
      <form onSubmit={addFriend} className="mt-6 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={social.enterCode}
          maxLength={12}
          autoCapitalize="characters"
        />
        <Button type="submit" disabled={!input.trim()}>
          {social.send}
        </Button>
      </form>
      {notice && (
        <Alert tone={notice.tone} className="mt-3">
          {notice.text}
        </Alert>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{social.pending}</h2>
          <ul className="mt-3 space-y-2">
            {pending.map((p) => (
              <li
                key={p.friendship_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3"
              >
                <span className="font-semibold text-ink">{p.display_name}</span>
                <span className="flex gap-2">
                  <Button size="sm" onClick={() => respond(p.friendship_id, true)}>
                    {social.accept}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => respond(p.friendship_id, false)}>
                    {social.decline}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Leaderboard */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{social.leaderboard}</h2>
        <ul className="mt-3 space-y-2">
          {board.map((e) => (
            <li
              key={e.user_id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                e.is_me ? "border-brand-400 bg-brand-500/5" : "border-line bg-card"
              }`}
            >
              <span className="w-6 text-center text-sm font-bold text-ink-soft">{e.rank}</span>
              <span className="flex-1 truncate font-semibold text-ink">
                {e.display_name} {e.is_me && <span className="text-brand-600 dark:text-brand-300">· {social.you}</span>}
              </span>
              <span className="text-sm text-ink-soft">🔥 {e.current_streak}</span>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{e.xp} XP</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Friends list */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{social.friends}</h2>
        {friends.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
            {social.noFriends}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {friends.map((f) => (
              <li
                key={f.user_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3"
              >
                <span>
                  <span className="font-semibold text-ink">{f.display_name}</span>
                  <span className="ml-2 text-xs text-ink-soft">
                    {social.level} {f.level} · 🔥 {f.current_streak}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => removeFriend(f.user_id)}>
                  {social.remove}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
