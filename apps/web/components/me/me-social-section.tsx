"use client";

import { ArrowRight, Swords, Trophy, UserPlus, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { socialApi } from "@/lib/social";
import type { Locale } from "@/lib/locales";
import { useApi } from "@/lib/use-api";

const COPY: Record<Locale, { title: string; friends: string; invite: string; leaderboard: string; wordChain: string; teacher: string }> = {
  uz: {
    title: "Ijtimoiy",
    friends: "Do'stlar",
    invite: "Do'st qo'shing va reytingda birga chiqing",
    leaderboard: "Liga",
    wordChain: "Word Chain (do'st bilan)",
    teacher: "Sinflarim (o'qituvchi)",
  },
  ru: {
    title: "Сообщество",
    friends: "Друзья",
    invite: "Добавьте друга и попадите в рейтинг вместе",
    leaderboard: "Лига",
    wordChain: "Word Chain (с друзьями)",
    teacher: "Мои классы (преподаватель)",
  },
  en: {
    title: "Community",
    friends: "Friends",
    invite: "Add a friend and appear on the leaderboard together",
    leaderboard: "League",
    wordChain: "Word Chain (with friends)",
    teacher: "My classes (teacher)",
  },
};

/** The social surfaces are worth nothing until there is someone to be social
 *  with: an empty leaderboard and a friendless Word Chain make the product
 *  look abandoned, which is exactly what the first hundred learners would
 *  see. Only the way in is shown until they have a friend; the rest appears
 *  once it has something in it.
 *
 *  Teaching is a different product, so it is not in anybody's menu — it shows
 *  up only for accounts that actually hold the teacher role. */
export function MeSocialSection({ lang }: { lang: Locale }) {
  const { user, ready } = useAuth();
  const t = COPY[lang];
  const { data: friends } = useApi(ready && user ? "social:friends" : null, () =>
    socialApi.friends()
  );
  const hasFriends = (friends?.length ?? 0) > 0;
  const isTeacher = user?.role === "teacher";

  return (
    <section aria-labelledby="me-social">
      <h2 id="me-social" className="text-xs font-black uppercase tracking-wide text-ink-soft">
        {t.title}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Row href={`/${lang}/friends`} icon={Users} label={t.friends} hint={hasFriends ? undefined : t.invite} />
        {hasFriends && (
          <>
            <Row href={`/${lang}/leaderboard`} icon={Trophy} label={t.leaderboard} />
            <Row href={`/${lang}/multiplayer/word-chain`} icon={Swords} label={t.wordChain} />
          </>
        )}
        {isTeacher && <Row href={`/${lang}/teacher`} icon={UserPlus} label={t.teacher} />}
      </ul>
    </section>
  );
}

function Row({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex min-h-14 items-center gap-3 rounded-lg border border-line bg-card px-4 py-3 transition-colors hover:border-brand-400/60 hover:bg-raised"
      >
        <span className="icon-tile size-9 shrink-0 rounded-md">
          <Icon className="size-4 text-brand-600 dark:text-brand-300" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink">{label}</span>
          {hint && <span className="block truncate text-xs text-ink-soft">{hint}</span>}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  );
}
