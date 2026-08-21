"use client";

import {
  BarChart3,
  BookOpen,
  Boxes,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  Gamepad2,
  GraduationCap,
  LibraryBig,
  LogOut,
  Map,
  Menu,
  Sparkles,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { getHomeLabel, getWordsLabel } from "@/lib/nav-labels";
import type { Locale } from "@/lib/locales";

const StatsWidget = dynamic(
  () => import("@/components/gamification/stats-widget").then((mod) => mod.StatsWidget),
  { loading: () => null, ssr: false }
);

type NavKey =
  | "dashboard"
  | "today"
  | "decks"
  | "games"
  | "skills"
  | "grammar"
  | "ielts"
  | "leaderboard"
  | "friends"
  | "statistics"
  | "mastery"
  | "classes"
  | "billing";

interface NavItem {
  key: NavKey;
  href: string; // path suffix after /{lang}
  icon: LucideIcon;
}

const PRIMARY_NAV: NavItem[] = [
  { key: "dashboard", href: "dashboard", icon: Sparkles },
  { key: "today", href: "today", icon: CalendarCheck },
  { key: "decks", href: "decks", icon: LibraryBig },
  { key: "ielts", href: "ielts", icon: GraduationCap },
  { key: "mastery", href: "mastery", icon: Map },
];

const SECONDARY_NAV: NavItem[] = [
  { key: "games", href: "games", icon: Gamepad2 },
  { key: "grammar", href: "grammar", icon: Boxes },
  { key: "skills", href: "skills", icon: BookOpen },
  { key: "statistics", href: "statistics", icon: BarChart3 },
  { key: "leaderboard", href: "leaderboard", icon: Trophy },
  { key: "friends", href: "friends", icon: Users },
  { key: "classes", href: "classes", icon: Sparkles },
  { key: "billing", href: "billing", icon: CreditCard },
];

function isActive(pathname: string, lang: string, href: string): boolean {
  const full = `/${lang}/${href}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const { user, ready, logout } = useAuth();
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
    <header className="site-header sticky top-0 z-40">
      <div className="glass mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-[18px] px-2 sm:h-16 sm:gap-3 sm:rounded-[20px] shadow-[0_14px_44px_rgba(24,63,57,0.09)] sm:px-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={nav.menu}
          className="-ml-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg border border-line/80 bg-card/60 text-ink-soft shadow-sm transition-all hover:-translate-y-0.5 hover:bg-raised hover:text-ink lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="shrink-0">
          <Logo lang={lang} className="site-header-logo [&_.logo-mark]:size-8 [&_.logo-text]:text-lg sm:[&_.logo-mark]:size-9 sm:[&_.logo-text]:text-[21px]" />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-visible lg:flex">
          {authed ? (
            <>
              {PRIMARY_NAV.map((item) => (
                <DesktopNavLink key={item.key} item={item} lang={lang} nav={nav} pathname={pathname} />
              ))}
              <div className="flex shrink-0 items-center gap-1.5">
                <DesktopNavGroup items={SECONDARY_NAV} lang={lang} nav={nav} pathname={pathname} />
              </div>
            </>
          ) : (
            <>
              <Link
                href={`/${lang}`}
                className="relative px-3 py-2 text-sm font-bold text-brand-950 after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:bg-brand-900 dark:text-ink"
              >
                {getHomeLabel(lang)}
              </Link>
              <Link
                href={`/${lang}/vocabulary`}
                className="px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-brand-900 dark:hover:text-ink"
              >
                {getWordsLabel(lang)}
              </Link>
              <Link
                href={`/${lang}/ielts`}
                className="px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-brand-900 dark:hover:text-ink"
              >
                IELTS
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {authed && <StatsWidget lang={lang} />}
          <ThemeToggle lang={lang} className="hidden lg:flex" />
          <div className="hidden sm:block">
            <LocaleSwitcher current={lang} />
          </div>
          {authed ? (
            // Desktop had no way to sign out at all — the only logout lived in
            // the mobile drawer, which never opens at lg and above.
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={async () => {
                await logout();
              }}
            >
              <LogOut className="size-4" aria-hidden />
              {nav.logout}
            </Button>
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
      {authed && <MobileBottomNav lang={lang} nav={nav} pathname={pathname} />}
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-[fade-in_0.2s_ease-out_both] lg:hidden">
      <button
        type="button"
        aria-label={nav.close}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <aside
        className="surface-panel absolute! inset-y-0 left-0 flex w-[min(22rem,calc(100vw-1rem))] max-w-none animate-[drawer-in_0.2s_ease-out_both] flex-col rounded-r-lg bg-page/92 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-line px-4 pt-[env(safe-area-inset-top)]">
          <Logo lang={lang} />
          <button
            type="button"
            aria-label={nav.close}
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg border border-line bg-card/70 text-ink-soft transition-all hover:bg-raised hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {authed ? (
            <>
              <div className="space-y-1">
                {PRIMARY_NAV.map((item) => (
                  <MobileNavLink
                    key={item.key}
                    item={item}
                    lang={lang}
                    nav={nav}
                    pathname={pathname}
                    onClose={onClose}
                  />
                ))}
              </div>
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-extrabold uppercase text-ink-soft/70">
                  {getMoreLabel(lang)}
                </p>
                {SECONDARY_NAV.map((item) => (
                  <MobileNavLink
                    key={item.key}
                    item={item}
                    lang={lang}
                    nav={nav}
                    pathname={pathname}
                    onClose={onClose}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <Link
                href={`/${lang}#features`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-card/70"
              >
                <Sparkles className="size-4 text-accent-500" aria-hidden />
                {nav.features}
              </Link>
              <Link
                href={`/${lang}/pricing`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-card/70"
              >
                <CreditCard className="size-4 text-brand-400" aria-hidden />
                {nav.pricing}
              </Link>
            </>
          )}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <LocaleSwitcher current={lang} />
            <ThemeToggle lang={lang} />
          </div>
          {authed ? (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={async () => {
                onClose();
                // Was fire-and-forget (`void logout()`): `user` stayed
                // briefly stale after a tap, so navigating to the login
                // page quickly enough hit its own "already signed in"
                // redirect and bounced straight back in — no credentials
                // entered, looked like Login silently re-authenticated the
                // old session. Awaiting means `user` is really cleared
                // before this tap can lead anywhere else.
                await logout();
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
      </aside>
    </div>
  );
}

function DesktopNavLink({
  item,
  lang,
  nav,
  pathname,
}: {
  item: NavItem;
  lang: Locale;
  nav: Dictionary["nav"];
  pathname: string;
}) {
  const active = isActive(pathname, lang, item.href);
  return (
    <Link
      href={`/${lang}/${item.href}`}
      className={cn(
        "relative flex h-10 shrink-0 items-center whitespace-nowrap px-3 py-2 text-[13px] font-bold transition-colors",
        active
          ? "text-brand-950 after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:bg-brand-900 dark:text-ink"
          : "text-ink-soft hover:text-brand-900 dark:hover:text-ink"
      )}
    >
      {getPrimaryNavLabel(lang, item.key, nav)}
    </Link>
  );
}

function DesktopNavGroup({
  items,
  lang,
  nav,
  pathname,
}: {
  items: NavItem[];
  lang: Locale;
  nav: Dictionary["nav"];
  pathname: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = items.some((item) => isActive(pathname, lang, item.href));

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setExpanded(true);
  };

  const closeMenu = () => {
    clearCloseTimer();
    setExpanded(false);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      closeTimerRef.current = null;
    }, 180);
  };

  useEffect(() => clearCloseTimer, []);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocusCapture={openMenu}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeMenu();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
            window.requestAnimationFrame(() => {
              menuRef.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]')?.focus();
            });
          }
        }}
        className={cn(
          "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/35",
          active
            ? "bg-brand-600/10 text-brand-700 dark:bg-white/10 dark:text-ink"
            : "text-ink-soft hover:bg-hover hover:text-ink"
        )}
      >
        {getMoreLabel(lang)}
        <ChevronDown
          className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute! left-0 top-full z-40 h-3 w-56",
          expanded && "pointer-events-auto"
        )}
      />
      <div
        ref={menuRef}
        role="menu"
        onKeyDown={(event) => {
          const links = Array.from(
            menuRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? []
          );
          const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
          if (event.key === "Escape") {
            closeMenu();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            links[(currentIndex + 1) % links.length]?.focus();
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            links[(currentIndex - 1 + links.length) % links.length]?.focus();
          }
        }}
        className={cn(
          "surface-panel invisible pointer-events-none absolute! left-0 top-[calc(100%+8px)] z-50 w-56 translate-y-1 rounded-lg p-2 opacity-0 shadow-raised backdrop-blur-2xl transition-all duration-200",
          expanded && "visible pointer-events-auto translate-y-0 opacity-100"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const itemActive = isActive(pathname, lang, item.href);
          return (
            <Link
              key={item.key}
              href={`/${lang}/${item.href}`}
              role="menuitem"
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/35",
                itemActive
                  ? "bg-brand-600/12 text-brand-600 dark:text-brand-200"
                  : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {getPrimaryNavLabel(lang, item.key, nav)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getMoreLabel(lang: Locale): string {
  return {
    uz: "Ko'proq",
    ru: "Еще",
    en: "More",
  }[lang];
}

function getLearnLabel(lang: Locale): string {
  return {
    uz: "O'rganish",
    ru: "Учиться",
    en: "Learn",
  }[lang];
}

function getLibraryLabel(lang: Locale): string {
  return {
    uz: "Kutubxona",
    ru: "Библиотека",
    en: "Library",
  }[lang];
}

function getProgressLabel(lang: Locale): string {
  return {
    uz: "Progress",
    ru: "Прогресс",
    en: "Progress",
  }[lang];
}

function getDashboardLabel(lang: Locale): string {
  return {
    uz: "Bosh",
    ru: "Главная",
    en: "Home",
  }[lang];
}

function getPrimaryNavLabel(
  lang: Locale,
  key: NavKey,
  nav: Dictionary["nav"]
): string {
  if (key === "dashboard") return getDashboardLabel(lang);
  if (key === "today") return getLearnLabel(lang);
  if (key === "decks") return getLibraryLabel(lang);
  if (key === "mastery") return getProgressLabel(lang);
  if (key === "games") {
    return {
      uz: "Mashqlar",
      ru: "Практика",
      en: "Practice",
    }[lang];
  }
  if (key === "ielts") return "IELTS";
  return nav[key];
}

function MobileBottomNav({
  lang,
  nav,
  pathname,
}: {
  lang: Locale;
  nav: Dictionary["nav"];
  pathname: string;
}) {
  return (
    <nav
      className="mobile-bottom-nav fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[22px] border border-line bg-raised/94 p-1 shadow-[0_14px_42px_rgba(7,58,53,0.14)] backdrop-blur-md lg:hidden"
      aria-label={nav.menu}
    >
      {PRIMARY_NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, lang, item.href);
        return (
          <Link
            key={item.key}
            href={`/${lang}/${item.href}`}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-[10px] font-black transition-colors",
              active
                ? "bg-brand-600 text-white shadow-[0_12px_28px_rgba(7,58,53,0.18)]"
                : "text-ink-soft hover:bg-card hover:text-ink"
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span className="max-w-full truncate">{getPrimaryNavLabel(lang, item.key, nav)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavLink({
  item,
  lang,
  nav,
  pathname,
  onClose,
}: {
  item: NavItem;
  lang: Locale;
  nav: Dictionary["nav"];
  pathname: string;
  onClose: () => void;
}) {
  const active = isActive(pathname, lang, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={`/${lang}/${item.href}`}
      onClick={onClose}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition-all",
        active
          ? "bg-brand-600/12 text-brand-600 shadow-inner shadow-brand-600/5 dark:text-brand-200"
          : "text-ink hover:bg-card/70"
      )}
    >
      <span className="icon-tile flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-4" aria-hidden />
      </span>
      {getPrimaryNavLabel(lang, item.key, nav)}
    </Link>
  );
}
