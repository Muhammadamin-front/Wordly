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

const FEATURE_KEY: Record<string, keyof Dictionary["billing"]> = {
  free: "freeFeatures",
  premium_monthly: "premiumFeatures",
  premium_quarterly: "premiumFeatures",
  premium_yearly: "premiumFeatures",
  family: "familyFeatures",
};

const PLAN_NAME_KEY: Record<string, keyof Dictionary["billing"]> = {
  free: "free",
  premium_monthly: "premiumMonthly",
  premium_quarterly: "premiumQuarterly",
  premium_yearly: "premiumYearly",
  family: "family",
};

function planName(code: string, t: Dictionary["billing"]): string {
  const key = PLAN_NAME_KEY[code];
  return key ? t[key] : code;
}

function featureList(code: string, t: Dictionary["billing"]): string[] {
  const primary = t[FEATURE_KEY[code]];
  const secondary = code === "free" ? t.freeIncludesList : t.premiumAddsList;
  return [...new Set(`${primary} · ${secondary}`.split("·").map((item) => item.trim()).filter(Boolean))].slice(0, 7);
}

export function PricingView({ lang, t }: { lang: string; t: Dictionary["billing"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[] | null>(null);
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
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  if (loadError || plans === null || paymentStatus === null) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Alert tone="error">{t.loadError}</Alert>
        <Button className="mt-4" variant="secondary" onClick={() => setReloadKey((n) => n + 1)}>
          {t.retry}
        </Button>
      </main>
    );
  }

  const planOrder = ["free", "premium_monthly", "premium_quarterly", "premium_yearly"];
  const checkoutEnabled = paymentStatus.checkout_enabled;
  const displayPlans = plans
    .filter((plan) => planOrder.includes(plan.code))
    .sort((a, b) => planOrder.indexOf(a.code) - planOrder.indexOf(b.code));

  return (
    <main className={styles.page}>
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
            const isFree = plan.code === "free";
            const isCurrent = isFree
              ? Boolean(user && !sub?.is_premium)
              : sub?.plan_code === plan.code && sub?.is_premium;
            const isSelecting = selected === plan.code;
            const popular = plan.code === "premium_yearly";
            const perUnit =
              isFree
                ? ""
                : plan.code === "premium_monthly"
                ? t.perMonth
                : plan.code === "premium_quarterly"
                  ? t.perQuarter
                  : t.perYear;
            const canPurchase =
              isFree || !user || (paymentStatus.checkout_enabled || paymentStatus.sandbox_enabled);
            const tone =
              isFree
                ? styles.free
                : plan.code === "premium_monthly"
                ? styles.monthly
                : plan.code === "premium_quarterly"
                  ? styles.quarterly
                  : styles.yearly;

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
                    <h2>{planName(plan.code, t)}</h2>
                    {popular && <span>{t.mostPopular}</span>}
                  </div>
                  <ul className={styles.featureList}>
                    {featureList(plan.code, t).map((feature) => (
                      <li key={feature}>
                        <Check aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn(styles.priceBlock, isSelecting && styles.priceBlockHidden)}>
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
