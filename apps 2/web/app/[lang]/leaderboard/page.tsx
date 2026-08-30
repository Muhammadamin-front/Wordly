import { notFound } from "next/navigation";

import { LeaderboardView } from "@/components/gamification/leaderboard-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <LeaderboardView lang={lang} t={dict.leaderboard} />
    </>
  );
}
