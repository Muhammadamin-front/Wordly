"use client";

import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/site/logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { ApiError } from "@/lib/api";
import {
  billingApi,
  formatSom,
  type BillingStatus,
  type PaymentProvider,
  type Plan,
  type Subscription,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

import styles from "./pricing-view.module.css";

type Tier = "free" | "plus" | "pro" | "max";
type Duration = "monthly" | "quarterly" | "yearly";
const TIERS: Tier[] = ["free", "plus", "pro", "max"];
const DURATIONS: Duration[] = ["monthly", "quarterly", "yearly"];

/** "plus_monthly" -> "plus", "free" -> "free". Every paid plan code this
 *  page shows is "<tier>_<duration>" — see PUBLIC_PLAN_CODES in
 *  services/plans.py. */
function tierOf(code: string): Tier {
  return (code === "free" ? "free" : code.split("_")[0]) as Tier;
}

function planCode(tier: Tier, duration: Duration): string {
  return tier === "free" ? "free" : `${tier}_${duration}`;
}

function planNameKey(tier: Tier, duration: Duration): keyof Dictionary["billing"] {
  if (tier === "free") return "free";
  const cap = duration[0].toUpperCase() + duration.slice(1);
  return `${tier}${cap}` as keyof Dictionary["billing"];
}

function planName(tier: Tier, duration: Duration, t: Dictionary["billing"]): string {
  return t[planNameKey(tier, duration)];
}

function featureList(tier: Tier, t: Dictionary["billing"]): string[] {
  const primary = t[tier === "free" ? "freeFeatures" : (`${tier}Features` as keyof Dictionary["billing"])];
  const secondary = tier === "free" ? t.freeIncludesList : t.premiumAddsList;
  return [...new Set(`${primary} · ${secondary}`.split("·").map((item) => item.trim()).filter(Boolean))].slice(0, 7);
}

// Reuses the existing duration-tone gradients (see pricing-view.module.css)
// as tier tones instead — free stays free; Plus/Pro/Max borrow the teal/
// amber/deep-red look that used to mean monthly/quarterly/yearly, in
// ascending order of "how premium it looks", which happens to line up.
const TIER_TONE: Record<Tier, string> = {
  free: styles.free,
  plus: styles.monthly,
  pro: styles.quarterly,
  max: styles.yearly,
};

/** What the same period would cost at this tier's own monthly rate, and how
 *  much the longer plan saves against it.
 *
 *  Derived from the monthly plan the API actually returns rather than a
 *  hardcoded "was" price — the quarterly and yearly plans are genuinely
 *  priced below 3x and 12x monthly, so this is the real saving, not a
 *  decorative strikethrough invented to manufacture urgency. */
function discount(plan: Plan, monthly: Plan | undefined) {
  if (!monthly || plan.code === monthly.code || plan.price_som <= 0) return null;
  const months = Math.round(plan.duration_days / 30);
  if (months < 2) return null;
  const regular = monthly.price_som * months;
  if (regular <= plan.price_som) return null;
  return { regular, percent: Math.round((1 - plan.price_som / regular) * 100) };
}

export function PricingView({ lang, t }: { lang: string; t: Dictionary["billing"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [duration, setDuration] = useState<Duration>("monthly");
  const [paymentStatus, setPaymentStatus] = useState<BillingStatus | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    trackEvent("pricing_viewed", { locale: lang });
  }, [lang]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    Promise.all([
      billingApi.plans(),
      user ? billingApi.subscription() : Promise.resolve(null),
      billingApi.status(),
    ]).then(
      ([p, s, status]) => {
        if (cancelled) return;
        setPlans(p.plans);
        setSub(s);
        setPaymentStatus(status);
        setLoadError(false);
      }
    ).catch(() => {
      if (cancelled) return;
      setLoadError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  async function pay(planCode: string, provider: PaymentProvider) {
    setBusy(true);
    setError(null);
    trackEvent("checkout_started", { locale: lang, plan_code: planCode, provider });
    try {
      const result = await billingApi.checkout(
        planCode,
        provider,
        `${window.location.origin}/${lang}/billing`,
        crypto.randomUUID()
      );
      window.location.assign(result.checkout_url);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 503 ? t.notConfigured : t.error);
      setBusy(false);
    }
  }

  async function demoActivate(planCode: string) {
    setBusy(true);
    setError(null);
    trackEvent("sandbox_premium_started", { locale: lang, plan_code: planCode });
    try {
      await billingApi.sandboxActivate(planCode);
      setReloadKey((n) => n + 1);
      setSelected(null);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? t.notConfigured : t.error);
    } finally {
      setBusy(false);
    }
  }

  if (!ready || (!loadError && (plans === null || paymentStatus === null))) {
    return (
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  if (loadError || plans === null || paymentStatus === null) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Alert tone="error">{t.loadError}</Alert>
        <Button className="mt-4" variant="secondary" onClick={() => setReloadKey((n) => n + 1)}>
          {t.retry}
        </Button>
      </main>
    );
  }

  const checkoutEnabled = paymentStatus.checkout_enabled;
  const planByCode = new Map(plans.map((plan) => [plan.code, plan]));
  const monthlyByTier: Partial<Record<Tier, Plan>> = {
    plus: planByCode.get("plus_monthly"),
    pro: planByCode.get("pro_monthly"),
    max: planByCode.get("max_monthly"),
  };
  // One card per tier, all at the currently-selected duration — free has no
  // duration, always its own single plan.
  const displayPlans = TIERS
    .map((tier) => planByCode.get(planCode(tier, duration)))
    .filter((plan): plan is Plan => Boolean(plan));

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.board} aria-labelledby="pricing-title">
        <header className={styles.boardHeader}>
          <Logo
            lang={lang}
            tone="inverse"
            className={cn(styles.boardLogo, "[&_.logo-mark]:size-8 [&_.logo-text]:sr-only")}
          />
          <div className={styles.headingGroup}>
            <h1 id="pricing-title" className={styles.title}>{t.subtitle}</h1>
            <p className={styles.subtitle}>{t.honestTitle}</p>
          </div>
          <span className={styles.secureMark} title={t.paymentGate}>
            <ShieldCheck aria-hidden />
            <span className="sr-only">{t.paymentGate}</span>
          </span>
        </header>

        <div className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-[rgba(232,201,154,0.2)] bg-[rgba(255,248,234,0.06)] p-1">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              aria-pressed={duration === d}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                duration === d ? "bg-brand-50 text-brand-950" : "text-[rgba(243,230,203,0.68)] hover:text-brand-50"
              )}
            >
              {d === "monthly" ? t.toggleMonthly : d === "quarterly" ? t.toggleQuarterly : t.toggleYearly}
            </button>
          ))}
        </div>

        {(sub?.is_premium || error || (!paymentStatus.checkout_enabled && !paymentStatus.sandbox_enabled)) && (
          <div className={styles.statusRail}>
            {sub?.is_premium && <Alert tone="success">{t.premiumActive}</Alert>}
            {error && <Alert tone="error">{error}</Alert>}
            {!paymentStatus.checkout_enabled && !paymentStatus.sandbox_enabled && (
              <Alert tone="info">{t.notConfigured}</Alert>
            )}
          </div>
        )}

        <div className={styles.planGrid}>
          {displayPlans.map((plan) => {
            const tier = tierOf(plan.code);
            const isFree = tier === "free";
            // Same tier as their active subscription, regardless of which
            // duration the toggle above is currently showing — a Pro yearly
            // subscriber should still see "Current plan" while browsing the
            // monthly cards, not just on the exact code they bought.
            const isCurrent = isFree
              ? Boolean(user && !sub?.is_premium)
              : Boolean(sub?.is_premium && sub.plan_code && tierOf(sub.plan_code) === tier);
            const isSelecting = selected === plan.code;
            const popular = tier === "pro";
            const saving = discount(plan, monthlyByTier[tier]);
            const perUnit = isFree ? "" : duration === "monthly" ? t.perMonth : duration === "quarterly" ? t.perQuarter : t.perYear;
            const canPurchase =
              isFree || !user || (paymentStatus.checkout_enabled || paymentStatus.sandbox_enabled);
            const tone = TIER_TONE[tier];

            function choose() {
              trackEvent("premium_plan_selected", {
                locale: lang,
                plan_code: plan.code,
                checkout_enabled: checkoutEnabled,
              });
              if (!user) {
                router.push(`/${lang}/auth/login`);
                return;
              }
              if (isFree) {
                router.push(`/${lang}/library`);
                return;
              }
              setSelected(plan.code);
            }

            return (
              <article key={plan.code} className={cn(styles.planCard, tone, popular && styles.popular)}>
                <div className={styles.gradientShape} aria-hidden />
                <div className={styles.planContent}>
                  <div className={styles.planHeading}>
                    <h2>{planName(tier, duration, t)}</h2>
                    {saving ? (
                      <span className={styles.saveBadge}>
                        −{saving.percent}%<span className="sr-only"> {t.saveLabel}</span>
                      </span>
                    ) : (
                      popular && <span>{t.mostPopular}</span>
                    )}
                  </div>
                  <ul className={styles.featureList}>
                    {featureList(tier, t).map((feature) => (
                      <li key={feature}>
                        <Check aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn(styles.priceBlock, isSelecting && styles.priceBlockHidden)}>
                  {saving && (
                    <span className={styles.regularPrice}>
                      <span className="sr-only">{t.regularPrice}: </span>
                      <s>{formatSom(saving.regular)} {t.som}</s>
                    </span>
                  )}
                  <strong>{formatSom(plan.price_som)}</strong>
                  <span>{t.som}{perUnit}</span>
                </div>

                <div className={cn(styles.actionDock, isSelecting && styles.actionDockExpanded)}>
                  {isCurrent ? (
                    <span className={styles.currentPlan}>
                      <Check aria-hidden /> {t.currentPlan}
                    </span>
                  ) : isFree && user ? (
                    <span className={styles.currentPlan}>
                      <Check aria-hidden /> {t.freeIncludes}
                    </span>
                  ) : isSelecting ? (
                    <div className={styles.providerGrid}>
                      <span className={styles.providerLabel} aria-live="polite">
                        {busy ? t.redirecting : t.payWith}
                      </span>
                      {paymentStatus.checkout_enabled && (
                        <>
                          {paymentStatus.providers.payme && (
                            <button aria-busy={busy} disabled={busy} onClick={() => void pay(plan.code, "payme")}>{t.payme}</button>
                          )}
                          {paymentStatus.providers.click && (
                            <button aria-busy={busy} disabled={busy} onClick={() => void pay(plan.code, "click")}>{t.click}</button>
                          )}
                          {paymentStatus.providers.uzum && (
                            <button aria-busy={busy} disabled={busy} onClick={() => void pay(plan.code, "uzum")}>Uzum</button>
                          )}
                        </>
                      )}
                      {paymentStatus.sandbox_enabled && (
                        <button aria-busy={busy} disabled={busy} onClick={() => void demoActivate(plan.code)}>{t.sandboxActivate}</button>
                      )}
                    </div>
                  ) : (
                    <button className={styles.chooseButton} disabled={!canPurchase} onClick={choose}>
                      {user ? t.choosePlan : t.signInToChoose}
                      <ArrowRight aria-hidden />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <footer className={styles.boardFooter}>
          <p>{t.honestBody}</p>
          <p><ShieldCheck aria-hidden /> {t.paymentGate}</p>
        </footer>
        {paymentStatus.sandbox_enabled && <p className={styles.sandboxNote}>{t.sandboxNote}</p>}
      </section>
    </main>
  );
}
