import { notFound } from "next/navigation";

import { AdminGuard } from "@/components/admin/admin-guard";
import { WordsAdmin } from "@/components/admin/words-admin";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function AdminWordsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <AdminGuard lang={lang} deniedMessage={dict.admin.accessDenied} allowedRoles={["content_manager", "admin", "super_admin"]}>
        <WordsAdmin lang={lang} admin={dict.admin} />
      </AdminGuard>
    </>
  );
}
