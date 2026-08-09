"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { authErrorMessage } from "@/lib/auth-errors";
import { authApi } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

type AppleAuthorization = {
  authorization: { id_token: string };
  user?: { name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: object) => void;
        signIn: () => Promise<AppleAuthorization>;
      };
    };
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M17.05 12.54c-.02-2.17 1.77-3.22 1.85-3.27a3.98 3.98 0 0 0-3.14-1.68c-1.32-.14-2.6.79-3.27.79-.68 0-1.7-.77-2.82-.75a4.15 4.15 0 0 0-3.5 2.13c-1.51 2.62-.38 6.47 1.06 8.57.72 1.03 1.56 2.18 2.66 2.14 1.08-.05 1.48-.69 2.78-.69 1.27 0 1.65.69 2.79.66 1.16-.02 1.89-1.03 2.58-2.07a8.52 8.52 0 0 0 1.18-2.41 3.72 3.72 0 0 1-2.17-3.42ZM14.9 6.2c.58-.72.98-1.7.87-2.7-.84.04-1.9.58-2.51 1.28a3.81 3.81 0 0 0-.9 2.6c.95.07 1.92-.48 2.54-1.18Z" />
    </svg>
  );
}

export function SocialLoginButtons({
  lang,
  auth,
}: {
  lang: string;
  auth: Dictionary["auth"];
}) {
  const googleContainer = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { applySession } = useAuth();
  const router = useRouter();
  const socialEnabled = Boolean(GOOGLE_CLIENT_ID || (APPLE_CLIENT_ID && APPLE_REDIRECT_URI));

  const continueWith = useCallback(
    (pair: Awaited<ReturnType<typeof authApi.google>>) => {
      applySession(pair);
      router.push(
        `/${lang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
      );
    },
    [applySession, lang, router]
  );

  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      setError(null);
      try {
        continueWith(await authApi.google(response.credential));
      } catch (cause) {
        setError(authErrorMessage(cause, auth));
      }
    },
    [auth, continueWith]
  );

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !googleContainer.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.google.accounts.id.renderButton(googleContainer.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      width: Math.max(260, Math.floor(googleContainer.current.getBoundingClientRect().width)),
      locale: lang,
    });
  }, [googleReady, handleGoogleCredential, lang]);

  function initializeApple() {
    if (!APPLE_CLIENT_ID || !APPLE_REDIRECT_URI || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: "name email",
      redirectURI: APPLE_REDIRECT_URI,
      usePopup: true,
    });
    setAppleReady(true);
  }

  async function handleAppleSignIn() {
    if (!window.AppleID || !appleReady) return;
    setError(null);
    setAppleLoading(true);
    try {
      const response = await window.AppleID.auth.signIn();
      const firstName = response.user?.name?.firstName?.trim();
      const lastName = response.user?.name?.lastName?.trim();
      continueWith(await authApi.apple(response.authorization.id_token, [firstName, lastName].filter(Boolean).join(" ") || undefined));
    } catch (cause) {
      // Closing the provider popup is not an error worth showing to the learner.
      if (!(typeof cause === "object" && cause && "error" in cause && cause.error === "popup_closed_by_user")) {
        setError(authErrorMessage(cause, auth));
      }
    } finally {
      setAppleLoading(false);
    }
  }

  if (!socialEnabled) return null;

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/36">
        <span className="h-px flex-1 bg-white/12" />
        {auth.socialDivider}
        <span className="h-px flex-1 bg-white/12" />
      </div>
      <div className="space-y-3">
        {GOOGLE_CLIENT_ID && <div ref={googleContainer} aria-label={auth.googleButton} className="flex min-h-11 w-full justify-center" />}
        {APPLE_CLIENT_ID && APPLE_REDIRECT_URI && (
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={!appleReady || appleLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-[#102923] transition-colors hover:bg-[#e9f7f1] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63dcc2]/60"
          >
            <AppleMark />
            {appleLoading ? auth.socialLoading : auth.appleButton}
          </button>
        )}
      </div>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {APPLE_CLIENT_ID && APPLE_REDIRECT_URI && (
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="afterInteractive"
          onLoad={initializeApple}
        />
      )}
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}
    </div>
  );
}
