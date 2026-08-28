"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { billingApi } from "@/lib/billing";

/** Whether the signed-in user currently has an active paid subscription
 * (Basic, Speaking Pro, or Family — anything with tier "premium"). Used to
 * decide which free-tier limits/locks to render — never to enforce them;
 * the backend is the actual gate on every route this informs. Starts
 * `null` (unknown) while loading, so callers can render nothing/a
 * skeleton rather than flash a locked state that then unlocks. */
export function usePremiumStatus(): boolean | null {
  const { user, ready } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setIsPremium(false);
      return;
    }
    let cancelled = false;
    billingApi
      .subscription()
      .then((sub) => {
        if (!cancelled) setIsPremium(sub.is_premium);
      })
      .catch(() => {
        if (!cancelled) setIsPremium(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  return isPremium;
}
