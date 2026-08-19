"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Status = "checking" | "failed";

const TELEGRAM_FIELDS = ["id", "first_name", "last_name", "username", "photo_url", "auth_date", "hash"];

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
      const fields: Record<string, string> = {};
      for (const key of TELEGRAM_FIELDS) {
        const value = searchParams.get(key);
        if (value) fields[key] = value;
      }
      if (!fields.id || !fields.hash) throw MISSING_FIELDS;

      const startLang = searchParams.get("lang") || lang;
      const pair = await authApi.telegram(fields);
      applySession(pair);
      router.replace(
        `/${startLang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
    }

    run().catch((cause) => {
      if (cause !== MISSING_FIELDS) setError(authErrorMessage(cause, auth));
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
