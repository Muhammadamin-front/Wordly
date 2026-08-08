"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** @deprecated Use components/ui/progress for new shared progress UI. */
export function ProgressBar({ value, barClass }: { value: number; barClass: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
      <motion.div
        className={cn("h-full rounded-full", barClass)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}
