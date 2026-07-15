import { cn } from "@/lib/utils";

/** Content-shaped placeholder with a subtle shimmer, shown while data loads.
 *  Calmer than a bare spinner because the layout doesn't jump on arrival. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-ink/5 dark:bg-white/5",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )}
    />
  );
}
