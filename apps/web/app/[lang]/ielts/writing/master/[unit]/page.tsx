import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { UnitView } from "@/components/writing-master/unit-view";
import type { Locale } from "@/lib/locales";
import { unitBySlug } from "@/lib/writing-master/curriculum";
import { getDictionary, hasLocale } from "../../../../dictionaries";

export default async function WritingMasterUnitPage({
  params,
}: {
  params: Promise<{ lang: string; unit: string }>;
}) {
  const { lang, unit: unitSlug } = await params;
  if (!hasLocale(lang)) notFound();
  const unit = unitBySlug(unitSlug);
  if (!unit) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <UnitView lang={lang} t={dict.ielts} unit={unit} />
    </>
  );
}
