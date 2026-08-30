import { notFound } from "next/navigation";

import { LegalPage } from "@/components/legal/legal-page";
import { hasLocale } from "../../dictionaries";

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <LegalPage lang={lang} page="terms" />;
}
