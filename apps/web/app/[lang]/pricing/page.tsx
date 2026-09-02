import { notFound } from "next/navigation";

import { PricingView } from "@/components/billing/pricing-view";
import { SiteHeader } from "@/components/site/header";
import { API_URL } from "@/lib/api";
import type { BillingStatus, Plan } from "@/lib/billing";
import type { Locale } from "@/lib/locales";
import { publicPageMetadata } from "@/lib/seo";
import { getSeoCopy } from "@/lib/seo-copy";
import { getDictionary, hasLocale } from "../dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const seo = getSeoCopy(lang, "pricing");
  return publicPageMetadata({
    lang,
    path: "/pricing",
    ...seo,
  });
}

/** Plans and gateway status are public and change rarely, so they are read on
 *  the server and cached for five minutes. A failure here is not fatal: the
 *  view falls back to fetching them in the browser, exactly as before. */
async function loadPublicBilling(): Promise<{ plans?: Plan[]; status?: BillingStatus }> {
  try {
    const [plansResponse, statusResponse] = await Promise.all([
      fetch(`${API_URL}/api/v1/billing/plans`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/api/v1/billing/status`, { next: { revalidate: 300 } }),
    ]);
    if (!plansResponse.ok || !statusResponse.ok) return {};
    const { plans } = (await plansResponse.json()) as { plans: Plan[] };
    return { plans, status: (await statusResponse.json()) as BillingStatus };
  } catch {
    return {};
  }
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, billing] = await Promise.all([getDictionary(lang), loadPublicBilling()]);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <PricingView
        lang={lang}
        t={dict.billing}
        initialPlans={billing.plans}
        initialStatus={billing.status}
      />
    </>
  );
}
