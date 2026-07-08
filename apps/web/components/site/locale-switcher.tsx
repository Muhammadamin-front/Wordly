"use client";

import { usePathname, useRouter } from "next/navigation";

import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS, type Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

function persistLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (locale: Locale) => {
    if (locale === current) return;
    persistLocaleCookie(locale);
    const rest = pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, "");
    router.push(`/${locale}${rest || ""}`);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-line p-0.5">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-pressed={locale === current}
          title={LOCALE_LABELS[locale]}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-bold uppercase transition-colors",
            locale === current
              ? "bg-brand-600 text-white"
              : "text-ink-soft hover:bg-line/60 hover:text-ink"
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
