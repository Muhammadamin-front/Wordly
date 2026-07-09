"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { StatsWidget } from "@/components/gamification/stats-widget";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/locales";

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const { user, ready } = useAuth();

  return (
    <header className="glass sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo lang={lang} />

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft sm:flex">
          {ready && user ? (
            <>
              <Link href={`/${lang}/decks`} className="transition-colors hover:text-ink" title="Decks">
                🃏
              </Link>
              <Link href={`/${lang}/games`} className="transition-colors hover:text-ink" title="Games">
                🎮
              </Link>
              <Link href={`/${lang}/leaderboard`} className="transition-colors hover:text-ink" title="League">
                🏆
              </Link>
              <Link href={`/${lang}/statistics`} className="transition-colors hover:text-ink" title="Stats">
                📊
              </Link>
            </>
          ) : (
            <>
              <Link href={`/${lang}#features`} className="transition-colors hover:text-ink">
                {nav.features}
              </Link>
              <Link href={`/${lang}#pricing`} className="transition-colors hover:text-ink">
                {nav.pricing}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {ready && user && <StatsWidget lang={lang} />}
          <LocaleSwitcher current={lang} />
          <ThemeToggle />
          {ready && user ? (
            <Link href={`/${lang}/dashboard`}>
              <Button size="sm">{nav.dashboard}</Button>
            </Link>
          ) : (
            <>
              <Link href={`/${lang}/auth/login`} className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {nav.login}
                </Button>
              </Link>
              <Link href={`/${lang}/auth/register`}>
                <Button size="sm">{nav.register}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
