import { notFound } from "next/navigation";

import { MockOrchestrator } from "@/components/ielts/mock/mock-orchestrator";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function IeltsMockPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <MockOrchestrator
        lang={lang}
        t={dict.ieltsMock}
        readingT={dict.readingPractice}
        coachT={dict.coach}
        ieltsT={dict.ielts}
      />
    </>
  );
}
