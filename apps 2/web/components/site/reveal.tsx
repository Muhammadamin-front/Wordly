import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Lightweight CSS fade-up wrapper for landing sections. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style: CSSProperties | undefined =
    delay > 0 ? { animationDelay: `${delay}s` } : undefined;

  return (
    <div className={cn("animate-fade-up motion-reduce:animate-none", className)} style={style}>
      {children}
    </div>
  );
}
