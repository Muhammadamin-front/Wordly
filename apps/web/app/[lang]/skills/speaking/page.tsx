import Link from "next/link";
import { notFound } from "next/navigation";

import { GamePlayer } from "@/components/games/game-player";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function SpeakingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/${lang}/skills`}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            ← {dict.skills.title}
          </Link>
          <h1 className="text-lg font-bold text-ink">🗣️ {dict.skills.speaking.name}</h1>
        </div>
        <GamePlayer
          lang={lang}
          gameType="speaking"
          games={dict.games}
          gam={dict.gam}
          exitPath="skills"
        />
      </main>
    </>
  );
}
