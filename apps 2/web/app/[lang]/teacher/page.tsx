import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site/header";
import { TeacherPanel } from "@/components/teacher/teacher-panel";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function TeacherPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <TeacherPanel lang={lang} t={dict.teacher} />
    </>
  );
}
