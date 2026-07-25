import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ lang, className }: { lang: string; className?: string }) {
  return (
    <Link
      href={`/${lang}`}
      className={cn("inline-flex items-center gap-2 text-xl font-black tracking-tight", className)}
    >
      <span className="icon-tile flex size-8 items-center justify-center rounded-lg">
        <Image
          src="/icons/icon-192.png"
          alt="Wordly"
          width={24}
          height={24}
          className="size-6 rounded-md"
          priority
        />
      </span>
      <span>
        <span className="text-ink">Word</span>
        <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-rose-300 bg-clip-text text-transparent">
          ly
        </span>
      </span>
    </Link>
  );
}
