import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  lang,
  className,
  tone = "default",
}: {
  lang: string;
  className?: string;
  tone?: "default" | "inverse" | "home";
}) {
  return (
    <Link
      href={`/${lang}`}
      aria-label="Vocora home"
      className={cn("inline-flex items-center gap-2.5 text-xl font-black tracking-tight", className)}
    >
      <span
        aria-hidden
        className="logo-mark relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-2 border-brand-950 bg-brand-500 shadow-[3px_4px_0_#54250f]"
      >
        <span className="absolute inset-0 bg-[linear-gradient(145deg,#c86a3b_0%,#b94e28_56%,#7e2d1c_100%)]" />
        <svg
          viewBox="0 0 40 40"
          className="relative size-[78%] drop-shadow-[0_6px_10px_rgba(0,0,0,0.22)]"
          role="img"
        >
          <path
            d="M7.2 9.6c2.4-.7 5.1.6 6 3l5.8 15.7 5.8-15.7c.9-2.4 3.5-3.7 6-3l-9 22.6c-.5 1.3-1.6 2.1-2.8 2.1s-2.3-.8-2.8-2.1L7.2 9.6Z"
            fill="#fff8ea"
          />
          <path
            d="M26.7 10.6c2.1-1.3 4.7-.7 6.1 1.1L21 34.1c-1.1 0-2-.5-2.7-1.4l8.4-22.1Z"
            fill="#6c9390"
          />
          <path
            d="M15.9 29.2c2.7.9 5.3.9 7.9 0l-4.8 5.4-3.1-5.4Z"
            fill="#f3e6cb"
            opacity="0.86"
          />
          <circle cx="20" cy="12.4" r="5.2" fill="#d7b38a" />
          <circle cx="18" cy="12.4" r="0.8" fill="#24130c" />
          <circle cx="20" cy="12.4" r="0.8" fill="#24130c" />
          <circle cx="22" cy="12.4" r="0.8" fill="#24130c" />
        </svg>
      </span>
      <span
        className={cn(
          "logo-text text-[21px] font-extrabold text-brand-950 dark:text-ink",
          tone === "inverse" && "text-white!",
          tone === "home" && "text-home-ink!"
        )}
      >
        Vocora
      </span>
    </Link>
  );
}
