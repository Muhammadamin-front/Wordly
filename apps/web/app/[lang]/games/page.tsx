import { notFound } from "next/navigation";

import { GamesHub } from "@/components/games/games-hub";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return publicPageMetadata({ lang, path: "/games", ...getSeoCopy(lang, "games") });
}

export default async function GamesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <GamesHub lang={lang} games={dict.games} gam={dict.gam} />
    </>
  );
}
