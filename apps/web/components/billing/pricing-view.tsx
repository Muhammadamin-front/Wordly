"use client";

import { ArrowRight, Check, Copy, CreditCard, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
import { useModalFocus } from "@/lib/use-modal-focus";
import { cn } from "@/lib/utils";

import styles from "./pricing-view.module.css";

// Manual-payment fallback while the Payme/Click integrations are still
// pending approval: the learner transfers the plan's price to this card and
// sends the receipt on Telegram, and Premium is granted by hand from the
// admin panel (see the subscription grant/revoke controls there).
const TELEGRAM_HANDLE = "@Muhammad0318";
const TELEGRAM_URL = "https://t.me/Muhammad0318";
// Grouped for reading; copied without spaces, since banking apps commonly
// reject a pasted number that still contains them.
const TRANSFER_CARD_NUMBER = "5614 6821 1273 2054";

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

export function PricingView({
  lang,
  t,
  initialPlans,
  initialStatus,
}: {
  lang: string;
  t: Dictionary["billing"];
  /** Both are public endpoints, so the page renders them on the server and
   *  hands them down here. When present the browser skips those two requests
   *  entirely and the prices are in the HTML — this page used to serve a
   *  spinner to crawlers and to anyone on a slow connection. */
  initialPlans?: Plan[];
  initialStatus?: BillingStatus;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[] | null>(initialPlans ?? null);
  const [duration, setDuration] = useState<Duration>("monthly");
  const [paymentStatus, setPaymentStatus] = useState<BillingStatus | null>(initialStatus ?? null);
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
    // Only what the server could not provide: the subscription is per-user,
    // and plans/status are refetched solely when they were not passed in.
    Promise.all([
      initialPlans ? null : billingApi.plans(),
      initialStatus ? null : billingApi.status(),
      user ? billingApi.subscription() : null,
    ]).then(([loadedPlans, loadedStatus, subscription]) => {
      if (cancelled) return;
      if (loadedPlans) setPlans(loadedPlans.plans);
      if (loadedStatus) setPaymentStatus(loadedStatus);
      setSub(subscription);
      setLoadError(false);
    }).catch(() => {
      if (cancelled) return;
      setLoadError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey, initialPlans, initialStatus]);

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

  // Auth resolving is not a reason to withhold the prices: with the plans
  // rendered on the server, waiting on it would put a spinner in the HTML
  // and undo the point of fetching them there.
  if ((!ready && plans === null) || (!loadError && (plans === null || paymentStatus === null))) {
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
  const selectedPlan = selected ? planByCode.get(selected) : undefined;
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
            // Always selectable for a paid plan: even with every card gateway
            // switched off, the dialog still offers the manual card-transfer
            // route, so a disabled button here would be a dead end.
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

                <div className={styles.actionDock}>
                  {isCurrent ? (
                    <span className={styles.currentPlan}>
                      <Check aria-hidden /> {t.currentPlan}
                    </span>
                  ) : isFree && user ? (
                    <span className={styles.currentPlan}>
                      <Check aria-hidden /> {t.freeIncludes}
                    </span>
                  ) : (
                    <button className={styles.chooseButton} onClick={choose}>
                      {/* Before auth resolves, the neutral label is the safe
                          one: choose() sends a signed-out visitor to login
                          anyway, so it never promises the wrong thing. */}
                      {user || !ready ? t.choosePlan : t.signInToChoose}
                      <ArrowRight aria-hidden />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <PaymentMethods t={t} />

        {selectedPlan && (
          <CheckoutDialog
            t={t}
            plan={selectedPlan}
            perUnit={
              selectedPlan.code === "free"
                ? ""
                : duration === "monthly" ? t.perMonth : duration === "quarterly" ? t.perQuarter : t.perYear
            }
            status={paymentStatus}
            busy={busy}
            onPay={(provider) => void pay(selectedPlan.code, provider)}
            onSandbox={() => void demoActivate(selectedPlan.code)}
            onClose={() => setSelected(null)}
          />
        )}

        <footer className={styles.boardFooter}>
          <p>{t.honestBody}</p>
          <p><ShieldCheck aria-hidden /> {t.paymentGate}</p>
        </footer>
        {paymentStatus.sandbox_enabled && <p className={styles.sandboxNote}>{t.sandboxNote}</p>}
      </section>
    </main>
  );
}

/** Opens on plan selection and carries every way to actually pay for it.
 *  Card gateways appear here only while they are switched on; the manual
 *  route below is always present, which is why choosing a plan is never a
 *  dead end even with checkout disabled. */
function CheckoutDialog({
  t,
  plan,
  perUnit,
  status,
  busy,
  onPay,
  onSandbox,
  onClose,
}: {
  t: Dictionary["billing"];
  plan: Plan;
  perUnit: string;
  status: BillingStatus;
  busy: boolean;
  onPay: (provider: PaymentProvider) => void;
  onSandbox: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useModalFocus({ containerRef: dialogRef, initialFocusRef: closeRef, onDismiss: onClose });

  const gateways: Array<[PaymentProvider, string]> = [
    ["payme", t.payme],
    ["click", t.click],
    ["uzum", "Uzum"],
  ];
  const liveGateways = status.checkout_enabled
    ? gateways.filter(([provider]) => status.providers[provider])
    : [];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-dialog-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[rgba(232,201,154,0.24)] bg-[#24130c] p-5 text-brand-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-[rgba(243,230,203,0.68)]">
              {t.payWith}
            </p>
            <h2 id="checkout-dialog-title" className="mt-1 truncate text-xl font-extrabold">
              {planName(tierOf(plan.code), plan.code.split("_")[1] as Duration, t)}
            </h2>
            <p className="mt-1 text-sm font-bold text-[#8fc3b9]">
              {formatSom(plan.price_som)} {t.som}{perUnit}
            </p>
          </div>
          <Button ref={closeRef} size="sm" variant="ghost" onClick={onClose}>
            {t.cancel}
          </Button>
        </div>

        {liveGateways.length > 0 && (
          <div className="mt-4 grid gap-2">
            {liveGateways.map(([provider, label]) => (
              <button
                key={provider}
                type="button"
                aria-busy={busy}
                disabled={busy}
                onClick={() => onPay(provider)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#f4a57e] bg-[#e37b4d] px-4 text-sm font-black text-[#21120c] transition-transform hover:-translate-y-0.5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {busy ? t.redirecting : label}
              </button>
            ))}
          </div>
        )}

        {status.sandbox_enabled && (
          <button
            type="button"
            aria-busy={busy}
            disabled={busy}
            onClick={onSandbox}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[rgba(143,195,185,0.5)] px-4 text-sm font-bold text-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {t.sandboxActivate}
          </button>
        )}

        <PaymentMethods t={t} />
      </section>
    </div>
  );
}

/** Card-gateway status plus the manual Telegram/card-transfer route. Payme
 *  and Click are shown deliberately, marked unavailable, rather than hidden:
 *  learners recognize them and would otherwise assume the site takes no
 *  Uzbek payment at all. */
function PaymentMethods({ t }: { t: Dictionary["billing"] }) {
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(TRANSFER_CARD_NUMBER.replace(/\s/g, ""));
    } catch {
      return; // Clipboard can be denied; the number stays visible on screen.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="mt-8 rounded-2xl border border-[rgba(232,201,154,0.2)] bg-[rgba(255,248,234,0.04)] p-5">
      <p className="text-xs font-black uppercase tracking-widest text-[rgba(243,230,203,0.68)]">
        {t.paymentMethodsTitle}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[t.payme, t.click].map((name) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-xl border border-[rgba(232,201,154,0.16)] bg-[rgba(255,248,234,0.03)] p-3 opacity-60"
          >
            <CreditCard className="size-5 shrink-0 text-[rgba(243,230,203,0.68)]" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand-50">{name}</p>
              <p className="text-[11px] font-semibold text-[rgba(243,230,203,0.6)]">{t.notAvailableYet}</p>
            </div>
          </div>
        ))}

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-3 rounded-xl border border-[rgba(143,195,185,0.45)] bg-[rgba(143,195,185,0.1)] p-3 transition-colors hover:bg-[rgba(143,195,185,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Send className="size-5 shrink-0 text-[#8fc3b9]" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-50">Telegram</p>
            <p className="truncate text-[11px] font-semibold text-[#8fc3b9]">{TELEGRAM_HANDLE}</p>
          </div>
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-[rgba(232,201,154,0.16)] p-4">
        <p className="text-sm font-bold text-brand-50">{t.manualPaymentTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-[rgba(243,230,203,0.72)]">
          {t.manualPaymentBody.replace("{handle}", TELEGRAM_HANDLE)}
        </p>

        {showCard ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-[rgba(255,248,234,0.1)] px-3 py-2 text-base font-black tracking-[0.12em] text-brand-50 tabular-nums">
              {TRANSFER_CARD_NUMBER}
            </code>
            <button
              type="button"
              onClick={() => void copyCard()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[rgba(232,201,154,0.28)] px-3 text-xs font-bold text-brand-50 transition-colors hover:bg-[rgba(255,248,234,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? t.manualPaymentCopied : t.manualPaymentCopy}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCard(true)}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[rgba(143,195,185,0.45)] bg-[rgba(143,195,185,0.1)] px-3 text-xs font-bold text-brand-50 transition-colors hover:bg-[rgba(143,195,185,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <CreditCard className="size-3.5" aria-hidden />
            {t.manualPaymentReveal}
          </button>
        )}
      </div>
    </section>
  );
}
