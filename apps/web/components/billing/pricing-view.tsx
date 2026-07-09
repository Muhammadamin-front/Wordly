"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { billingApi, formatSom, type Plan, type Subscription } from "@/lib/billing";
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
  const [sub, setSub] = useState<Subscription | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([billingApi.plans(), billingApi.subscription()]).then(([p, s]) => {
      if (cancelled) return;
      setPlans(p.plans);
      setSub(s);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  async function pay(planCode: string, provider: "payme" | "click") {
    setBusy(true);
    setError(null);
    try {
      const result = await billingApi.checkout(
        planCode,
        provider,
        `${window.location.origin}/${lang}/billing`
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

  if (!ready || !user || plans === null) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-ink">{t.title}</h1>
      <p className="mt-1 text-center text-sm text-ink-soft">{t.subtitle}</p>

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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = sub?.plan_code === plan.code && sub?.is_premium;
          const popular = plan.code === "premium_yearly";
          const perUnit =
            plan.code === "premium_monthly" ? t.perMonth : plan.code === "free" ? "" : t.perYear;
          return (
            <div
              key={plan.code}
              className={cn(
                "relative flex flex-col rounded-xl2 border bg-card p-5",
                popular ? "border-brand-400 shadow-lg" : "border-line"
              )}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-[11px] font-bold text-white">
                  {t.mostPopular}
                </span>
              )}
              <h2 className="font-bold text-ink">{planName(plan.code, t)}</h2>
              <p className="mt-2">
                <span className="text-2xl font-extrabold text-ink">
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

              {plan.tier === "premium" &&
                (isCurrent ? (
                  <span className="mt-4 rounded-lg bg-success/10 py-2 text-center text-xs font-bold text-success">
                    ✓ {t.currentPlan}
                  </span>
                ) : selected === plan.code ? (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" loading={busy} onClick={() => void pay(plan.code, "payme")}>
                        {t.payme}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busy}
                        onClick={() => void pay(plan.code, "click")}
                      >
                        {t.click}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      fullWidth
                      loading={busy}
                      onClick={() => void demoActivate(plan.code)}
                    >
                      🧪 {t.sandboxActivate}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="mt-4" fullWidth onClick={() => setSelected(plan.code)}>
                    {t.choosePlan}
                  </Button>
                ))}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink-soft">{t.sandboxNote}</p>
    </main>
  );
}
