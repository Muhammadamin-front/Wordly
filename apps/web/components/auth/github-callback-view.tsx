"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError, authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-errors";
import { GITHUB_OAUTH_STATE_KEY, githubRedirectUri, parseGithubState } from "@/lib/github-oauth";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Status = "checking" | "failed";

const INVALID_STATE = new Error("invalid_oauth_state");

export function GithubCallbackView({ lang, auth }: { lang: string; auth: Dictionary["auth"] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { applySession } = useAuth();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    // Effects run twice under StrictMode; the code is single-use, so a
    // second exchange would just fail and show a needless error.
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      const code = searchParams.get("code");
      const rawState = searchParams.get("state");
      const expectedNonce = window.sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);
      window.sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
      if (!code || !rawState || !expectedNonce) throw INVALID_STATE;
      const { nonce, lang: startLang } = parseGithubState(rawState);
      if (nonce !== expectedNonce) throw INVALID_STATE;

      const pair = await authApi.github(code, githubRedirectUri());
      applySession(pair);
      router.replace(
        `/${startLang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
    }

    run().catch((cause) => {
      // A 401 here means the provider rejected the sign-in, so the generic
      // "incorrect email or password" that maps to would be nonsense on a
      // page with no email or password on it — fall through to the
      // provider-specific message instead.
      const unhelpful = cause === INVALID_STATE || (cause instanceof ApiError && cause.status === 401);
      if (!unhelpful) setError(authErrorMessage(cause, auth));
      setStatus("failed");
    });
  }, [applySession, auth, lang, router, searchParams]);

  if (status === "checking") {
    return <Alert tone="info">{auth.socialLoading}</Alert>;
  }

  return (
    <div className="space-y-5">
      <Alert tone="error">{error ?? auth.githubCallbackFailed}</Alert>
      <Link href={`/${lang}/auth/login`}>
        <Button variant="secondary" fullWidth>
          {auth.backToLogin}
        </Button>
      </Link>
    </div>
  );
}
