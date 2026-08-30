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
  const [googleScriptFailed, setGoogleScriptFailed] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      setGoogleLoading(true);
      try {
        continueWith(await authApi.google(response.credential));
      } catch (cause) {
        setError(authErrorMessage(cause, auth));
        setGoogleLoading(false);
      }
    },
    [auth, continueWith]
  );

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !googleContainer.current || !window.google) return;
    const container = googleContainer.current;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Icon-only, to sit inside the square tile. Google requires that the button
    // is rendered by their script rather than reimplemented.
    if (container.childElementCount === 0) {
      window.google.accounts.id.renderButton(container, {
        type: "icon",
        theme: "outline",
        size: "large",
        shape: "square",
        locale: lang,
      });
    }

    // If the script loaded but rendered nothing — blocked iframe, offline, an
    // extension — fall back to our own mark rather than leaving an empty tile.
    const check = window.setTimeout(() => {
      if (container.childElementCount === 0) setGoogleScriptFailed(true);
    }, 1500);
    return () => window.clearTimeout(check);
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
    <div className="mt-7">
      <div className="mb-5 flex items-center gap-4 text-[0.78rem] font-medium text-auth-muted">
        <span className="h-px flex-1 bg-auth-line" />
        {auth.socialDivider}
        <span className="h-px flex-1 bg-auth-line" />
      </div>

      {/* Square provider tiles, centred. Google renders its own button for
          policy reasons, so it is scaled into a tile-sized box and clipped. */}
      <div className="flex items-center justify-center gap-4">
        {GOOGLE_CLIENT_ID && (
          <div
            className="relative size-[3.4rem] overflow-hidden rounded-2xl border border-auth-line bg-auth-field transition-colors hover:border-auth-ink/34"
            aria-busy={googleLoading}
          >
            <div
              ref={googleContainer}
              aria-label={auth.googleButton}
              className={
                googleReady && !googleScriptFailed
                  ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [&_iframe]:m-0! [&>div]:border-0! [&>div]:bg-transparent! [&>div]:shadow-none!"
                  : "hidden"
              }
            />
            {(!googleReady || googleScriptFailed || googleLoading) && (
              <span
                className="absolute inset-0 grid place-items-center"
                title={googleScriptFailed ? auth.googleButton : auth.socialLoading}
              >
                <GoogleMark />
              </span>
            )}
          </div>
        )}
        {APPLE_CLIENT_ID && APPLE_REDIRECT_URI && (
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={!appleReady || appleLoading}
            aria-label={auth.appleButton}
            title={auth.appleButton}
            className="grid size-[3.4rem] place-items-center rounded-2xl border border-auth-line bg-auth-field text-auth-ink transition-colors hover:border-auth-ink/34 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auth-primary/20"
          >
            {appleLoading ? (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            ) : (
              <AppleMark />
            )}
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
          onReady={() => {
            setGoogleScriptFailed(false);
            setGoogleReady(true);
          }}
          onError={() => {
            setGoogleReady(false);
            setGoogleScriptFailed(true);
            setError(auth.errorGeneric);
          }}
        />
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-4.5 shrink-0">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.614Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.039l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.322 0 2.508.454 3.442 1.346l2.581-2.58C13.463.892 11.425 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58Z" />
    </svg>
  );
}
