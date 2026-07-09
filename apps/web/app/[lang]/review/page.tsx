import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewSession } from "@/components/review/review-session";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ deck?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, { deck }] = await Promise.all([getDictionary(lang), searchParams]);

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Suspense>
          <ReviewSession
            lang={lang}
            review={dict.review}
            gam={dict.gam}
            ach={dict.ach}
            deckId={deck}
          />
        </Suspense>
      </main>
    </>
  );
}
