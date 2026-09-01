import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { WordChainGame } from "@/components/word-chain/word-chain-game";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function WordChainPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ invite?: string | string[]; join?: string | string[] }>;
}) {
  const { lang } = await params;
  const search = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const inviteeId = typeof search.invite === "string" ? search.invite : undefined;
  const invitationRoomCode = typeof search.join === "string" ? search.join : undefined;

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <WordChainGame
        lang={lang}
        copy={dict.wordChain}
        inviteeId={inviteeId}
        invitationRoomCode={invitationRoomCode}
      />
    </>
  );
}
