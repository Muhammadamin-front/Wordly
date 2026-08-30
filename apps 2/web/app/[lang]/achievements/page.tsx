import { notFound } from "next/navigation";

import { AchievementsView } from "@/components/gamification/achievements-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function AchievementsPage({
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
      <AchievementsView
        lang={lang}
        page={dict.achievementsPage}
        ach={dict.ach}
        gam={dict.gam}
      />
    </>
  );
}
