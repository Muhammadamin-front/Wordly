"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { billingApi, type ReferralInfo, type Subscription } from "@/lib/billing";
import { formatApiDate } from "@/lib/dates";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function SubscriptionView({ lang, t }: { lang: string; t: Dictionary["billing"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    Promise.all([billingApi.subscription(), billingApi.referral()]).then(([s, r]) => {
      if (cancelled) return;
      setSub(s);
      setReferral(r);
      setLoadError(false);
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, reloadKey]);

  if (!ready || !user || (!loadError && (sub === null || referral === null))) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  if (loadError || sub === null || referral === null) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Alert tone="error">{t.loadError}</Alert>
        <Button className="mt-4" variant="secondary" onClick={() => setReloadKey((n) => n + 1)}>
          {t.retry}
        </Button>
      </main>
    );
  }

  const expires = formatApiDate(sub.expires_at, lang);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t.manageTitle}</h1>

      <Card className="mt-5">
        {sub.is_premium ? (
          <>
            <div className="flex items-center justify-between">
              <CardTitle className="text-brand-600 dark:text-brand-300">
                ✨ {t.premiumActive}
              </CardTitle>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                {sub.plan_code}
              </span>
            </div>
            {expires && (
              <p className="mt-2 text-sm text-ink-soft">
                {t.expiresOn}: <strong className="text-ink">{expires}</strong>
              </p>
            )}
            {sub.auto_renew === false ? (
              <p className="mt-2 text-sm text-ink-soft">{t.willNotRenew}</p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-danger"
                loading={cancelling}
                onClick={async () => {
                  if (cancelling) return;
                  setCancelling(true);
                  try {
                    await billingApi.cancel();
                    setReloadKey((n) => n + 1);
                  } finally {
                    setCancelling(false);
                  }
                }}
              >
                {t.cancel}
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-ink-soft">{t.notPremium}</p>
            <Link href={`/${lang}/pricing`} className="mt-4 inline-block">
              <Button>{t.upgrade}</Button>
            </Link>
          </>
        )}
      </Card>

      <Card className="mt-4 bg-linear-to-br from-accent-500/10 to-transparent">
        <CardTitle>🎁 {t.referTitle}</CardTitle>
        <p className="mt-1 text-sm text-ink-soft">{t.referSubtitle}</p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-line bg-card px-3 py-2 text-center text-lg font-extrabold tracking-widest text-ink">
            {referral.code}
          </code>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(referral.code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? t.copied : t.copyCode}
          </Button>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {referral.invited} {t.invited} · {referral.rewarded} {t.rewarded}
        </p>
      </Card>
    </main>
  );
}
