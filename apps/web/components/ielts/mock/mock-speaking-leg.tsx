"use client";

import { useEffect, useRef, useState } from "react";

import { VoiceChat } from "@/components/coach/voice-chat";
import { Alert } from "@/components/ui/alert";
import { coachApi, type Character, type CoachSession } from "@/lib/coach";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];
type Coach = Dictionary["coach"];

/** The Full Mock's Speaking leg: an IELTS-mode conversation with the
 *  "examiner" character, reusing the same chat + scoring UI as standalone
 *  Speaking Coach practice. Grading happens inside VoiceChat itself; this
 *  wrapper only creates the session and forwards the resulting band.
 *  Unlike the other three legs, it does not add its own exit header —
 *  VoiceChat already has a "back" affordance in its own chat header, and
 *  stacking a second one above it was pure clutter. */
export function MockSpeakingLeg({
  t,
  coachT,
  onDone,
  onAbandon,
}: {
  t: Copy;
  coachT: Coach;
  onDone: (band: number, detail: { coach_session_id: string }) => Promise<boolean>;
  onAbandon: () => void;
}) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [coachSession, setCoachSession] = useState<CoachSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  // VoiceChat's "back" button and its post-score "continue" button both call
  // onExit — this tells them apart so a click after scoring doesn't also
  // report a bogus band-0 completion on top of the real one.
  const scoredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const characters = await coachApi.characters();
        const examiner = characters.find((c) => c.key === "examiner") ?? characters[0];
        if (!examiner) throw new Error("no characters");
        const created = await coachApi.createSession({
          character: examiner.key,
          mode: "ielts",
          ielts_part: 1,
        });
        if (cancelled) return;
        setCharacter(examiner);
        setCoachSession(created);
      } catch {
        if (!cancelled) setError(t.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.error]);

  if (!character || !coachSession) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" aria-hidden />
        {error && <Alert tone="error">{error}</Alert>}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6">
      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
      <VoiceChat
        character={character}
        session={coachSession}
        t={coachT}
        onExit={() => {
          // Backing out before scoring means the exam is unfinished, not
          // "scored zero" — abandon the session rather than fake a band.
          if (!scoredRef.current) onAbandon();
        }}
        onScored={async (band) => {
          const ok = await onDone(band, { coach_session_id: coachSession.id });
          // Only treat the exam as scored once the result actually attached
          // to the mock session — otherwise a failed completeLeg call left
          // scoredRef true forever, so backing out afterward silently
          // skipped abandoning a session that never actually advanced.
          if (ok) scoredRef.current = true;
          else setError(t.error);
        }}
        exitLabel={t.speakingContinue}
      />
    </main>
  );
}
