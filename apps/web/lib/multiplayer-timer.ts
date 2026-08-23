"use client";

import { useEffect, useState } from "react";

/** Renders a countdown against a server-issued deadline without trusting the
 *  client's own clock as authority: `serverNow` (epoch ms, sent alongside
 *  `endsAt` on every timed message) gives a one-time offset correction, then
 *  everything ticks locally off `Date.now()` — no repeated round-trips, and
 *  the actual phase transition is still driven by the *next* server message,
 *  never by this timer reaching zero on the client.
 *
 *  `Date.now()` only runs inside the effect/interval callback, never during
 *  render — the render-time seed value (`remainingMsAtMount`, used once to
 *  set the visual bar's animation duration) is derived purely from the two
 *  server timestamps instead, accurate to within network latency.
 *
 *  Only ticks a low-frequency (1/sec) `secondsLeft` for a numeric readout —
 *  a visual bar/ring should animate via a framer-motion `transition` set
 *  once from `remainingMsAtMount`, letting the browser interpolate it
 *  instead of re-rendering React on every frame. */
export function useServerCountdown(endsAt: number, serverNow: number) {
  const remainingMsAtMount = Math.max(0, endsAt - serverNow);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.ceil(remainingMsAtMount / 1000));

  // Reset instantly when a new deadline arrives (new question, etc.) instead
  // of waiting up to 250ms for the next interval tick — the sanctioned
  // "adjust state during render" pattern, not an effect, so it stays pure.
  const [seenEndsAt, setSeenEndsAt] = useState(endsAt);
  if (endsAt !== seenEndsAt) {
    setSeenEndsAt(endsAt);
    setSecondsLeft(Math.ceil(remainingMsAtMount / 1000));
  }

  useEffect(() => {
    const offsetMs = serverNow - Date.now();
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, endsAt - (Date.now() + offsetMs));
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [endsAt, serverNow]);

  return { secondsLeft, remainingMsAtMount };
}
