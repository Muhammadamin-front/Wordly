"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { ReadingPracticeView } from "@/components/ielts/reading-practice-view";
import { ApiError } from "@/lib/api";
import {
  ieltsMockApi,
  type MockSession,
  type MockSessionListItem,
  type MockSkill,
  type MockTrack,
} from "@/lib/ielts-mock";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { MockIntro } from "./mock-intro";
import { MockLegTransition } from "./mock-leg-transition";
import { MockListeningLeg } from "./mock-listening-leg";
import { MockReport } from "./mock-report";
import { MockSpeakingLeg } from "./mock-speaking-leg";
import { MockWritingLeg } from "./mock-writing-leg";

export function MockOrchestrator({
  lang,
  t,
  readingT,
  coachT,
  ieltsT,
}: {
  lang: string;
  t: Dictionary["ieltsMock"];
  readingT: Dictionary["readingPractice"];
  coachT: Dictionary["coach"];
  ieltsT: Dictionary["ielts"];
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MockSession | null>(null);
  const [history, setHistory] = useState<MockSessionListItem[]>([]);
  const [paywalled, setPaywalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [justCompleted, setJustCompleted] = useState<{ skill: MockSkill; band: number } | null>(null);

  // Deterministic, not random: a page reload during the Reading leg remounts
  // this whole component, so a random pick here used to hand the learner a
  // *different* passage (and a freshly reset timer) than the one they were
  // mid-attempt on. Deriving the choice from the session id means the same
  // session always resolves to the same passage, reload or not, with no
  // extra storage needed.
  const readingTestId = useMemo(
    () => (session ? readingTestIdForTrack(session.id) : null),
    [session?.id, session?.track]
  );

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  const loadHistory = useCallback(() => {
    ieltsMockApi
      .listSessions()
      .then(setHistory)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const sessions = await ieltsMockApi.listSessions();
        if (cancelled) return;
        setHistory(sessions);
        const active = sessions.find((s) => s.status === "in_progress");
        if (active) {
          const full = await ieltsMockApi.getSession(active.id);
          if (!cancelled) setSession(full);
        }
      } catch (err) {
        if (!cancelled && err instanceof ApiError && err.status === 402) setPaywalled(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  async function start(track: MockTrack) {
    setStarting(true);
    setError(null);
    setPaywalled(false);
    try {
      const created = await ieltsMockApi.createSession(track);
      setSession(created);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setPaywalled(true);
      else setError(t.error);
    } finally {
      setStarting(false);
    }
  }

  async function abandon() {
    if (!session) return;
    try {
      await ieltsMockApi.abandonSession(session.id);
    } catch {
      // The session state is what matters below; a failed abandon call still
      // lets the learner leave, they just may find it resumable next time.
    }
    setSession(null);
    setJustCompleted(null);
    loadHistory();
  }

  /** Returns whether the leg's result was actually recorded. The grading
   *  call that produced `band` already succeeded by the time this runs — a
   *  failure here only means attaching that result to the mock session
   *  failed (network blip / 5xx), so the caller must surface it and let the
   *  learner retry rather than silently spinning forever. */
  async function completeLeg(
    skill: MockSkill,
    band: number,
    detail?: Record<string, unknown>
  ): Promise<boolean> {
    if (!session) return false;
    try {
      const updated = await ieltsMockApi.completeLeg(session.id, skill, band, detail);
      setSession(updated);
      setJustCompleted({ skill, band });
      if (updated.status === "finished") loadHistory();
      return true;
    } catch {
      setError(t.error);
      return false;
    }
  }

  if (!ready || !user || loading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" aria-label={t.loadingSession} />
      </main>
    );
  }

  if (!session) {
    return (
      <MockIntro
        t={t}
        history={history}
        paywalled={paywalled}
        starting={starting}
        error={error}
        lang={lang}
        onStart={start}
        onViewAttempt={async (id) => {
          const full = await ieltsMockApi.getSession(id);
          setSession(full);
        }}
      />
    );
  }

  if (session.status === "finished" || session.status === "abandoned") {
    return (
      <MockReport
        t={t}
        session={session}
        onRetake={() => {
          setSession(null);
          setJustCompleted(null);
        }}
        lang={lang}
      />
    );
  }

  if (justCompleted && session.current_leg) {
    return (
      <MockLegTransition
        t={t}
        completed={justCompleted}
        nextSkill={session.current_leg}
        onContinue={() => setJustCompleted(null)}
      />
    );
  }

  const skill = session.current_leg;
  if (!skill) {
    // status is in_progress but current_leg is null — shouldn't happen, but
    // fall back to the report screen rather than a blank page.
    return <MockReport t={t} session={session} onRetake={() => setSession(null)} lang={lang} />;
  }

  if (skill === "listening") {
    return (
      <MockListeningLeg
        t={t}
        ieltsT={ieltsT}
        session={session}
        onDone={(band, detail) => completeLeg("listening", band, detail)}
        onAbandon={abandon}
      />
    );
  }

  if (skill === "reading" && readingTestId) {
    return (
      <ReadingPracticeView
        t={readingT}
        mockTestId={readingTestId}
        onMockComplete={({ band, score, total }) =>
          completeLeg("reading", band, { correct: score, total })
        }
        onMockExit={abandon}
        mockExitLabel={t.exit}
      />
    );
  }

  if (skill === "writing") {
    return (
      <MockWritingLeg
        t={t}
        ieltsT={ieltsT}
        lang={lang}
        session={session}
        onDone={(band, detail) => completeLeg("writing", band, detail)}
        onAbandon={abandon}
      />
    );
  }

  return (
    <MockSpeakingLeg
      t={t}
      coachT={coachT}
      onDone={(band, detail) => completeLeg("speaking", band, detail)}
      onAbandon={abandon}
    />
  );
}

/** Picks one of the full-length Cambridge-style Reading tests at random, so
 *  repeat mocks do not always draw the same passage. There is no full-length
 *  (3-passage, 40-question) General Training bank yet — see MockIntro, which
 *  only offers the Academic track until that content exists, so every mock
 *  session reaching this leg is Academic regardless of the `track` field. */
function readingTestIdForTrack(sessionId: string): string {
  const academicIds = [
    "academic-full-volcano-hazards",
    "academic-full-coral-reefs",
    "academic-full-space-weather",
    "academic-full-groundwater",
    "academic-full-el-nino",
  ];
  let hash = 0;
  for (let index = 0; index < sessionId.length; index += 1) {
    hash = (hash * 31 + sessionId.charCodeAt(index)) >>> 0;
  }
  return academicIds[hash % academicIds.length];
}
