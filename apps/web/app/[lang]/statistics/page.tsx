import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { StatisticsView } from "@/components/stats/statistics-view";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function StatisticsPage({
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
      <StatisticsView
        lang={lang}
        t={dict.stats}
        ratingLabels={{
          again: dict.review.again,
          hard: dict.review.hard,
          good: dict.review.good,
          easy: dict.review.easy,
        }}
      />
    </>
  );
}
