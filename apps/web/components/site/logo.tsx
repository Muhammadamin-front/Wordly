import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ lang, className }: { lang: string; className?: string }) {
  return (
    <Link
      href={`/${lang}`}
      className={cn("inline-flex items-center gap-2 text-xl font-extrabold tracking-tight", className)}
    >
      <Image
        src="/icons/icon-192.png"
        alt="Wordly"
        width={28}
        height={28}
        className="size-7 rounded-lg"
        priority
      />
      <span>
        <span className="text-ink">Word</span>
        <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
          ly
        </span>
      </span>
    </Link>
  );
}
