"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError, authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import { readTelegramCallback } from "@/lib/telegram-oauth";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Status = "checking" | "failed";

const MISSING_FIELDS = new Error("missing_telegram_fields");

export function TelegramCallbackView({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { applySession } = useAuth();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    // Effects run twice under StrictMode; the payload is single-use in
    // spirit (though not strictly, since Telegram itself doesn't expire it
    // quickly), so a second identical exchange is just wasted work to skip.
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      const fields = readTelegramCallback(searchParams, window.location.hash);
      if (!fields) throw MISSING_FIELDS;

      const startLang = searchParams.get("lang") || lang;
      const pair = await authApi.telegram(fields);
      applySession(pair);
      router.replace(
        `/${startLang}/${pair.user.profile.onboarding_completed ? "today" : "onboarding"}`
      );
    }

    run().catch((cause) => {
      // A 401 here means the provider rejected the sign-in, so the generic
      // "incorrect email or password" that maps to would be nonsense on a
      // page with no email or password on it — fall through to the
      // provider-specific message instead.
      const unhelpful = cause === MISSING_FIELDS || (cause instanceof ApiError && cause.status === 401);
      if (!unhelpful) setError(authErrorMessage(cause, auth));
      setStatus("failed");
    });
  }, [applySession, auth, lang, router, searchParams]);

  if (status === "checking") {
    return <Alert tone="info">{auth.socialLoading}</Alert>;
  }

  return (
    <div className="space-y-5">
      <Alert tone="error">{error ?? auth.telegramCallbackFailed}</Alert>
      <Link href={`/${lang}/auth/login`}>
        <Button variant="secondary" fullWidth>
          {auth.backToLogin}
        </Button>
      </Link>
    </div>
  );
}
