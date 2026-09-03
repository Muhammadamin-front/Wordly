"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { CHARACTER_THEMES, friendshipTitle } from "@/components/coach/characters";
import { VoiceChat } from "@/components/coach/voice-chat";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  coachApi,
  type Character,
  type CoachDashboard,
  type CoachMode,
  type CoachSession,
} from "@/lib/coach";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Coach = Dictionary["coach"];

/** "Speaking Coach — 10 minutes a week, 6 left." Shown before a session, and
 *  as the upgrade line for a learner who has no minutes at all. */
function VoiceAllowance({ lang, t }: { lang: string; t: Coach }) {
  const { data } = useApi("coach:voice-quota", () => coachApi.voiceQuota());
  if (!data) return null;

  const perWeek = Math.round(data.allowance_seconds / 60);
  const left = Math.floor(data.remaining_seconds / 60);

  if (!data.premium || data.allowance_seconds === 0) {
    return (
      <Link
        href={`/${lang}/billing`}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-500/50 bg-accent-400/12 px-3 py-1.5 text-xs font-black text-accent-700 transition-colors hover:bg-accent-400/20 dark:text-accent-300"
      >
        <Crown className="size-3.5" aria-hidden />
        {t.voicePremiumOnly}
      </Link>
    );
  }

  const out = data.remaining_seconds <= 0;
  return (
    <p
      className={cn(
        "mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black",
        out
          ? "border-danger/40 bg-danger/8 text-danger-text"
          : "border-accent-500/50 bg-accent-400/12 text-accent-700 dark:text-accent-300"
      )}
    >
      <Crown className="size-3.5" aria-hidden />
      {t.voiceAllowance.replace("{perWeek}", String(perWeek)).replace("{left}", String(left))}
    </p>
  );
}

export function CoachView({ lang, t }: { lang: string; t: Coach }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [dashboard, setDashboard] = useState<CoachDashboard | null>(null);
  const [selected, setSelected] = useState<Character | null>(null);
  const [session, setSession] = useState<CoachSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  const loadDashboard = useCallback(() => {
    coachApi.dashboard().then(setDashboard).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    coachApi.characters().then(setCharacters).catch(() => {});
    loadDashboard();
  }, [ready, user, loadDashboard]);

  if (!ready || !user) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  if (session && selected) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6">
        <VoiceChat
          character={selected}
          session={session}
          t={t}
          onExit={() => {
            setSession(null);
            setSelected(null);
            loadDashboard();
          }}
        />
      </main>
    );
  }

  const progressByKey = new Map(dashboard?.progress.map((p) => [p.character, p]) ?? []);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">🎙️ {t.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p>
        {/* Live voice is the most expensive thing here, so it is a named,
            finite part of Premium rather than a silently metered extra. */}
        <VoiceAllowance lang={lang} t={t} />
      </div>

      {dashboard && !dashboard.enabled && (
        <Alert tone="info" className="mt-5">
          {t.notConfigured}
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mt-5">
          {error}
        </Alert>
      )}

      {dashboard && dashboard.total_sessions > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label={t.sessionsLabel} value={dashboard.total_sessions} icon="💬" />
          <Stat label={t.turnsLabel} value={dashboard.total_turns} icon="🗨️" />
          <Stat label={t.mistakesLabel} value={dashboard.total_errors} icon="✍️" />
        </div>
      )}

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-soft">
        {t.chooseCharacter}
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {characters.map((character, i) => {
          const theme = CHARACTER_THEMES[character.key];
          const progress = progressByKey.get(character.key);
          return (
            <motion.button
              key={character.key}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                setSelected(character);
                setError(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-md",
                selected?.key === character.key
                  ? cn("border-transparent ring-2", theme.accent)
                  : "border-line"
              )}
            >
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-3xl",
                  theme.gradient
                )}
              >
                {character.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-ink">{character.name}</p>
                <p className="text-xs text-ink-soft">{character.tagline}</p>
                {progress && (
                  <p className="mt-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                    ❤️ {friendshipTitle(progress.friendship_level)} · {progress.sessions_count}{" "}
                    {t.sessionsLabel.toLowerCase()}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <StartPanel
          key={selected.key}
          character={selected}
          t={t}
          onStart={async (body) => {
            setError(null);
            try {
              const created = await coachApi.createSession({
                character: selected.key,
                ...body,
              });
              setSession(created);
            } catch {
              setError(t.error);
            }
          }}
        />
      )}

      {dashboard && dashboard.recent_errors.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
            {t.recentMistakes}
          </h2>
          <div className="mt-3 space-y-2">
            {dashboard.recent_errors.slice(0, 6).map((e, i) => (
              <Card key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm">
                <span className="text-ink-soft line-through decoration-danger/60">{e.original}</span>
                <span className="text-ink-soft">→</span>
                <span className="font-semibold text-success-text">{e.correction}</span>
                {e.explanation && (
                  <span className="w-full text-xs text-ink-soft">{e.explanation}</span>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {dashboard?.latest_report && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
            {t.latestBand}
          </h2>
          <Card className="mt-3 flex items-center gap-4">
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-800 text-white">
              <span className="text-[9px] font-semibold uppercase opacity-80">{t.bandScore}</span>
              <span className="text-xl font-extrabold">
                {dashboard.latest_report.band_overall.toFixed(1)}
              </span>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
              <BandChip label={t.fluency} value={dashboard.latest_report.fluency} />
              <BandChip label={t.lexical} value={dashboard.latest_report.lexical} />
              <BandChip label={t.grammar} value={dashboard.latest_report.grammar} />
              <BandChip label={t.pronunciation} value={dashboard.latest_report.pronunciation} />
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3 text-center">
      <p className="text-2xl">{icon}</p>
      <p className="text-xl font-extrabold text-ink">{value}</p>
      <p className="text-[11px] text-ink-soft">{label}</p>
    </div>
  );
}

function BandChip({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-ink-soft">{label}</p>
      <p className="font-bold text-ink">{value.toFixed(1)}</p>
    </div>
  );
}

function StartPanel({
  character,
  t,
  onStart,
}: {
  character: Character;
  t: Coach;
  onStart: (body: { mode: CoachMode; ielts_part?: number; topic?: string }) => Promise<void>;
}) {
  // The examiner defaults to a full IELTS test. StartPanel is keyed by
  // character, so this initialiser re-runs when the selection changes.
  const [mode, setMode] = useState<CoachMode>(character.key === "examiner" ? "ielts" : "chat");
  const [part, setPart] = useState(1);
  const [topic, setTopic] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 rounded-2xl border border-line bg-card p-4"
    >
      <div className="flex gap-1 rounded-xl border border-line p-1">
        {(["chat", "ielts"] as CoachMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              mode === m ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            {m === "chat" ? t.chatMode : t.ieltsMode}
          </button>
        ))}
      </div>

      {mode === "ielts" && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-ink-soft">{t.ieltsPart}:</span>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPart(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-bold",
                part === p ? "bg-brand-600 text-white" : "text-ink-soft hover:bg-line"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={160}
        placeholder={t.topicPlaceholder}
        className="mt-3 h-11 w-full rounded-xl border border-line bg-page px-4 text-sm text-ink focus:border-brand-400 focus:outline-none"
      />

      <Button
        fullWidth
        className="mt-3"
        loading={pending}
        onClick={async () => {
          setPending(true);
          await onStart({
            mode,
            ielts_part: mode === "ielts" ? part : undefined,
            topic: topic.trim() || undefined,
          });
          setPending(false);
        }}
      >
        {t.start} {character.emoji}
      </Button>
    </motion.div>
  );
}
