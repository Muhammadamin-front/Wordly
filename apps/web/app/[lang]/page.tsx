import Link from "next/link";

import { Reveal } from "@/components/site/reveal";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/locales";
import { getDictionary, hasLocale } from "./dictionaries";
import { notFound } from "next/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { landing, nav, common } = dict;

  const features = [
    { icon: "🧠", title: landing.feature1Title, body: landing.feature1Body },
    { icon: "🇺🇿", title: landing.feature2Title, body: landing.feature2Body },
    { icon: "🎯", title: landing.feature3Title, body: landing.feature3Body },
    { icon: "🔥", title: landing.feature4Title, body: landing.feature4Body },
  ];

  return (
    <>
      <SiteHeader lang={lang as Locale} nav={nav} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/25 via-accent-500/15 to-transparent blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
            <Reveal>
              <h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
                {landing.heroTitle}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-ink-soft sm:text-lg">
                {landing.heroSubtitle}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={`/${lang}/auth/register`}>
                  <Button size="lg">{landing.heroCta}</Button>
                </Link>
                <Link href={`/${lang}#features`}>
                  <Button size="lg" variant="secondary">
                    {landing.heroSecondary}
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
                {[
                  ["10 000+", landing.statWords],
                  ["6", landing.statLevels],
                  ["100%", landing.statPrice],
                ].map(([value, label]) => (
                  <div key={label} className="glass rounded-xl2 px-3 py-4">
                    <dt className="sr-only">{label}</dt>
                    <dd className="text-2xl font-extrabold text-brand-600 dark:text-brand-300 sm:text-3xl">
                      {value}
                    </dd>
                    <dd className="mt-1 text-xs font-medium text-ink-soft sm:text-sm">{label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.07}>
                <Card className="h-full transition-transform duration-300 hover:-translate-y-1">
                  <span aria-hidden className="text-3xl">
                    {feature.icon}
                  </span>
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {landing.pricingTitle}
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
            <Reveal delay={0.05}>
              <Card className="h-full">
                <CardTitle>{landing.pricingFreeName}</CardTitle>
                <p className="mt-2 text-3xl font-extrabold text-ink">0</p>
                <CardDescription>{landing.pricingFreeDesc}</CardDescription>
              </Card>
            </Reveal>
            <Reveal delay={0.12}>
              <Card className="h-full border-brand-400/50 bg-gradient-to-b from-brand-600/8 to-transparent">
                <CardTitle className="text-brand-600 dark:text-brand-300">
                  {landing.pricingPremiumName}
                </CardTitle>
                <p className="mt-2 text-3xl font-extrabold text-ink">
                  {landing.pricingPremiumPrice}
                </p>
                <CardDescription>{landing.pricingPremiumDesc}</CardDescription>
              </Card>
            </Reveal>
          </div>
          <Reveal delay={0.18}>
            <p className="mt-6 text-center text-sm text-ink-soft">{landing.pricingNote}</p>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="rounded-xl2 bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-14 text-center shadow-xl shadow-brand-900/25">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {landing.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-brand-100">{landing.ctaBody}</p>
              <Link href={`/${lang}/auth/register`} className="mt-8 inline-block">
                <Button size="lg" variant="accent">
                  {landing.heroCta}
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-soft sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {common.appName}. {landing.footerRights}
          </span>
          <span>{common.tagline}</span>
        </div>
      </footer>
    </>
  );
}
