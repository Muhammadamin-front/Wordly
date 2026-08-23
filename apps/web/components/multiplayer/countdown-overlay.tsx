"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { useServerCountdown } from "@/lib/multiplayer-timer";

/** Full-screen 3-2-1-GO, driven entirely by the server deadline — the digit
 *  it shows is derived from `secondsLeft`, never a locally-owned counter, so
 *  every player sees the same number at (close to) the same wall-clock
 *  moment regardless of when their own countdown message arrived. */
export function CountdownOverlay({
  endsAt,
  serverNow,
  onTick,
}: {
  endsAt: number;
  serverNow: number;
  onTick?: (secondsLeft: number) => void;
}) {
  const { secondsLeft } = useServerCountdown(endsAt, serverNow);
  const lastTicked = useRef<number | null>(null);

  useEffect(() => {
    if (lastTicked.current !== secondsLeft) {
      lastTicked.current = secondsLeft;
      onTick?.(secondsLeft);
    }
  }, [secondsLeft, onTick]);

  const label = secondsLeft > 0 ? String(secondsLeft) : "GO!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/85 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[7rem] leading-none text-brand-50 sm:text-[9rem]"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
