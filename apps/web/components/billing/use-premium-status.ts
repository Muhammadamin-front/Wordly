"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { billingApi } from "@/lib/billing";

/** Whether the signed-in user currently has an active paid subscription
 * (Basic, Speaking Pro, or Family — anything with tier "premium"). Used to
 * decide which free-tier limits/locks to render — never to enforce them;
 * the backend is the actual gate on every route this informs. Returns
 * `null` (unknown) while loading, so callers can render nothing/a
 * skeleton rather than flash a locked state that then unlocks. */
export function usePremiumStatus(): boolean | null {
  const { user, ready } = useAuth();
  // Tagged with the user it describes: on a sign-out or an account switch
  // the previous answer must not be read as this user's, which is what a
  // bare boolean would do until the refetch lands.
  const [fetched, setFetched] = useState<{ userId: string; isPremium: boolean } | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    billingApi
      .subscription()
      .then((sub) => {
        if (!cancelled) setFetched({ userId: user.id, isPremium: sub.is_premium });
      })
      .catch(() => {
        if (!cancelled) setFetched({ userId: user.id, isPremium: false });
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  // Both of these are known at render, so they are derived rather than
  // stored — writing them into state from an effect would cost an extra
  // render pass and show "loading" for a frame that has nothing to load.
  if (!ready) return null;
  if (!user) return false;
  return fetched?.userId === user.id ? fetched.isPremium : null;
}
