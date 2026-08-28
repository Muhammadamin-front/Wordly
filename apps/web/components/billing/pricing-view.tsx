"use client";

import { CheckCircle2, Crown, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
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
import type { Dictionary } from "@/app/[lang]/dictionaries";

const FEATURE_KEY: Record<string, keyof Dictionary["billing"]> = {
  free: "freeFeatures",
  premium_monthly: "premiumFeatures",
  premium_yearly: "premiumFeatures",
  family: "familyFeatures",
};

function planName(code: string, t: Dictionary["billing"]): string {
  return code === "free"
    ? t.free
    : code === "premium_monthly"
      ? t.premiumMonthly
      : code === "premium_yearly"
        ? t.premiumYearly
        : t.family;
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <section className="surface-panel relative overflow-hidden rounded-[18px] p-6 text-center sm:p-8">
        <span aria-hidden className="absolute -right-8 -top-12 font-display text-[12rem] leading-none tracking-wide text-brand-600/7">VOCORA</span>
        <span className="print-label relative mx-auto inline-flex items-center gap-2 border-accent-500 bg-accent-400/10 text-accent-600">
          <Crown className="size-4" aria-hidden />
          {t.title}
        </span>
        <h1 className="type-h1 relative mx-auto mt-5 max-w-3xl text-ink">
          {t.honestTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
          {t.honestBody}
        </p>
      </section>

      {sub?.is_premium && (
        <Alert tone="success" className="mx-auto mt-4 max-w-md">
          ✨ {t.premiumActive}
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mx-auto mt-4 max-w-md">
          {error}
        </Alert>
      )}
      {!paymentStatus.checkout_enabled && !paymentStatus.sandbox_enabled && (
        <Alert tone="info" className="mx-auto mt-4 max-w-md">
          {t.notConfigured}
        </Alert>
      )}

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          [t.freeIncludes, t.freeIncludesList],
          [t.premiumAdds, t.premiumAddsList],
        ].map(([title, body]) => (
          <div key={title} className="premium-card rounded-[14px] p-5">
            <p className="flex items-center gap-2 text-sm font-black text-ink">
              <CheckCircle2 className="size-5 text-accent-500" aria-hidden />
              {title}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = sub?.plan_code === plan.code && sub?.is_premium;
          const popular = plan.code === "premium_yearly";
          const perUnit =
            plan.code === "premium_monthly" ? t.perMonth : plan.code === "free" ? "" : t.perYear;
          const canPurchase =
            !user ||
            ((paymentStatus.checkout_enabled || paymentStatus.sandbox_enabled) &&
              (plan.code !== "family" || paymentStatus.family_plan_available));
          return (
            <div
              key={plan.code}
              className={cn(
                "relative flex flex-col rounded-2xl border-2 bg-card p-5 shadow-[3px_4px_0_rgb(84,37,15,0.14)]",
                popular ? "border-brand-500 bg-brand-50 shadow-[6px_7px_0_#54250f]" : "border-line"
              )}
            >
              {popular && (
                <span className="print-label absolute -top-3 left-1/2 -translate-x-1/2 border-brand-950 bg-brand-600 text-white shadow-[2px_2px_0_#54250f]">
                  {t.mostPopular}
                </span>
              )}
              <h2 className="font-display text-3xl tracking-wide text-ink">{planName(plan.code, t)}</h2>
              <p className="mt-2">
                <span className="font-display text-4xl tracking-wide text-ink">
                  {plan.price_som === 0 ? "0" : formatSom(plan.price_som)}
                </span>
                <span className="text-xs text-ink-soft">
                  {" "}
                  {t.som}
                  {perUnit}
                </span>
              </p>
              <p className="mt-3 flex-1 text-xs leading-relaxed text-ink-soft">
                {t[FEATURE_KEY[plan.code]]}
              </p>
              {plan.code === "family" && !paymentStatus.family_plan_available && (
                <p className="mt-3 rounded-md border border-line bg-line/25 px-3 py-2 text-xs font-bold text-ink-soft">
                  {t.familyUnavailable}
                </p>
              )}

              {plan.tier === "premium" &&
                (isCurrent ? (
                  <span className="mt-4 rounded-lg bg-success/10 py-2 text-center text-xs font-bold text-success">
                    ✓ {t.currentPlan}
                  </span>
                ) : selected === plan.code ? (
                  <div className="mt-4 space-y-2">
                    {paymentStatus.checkout_enabled && (
                      <div
                        className={cn(
                          "grid gap-2",
                          [paymentStatus.providers.payme, paymentStatus.providers.click, paymentStatus.providers.uzum].filter(Boolean).length > 1
                            ? "sm:grid-cols-2"
                            : "grid-cols-1"
                        )}
                      >
                        {paymentStatus.providers.payme && (
                          <Button
                            size="sm"
                            loading={busy}
                            onClick={() => void pay(plan.code, "payme")}
                          >
                            {t.payme}
                          </Button>
                        )}
                        {paymentStatus.providers.click && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busy}
                            onClick={() => void pay(plan.code, "click")}
                          >
                            {t.click}
                          </Button>
                        )}
                        {paymentStatus.providers.uzum && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={busy}
                            onClick={() => void pay(plan.code, "uzum")}
                          >
                            Uzum Checkout
                          </Button>
                        )}
                      </div>
                    )}
                    {paymentStatus.sandbox_enabled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        fullWidth
                        loading={busy}
                        onClick={() => void demoActivate(plan.code)}
                      >
                        {t.sandboxActivate}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="mt-4"
                    fullWidth
                    disabled={!canPurchase}
                    onClick={() => {
                      trackEvent("premium_plan_selected", {
                        locale: lang,
                        plan_code: plan.code,
                        checkout_enabled: paymentStatus.checkout_enabled,
                      });
                      if (!user) {
                        router.push(`/${lang}/auth/login`);
                        return;
                      }
                      setSelected(plan.code);
                    }}
                  >
                    {user ? t.choosePlan : t.signInToChoose}
                  </Button>
                ))}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm leading-6 text-ink-soft shadow-[2px_3px_0_rgb(84,37,15,0.12)]">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
        <p>{t.paymentGate}</p>
      </div>

      {paymentStatus.sandbox_enabled && (
        <p className="mt-4 text-center text-xs text-ink-soft">{t.sandboxNote}</p>
      )}
    </main>
  );
}
