import { notFound } from "next/navigation";

import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "../dictionaries";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main id="main-content" tabIndex={-1} className="relative min-h-dvh overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(40,135,115,0.14),transparent_30%),radial-gradient(circle_at_86%_75%,rgba(184,137,47,0.12),transparent_32%)]" />
      <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
        <Logo lang={lang as Locale} />
        <ThemeToggle lang={lang as Locale} />
      </header>
      <OnboardingView lang={lang} copy={dict.onboarding} />
    </main>
  );
}
