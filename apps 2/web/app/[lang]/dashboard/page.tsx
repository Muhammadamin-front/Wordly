import { notFound } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function DashboardPage({
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
      <DashboardView
        lang={lang}
        dict={{
          dashboard: dict.dashboard,
          nav: dict.nav,
          common: dict.common,
          ai: dict.ai,
          mastery: dict.mastery,
        }}
        gam={dict.gam}
      />
    </>
  );
}
