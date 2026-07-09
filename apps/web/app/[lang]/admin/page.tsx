import { notFound } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <AdminDashboard lang={lang} t={dict.adminPanel} deniedMessage={dict.admin.accessDenied} />
    </>
  );
}
