import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ lang, className }: { lang: string; className?: string }) {
  return (
    <Link
      href={`/${lang}`}
      className={cn("inline-flex items-baseline gap-0.5 text-xl font-extrabold tracking-tight", className)}
    >
      <span className="text-ink">Words</span>
      <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
        .uz
      </span>
    </Link>
  );
}
