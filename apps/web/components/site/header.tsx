"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { StatsWidget } from "@/components/gamification/stats-widget";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/locales";

type NavKey =
  | "dashboard"
  | "decks"
  | "games"
  | "skills"
  | "ielts"
  | "leaderboard"
  | "friends"
  | "statistics"
  | "classes"
  | "billing";

interface NavItem {
  key: NavKey;
  href: string; // path suffix after /{lang}
  icon: string;
}

// Order = importance. Shown labelled on desktop and in the mobile sidebar.
const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "dashboard", icon: "🏠" },
  { key: "decks", href: "decks", icon: "🃏" },
  { key: "games", href: "games", icon: "🎮" },
  { key: "skills", href: "skills", icon: "📚" },
  { key: "ielts", href: "ielts", icon: "🎓" },
  { key: "leaderboard", href: "leaderboard", icon: "🏆" },
  { key: "friends", href: "friends", icon: "🤝" },
  { key: "statistics", href: "statistics", icon: "📊" },
  { key: "classes", href: "classes", icon: "🎒" },
  { key: "billing", href: "billing", icon: "💎" },
];

function isActive(pathname: string, lang: string, href: string): boolean {
  const full = `/${lang}/${href}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const { user, ready } = useAuth();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const authed = ready && !!user;

  // Lock body scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="glass sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Mobile: hamburger opens the sidebar */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={nav.menu}
          className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-line/60 hover:text-ink lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="shrink-0">
          <Logo lang={lang} />
        </div>

        {/* Desktop: labelled nav (horizontally scrollable if it overflows) */}
        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
          {authed ? (
            NAV_ITEMS.map((item) => {
              const active = isActive(pathname, lang, item.href);
              return (
                <Link
                  key={item.key}
                  href={`/${lang}/${item.href}`}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-brand-600/10 text-brand-600 dark:text-brand-300"
                      : "text-ink-soft hover:bg-line/60 hover:text-ink"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {nav[item.key]}
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href={`/${lang}#features`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {nav.features}
              </Link>
              <Link
                href={`/${lang}#pricing`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {nav.pricing}
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {authed && <StatsWidget lang={lang} />}
          <div className="hidden sm:block">
            <LocaleSwitcher current={lang} />
          </div>
          <ThemeToggle />
          {authed ? (
            <Link href={`/${lang}/dashboard`} className="hidden lg:block">
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

      <MobileSidebar
        lang={lang}
        nav={nav}
        authed={authed}
        pathname={pathname}
        open={open}
        onClose={() => setOpen(false)}
      />
    </header>
  );
}

function MobileSidebar({
  lang,
  nav,
  authed,
  pathname,
  open,
  onClose,
}: {
  lang: Locale;
  nav: Dictionary["nav"];
  authed: boolean;
  pathname: string;
  open: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label={nav.close}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col bg-page shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Logo lang={lang} />
              <button
                type="button"
                aria-label={nav.close}
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-line/60 hover:text-ink"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {authed ? (
                NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, lang, item.href);
                  return (
                    <Link
                      key={item.key}
                      href={`/${lang}/${item.href}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                        active
                          ? "bg-brand-600/10 text-brand-600 dark:text-brand-300"
                          : "text-ink hover:bg-line/60"
                      )}
                    >
                      <span className="text-xl leading-none">{item.icon}</span>
                      {nav[item.key]}
                    </Link>
                  );
                })
              ) : (
                <>
                  <Link
                    href={`/${lang}#features`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-line/60"
                  >
                    <span className="text-xl">✨</span>
                    {nav.features}
                  </Link>
                  <Link
                    href={`/${lang}#pricing`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-line/60"
                  >
                    <span className="text-xl">💎</span>
                    {nav.pricing}
                  </Link>
                </>
              )}
            </nav>

            <div className="shrink-0 space-y-3 border-t border-line p-3">
              <div className="flex items-center justify-between">
                <LocaleSwitcher current={lang} />
                <ThemeToggle />
              </div>
              {authed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onClose();
                    void logout();
                  }}
                >
                  {nav.logout}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${lang}/auth/login`} onClick={onClose}>
                    <Button variant="ghost" size="sm" fullWidth>
                      {nav.login}
                    </Button>
                  </Link>
                  <Link href={`/${lang}/auth/register`} onClick={onClose}>
                    <Button size="sm" fullWidth>
                      {nav.register}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
