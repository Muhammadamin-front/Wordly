import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ lang, className }: { lang: string; className?: string }) {
  return (
    <Link
      href={`/${lang}`}
      className={cn("inline-flex items-center gap-2.5 text-xl font-black tracking-tight", className)}
    >
      <span
        aria-hidden
        className="relative flex size-9 items-center justify-center text-[28px] font-black leading-none text-brand-900 dark:text-brand-200"
      >
        <span className="-rotate-6">w</span>
      </span>
      <span className="text-[21px] lowercase text-brand-950 dark:text-ink">wordly</span>
    </Link>
  );
}
