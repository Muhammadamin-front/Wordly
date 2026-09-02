import Link from "next/link";
import { notFound } from "next/navigation";

import { GamePlayer } from "@/components/games/game-player";
import { SiteHeader } from "@/components/site/header";
import { GAME_TYPES } from "@/lib/games";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export function generateStaticParams() {
  return GAME_TYPES.map((type) => ({ type }));
}

export default async function GameTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; type: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { lang, type } = await params;
  const query = await searchParams;
  if (!hasLocale(lang)) notFound();
  if (!(GAME_TYPES as readonly string[]).includes(type)) notFound();
  const dict = await getDictionary(lang);
  const gameType = type as (typeof GAME_TYPES)[number];
  const category = typeof query.category === "string" ? query.category : undefined;
  const initialSource = ["ielts", "phrasal", "idioms"].includes(category ?? "")
    ? { category }
    : undefined;

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            ← {dict.games.title}
          </Link>
          <h1 className="text-lg font-bold text-ink">{dict.games[gameType].name}</h1>
        </div>
        <GamePlayer
          lang={lang}
          gameType={gameType}
          games={dict.games}
          gam={dict.gam}
          initialSource={initialSource}
        />
      </main>
    </>
  );
}
