"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Boxes,
  ChevronDown,
  CreditCard,
  Gamepad2,
  GraduationCap,
  LibraryBig,
  Menu,
  Sparkles,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { StatsWidget } from "@/components/gamification/stats-widget";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/locales";

type NavKey =
  | "dashboard"
  | "decks"
  | "games"
  | "skills"
  | "grammar"
  | "ielts"
  | "leaderboard"
  | "friends"
  | "statistics"
  | "classes"
  | "billing";

interface NavItem {
  key: NavKey;
  href: string; // path suffix after /{lang}
  icon: LucideIcon;
}

const PRIMARY_NAV: NavItem[] = [
  { key: "decks", href: "decks", icon: LibraryBig },
  { key: "games", href: "games", icon: Gamepad2 },
  { key: "ielts", href: "ielts", icon: GraduationCap },
];

type NavGroupKey = "learn" | "community" | "more";

const NAV_GROUPS: { key: NavGroupKey; items: NavItem[] }[] = [
  {
    key: "learn",
    items: [
      { key: "skills", href: "skills", icon: BookOpen },
      { key: "grammar", href: "grammar", icon: Boxes },
    ],
  },
  {
    key: "community",
    items: [
      { key: "leaderboard", href: "leaderboard", icon: Trophy },
      { key: "friends", href: "friends", icon: Users },
      { key: "classes", href: "classes", icon: Sparkles },
    ],
  },
  {
    key: "more",
    items: [
      { key: "statistics", href: "statistics", icon: BarChart3 },
      { key: "billing", href: "billing", icon: CreditCard },
    ],
  },
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
    <header className="sticky top-0 z-40 px-3 py-3 sm:px-5 sm:py-4">
      <div className="glass mx-auto flex h-16 max-w-[1480px] items-center gap-3 rounded-[20px] px-3 shadow-[0_14px_44px_rgba(24,63,57,0.09)] sm:px-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={nav.menu}
          className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-line/80 bg-card/60 text-ink-soft shadow-sm transition-all hover:-translate-y-0.5 hover:bg-raised hover:text-ink lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="shrink-0">
          <Logo lang={lang} />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-visible lg:flex">
          {authed ? (
            <>
              <Link
                href={`/${lang}`}
                className={cn(
                  "relative flex h-10 shrink-0 items-center whitespace-nowrap px-3 py-2 text-[13px] font-bold transition-colors",
                  pathname === `/${lang}`
                    ? "text-brand-950 after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:bg-brand-900 dark:text-ink"
                    : "text-ink-soft hover:text-brand-900 dark:hover:text-ink"
                )}
              >
                {getHomeLabel(lang)}
              </Link>
              {PRIMARY_NAV.map((item) => (
                <DesktopNavLink key={item.key} item={item} lang={lang} nav={nav} pathname={pathname} />
              ))}
              <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
                {NAV_GROUPS.map((group) => (
                  <DesktopNavGroup key={group.key} group={group} lang={lang} nav={nav} pathname={pathname} />
                ))}
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
          <div className="hidden sm:block">
            <LocaleSwitcher current={lang} />
          </div>
          {authed ? (
            <Link href={`/${lang}/dashboard`} className="hidden lg:block">
              <Button size="sm">{getCabinetLabel(lang)}</Button>
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
            className="surface-panel !absolute inset-y-0 left-0 flex w-80 max-w-[86%] flex-col rounded-r-lg bg-page/92 shadow-2xl backdrop-blur-2xl"
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
                className="flex size-10 items-center justify-center rounded-lg border border-line bg-card/70 text-ink-soft transition-all hover:bg-raised hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto p-4">
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
                  {NAV_GROUPS.map((group) => (
                    <div key={group.key} className="space-y-1">
                      <p className="px-3 text-[11px] font-extrabold uppercase text-ink-soft/70">
                        {getNavGroupLabel(lang, group.key)}
                      </p>
                      {group.items.map((item) => (
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
                  ))}
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
                    href={`/${lang}#pricing`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-card/70"
                  >
                    <CreditCard className="size-4 text-brand-400" aria-hidden />
                    {nav.pricing}
                  </Link>
                </>
              )}
            </nav>

            <div className="shrink-0 space-y-3 border-t border-line p-3">
              <div className="flex items-center">
                <LocaleSwitcher current={lang} />
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
  group,
  lang,
  nav,
  pathname,
}: {
  group: { key: NavGroupKey; items: NavItem[] };
  lang: Locale;
  nav: Dictionary["nav"];
  pathname: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const active = group.items.some((item) => isActive(pathname, lang, item.href));

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
        onClick={openMenu}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
        className={cn(
          "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-bold transition-all",
          active
            ? "bg-brand-600/10 text-brand-700 dark:bg-white/10 dark:text-ink"
            : "text-ink-soft hover:-translate-y-0.5 hover:bg-card/70 hover:text-ink"
        )}
      >
        {getNavGroupLabel(lang, group.key)}
        <ChevronDown
          className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none !absolute left-0 top-full z-40 h-3 w-56",
          expanded && "pointer-events-auto"
        )}
      />
      <div
        role="menu"
        className={cn(
          "surface-panel invisible pointer-events-none !absolute left-0 top-[calc(100%+8px)] z-50 w-56 translate-y-1 rounded-lg p-2 opacity-0 shadow-2xl shadow-brand-950/20 backdrop-blur-2xl transition-all duration-150",
          expanded && "visible pointer-events-auto translate-y-0 opacity-100"
        )}
      >
        {group.items.map((item) => {
          const Icon = item.icon;
          const itemActive = isActive(pathname, lang, item.href);
          return (
            <Link
              key={item.key}
              href={`/${lang}/${item.href}`}
              role="menuitem"
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
                itemActive
                  ? "bg-brand-600/12 text-brand-600 dark:text-brand-200"
                  : "text-ink-soft hover:bg-page/70 hover:text-ink"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {nav[item.key]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getNavGroupLabel(lang: Locale, key: NavGroupKey): string {
  const labels: Record<Locale, Record<NavGroupKey, string>> = {
    uz: {
      learn: "O'rganish",
      community: "Hamjamiyat",
      more: "Ko'proq",
    },
    ru: {
      learn: "Учеба",
      community: "Сообщество",
      more: "Еще",
    },
    en: {
      learn: "Learn",
      community: "Community",
      more: "More",
    },
  };
  return labels[lang][key];
}

function getHomeLabel(lang: Locale): string {
  return {
    uz: "Bosh sahifa",
    ru: "Главная",
    en: "Home",
  }[lang];
}

function getWordsLabel(lang: Locale): string {
  return {
    uz: "So'zlar",
    ru: "Слова",
    en: "Words",
  }[lang];
}

function getCabinetLabel(lang: Locale): string {
  return {
    uz: "Kabinet",
    ru: "Кабинет",
    en: "Cabinet",
  }[lang];
}

function getPrimaryNavLabel(
  lang: Locale,
  key: NavKey,
  nav: Dictionary["nav"]
): string {
  if (key === "decks") return getWordsLabel(lang);
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all",
        active
          ? "bg-brand-600/12 text-brand-600 shadow-inner shadow-brand-600/5 dark:text-brand-200"
          : "text-ink hover:bg-card/70"
      )}
    >
      <span className="icon-tile flex size-9 items-center justify-center rounded-lg">
        <Icon className="size-4" aria-hidden />
      </span>
      {nav[item.key]}
    </Link>
  );
}
