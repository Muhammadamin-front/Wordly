import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { ClassDetail } from "@/components/teacher/class-detail";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../../dictionaries";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <ClassDetail lang={lang} classId={id} t={dict.teacher} />
    </>
  );
}
