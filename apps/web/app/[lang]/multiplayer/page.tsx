import { notFound } from "next/navigation";

import { QuizRoom } from "@/components/multiplayer/quiz-room";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function MultiplayerPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <QuizRoom lang={lang} mp={dict.mp} wordChain={dict.wordChain} />
    </>
  );
}
