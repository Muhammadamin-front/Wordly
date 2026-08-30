import { notFound } from "next/navigation";

import { MasteryMapView } from "@/components/learning/mastery-map-view";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function MasteryPage({
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
      <MasteryMapView lang={lang} t={dict.mastery} loadingLabel={dict.common.loading} />
    </>
  );
}
