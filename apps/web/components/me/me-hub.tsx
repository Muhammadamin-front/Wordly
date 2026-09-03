import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Bot,
  CalendarCheck,
  CircleAlert,
  CreditCard,
  Gamepad2,
  LibraryBig,
  LifeBuoy,
  Map,
  Medal,
  Mic2,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/locales";

type Entry = { href: string; label: string; icon: LucideIcon };
type Group = { title: string; entries: Entry[] };

const SECTION_TITLES: Record<Locale, { progress: string; practice: string; social: string; account: string; title: string; subtitle: string }> = {
  uz: {
    title: "Men",
    subtitle: "Progressingiz, mashqlar va hisob sozlamalari — hammasi shu yerda.",
    progress: "Progress",
    practice: "Mashqlar",
    social: "Ijtimoiy",
    account: "Hisob",
  },
  ru: {
    title: "Я",
    subtitle: "Ваш прогресс, практика и настройки аккаунта — всё здесь.",
    progress: "Прогресс",
    practice: "Практика",
    social: "Сообщество",
    account: "Аккаунт",
  },
  en: {
    title: "Me",
    subtitle: "Your progress, practice and account settings, all in one place.",
    progress: "Progress",
    practice: "Practice",
    social: "Community",
    account: "Account",
  },
};

const MISTAKES_LABEL: Record<Locale, string> = {
  uz: "Xatolar ustida ishlash",
  ru: "Работа над ошибками",
  en: "Mistakes practice",
};

const SUPPORT_LABEL: Record<Locale, string> = {
  uz: "Yordam va aloqa",
  ru: "Поддержка и связь",
  en: "Help and contact",
};

const MULTIPLAYER_LABEL: Record<Locale, string> = {
  uz: "Word Chain (do'st bilan)",
  ru: "Word Chain (с друзьями)",
  en: "Word Chain (with friends)",
};

const ACHIEVEMENTS_LABEL: Record<Locale, string> = {
  uz: "Yutuqlar",
  ru: "Достижения",
  en: "Achievements",
};

const OVERVIEW_LABEL: Record<Locale, string> = {
  uz: "Boshqaruv paneli",
  ru: "Обзор",
  en: "Overview",
};

/** Everything that used to sit in the header's "More" dropdown, grouped by
 *  what a learner is actually trying to do. The routes are unchanged — only
 *  the way in is, so the top bar can stay at four tabs. */
export function MeHub({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const t = SECTION_TITLES[lang];
  const to = (path: string) => `/${lang}/${path}`;

  const groups: Group[] = [
    {
      title: t.progress,
      entries: [
        { href: to("mastery"), label: nav.mastery, icon: Map },
        { href: to("statistics"), label: nav.statistics, icon: BarChart3 },
        { href: to("achievements"), label: ACHIEVEMENTS_LABEL[lang], icon: Medal },
        { href: to("dashboard"), label: OVERVIEW_LABEL[lang], icon: CalendarCheck },
      ],
    },
    {
      title: t.practice,
      entries: [
        { href: to("games"), label: nav.games, icon: Gamepad2 },
        { href: to("grammar"), label: nav.grammar, icon: Boxes },
        { href: to("skills"), label: nav.skills, icon: BookOpen },
        { href: to("mistakes"), label: MISTAKES_LABEL[lang], icon: CircleAlert },
        { href: to("coach"), label: nav.coach, icon: Mic2 },
        { href: to("ai"), label: nav.ai, icon: Bot },
      ],
    },
    {
      title: t.social,
      entries: [
        { href: to("friends"), label: nav.friends, icon: Users },
        { href: to("leaderboard"), label: nav.leaderboard, icon: Trophy },
        { href: to("multiplayer/word-chain"), label: MULTIPLAYER_LABEL[lang], icon: Swords },
        { href: to("classes"), label: nav.classes, icon: LibraryBig },
      ],
    },
    {
      title: t.account,
      entries: [
        { href: to("billing"), label: nav.billing, icon: CreditCard },
        { href: to("support"), label: SUPPORT_LABEL[lang], icon: LifeBuoy },
      ],
    },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="type-h1 text-ink">{t.title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{t.subtitle}</p>

      <div className="mt-8 flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={`me-${group.title}`}>
            <h2
              id={`me-${group.title}`}
              className="text-xs font-black uppercase tracking-wide text-ink-soft"
            >
              {group.title}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className="group flex min-h-14 items-center gap-3 rounded-lg border border-line bg-card px-4 py-3 transition-colors hover:border-brand-400/60 hover:bg-raised"
                  >
                    <span className="icon-tile size-9 shrink-0 rounded-md">
                      <entry.icon className="size-4 text-brand-600 dark:text-brand-300" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                      {entry.label}
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
