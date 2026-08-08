import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  lang,
  className,
  tone = "default",
}: {
  lang: string;
  className?: string;
  tone?: "default" | "inverse";
}) {
  return (
    <Link
      href={`/${lang}`}
      aria-label="Vocora home"
      className={cn("inline-flex items-center gap-2.5 text-xl font-black tracking-tight", className)}
    >
      <Image
        src="/brand/vocora-icon.png"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="logo-mark size-9 rounded-[11px] object-cover shadow-[0_8px_20px_rgba(31,20,100,0.18)]"
      />
      <span
        className={cn(
          "logo-text text-[21px] font-extrabold text-brand-950 dark:text-ink",
          tone === "inverse" && "!text-white"
        )}
      >
        Vocora
      </span>
    </Link>
  );
}
