"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { authErrorMessage } from "@/lib/auth-errors";
import { authApi } from "@/lib/api";
import { startGithubSignIn } from "@/lib/github-oauth";
import { startTelegramSignIn } from "@/lib/telegram-oauth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const TELEGRAM_BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

type GoogleCredentialResponse = { credential: string };
type GoogleIdentityApi = NonNullable<Window["google"]>["accounts"]["id"];

let initializedGoogleClientId: string | null = null;
let activeGoogleCredentialHandler: ((response: GoogleCredentialResponse) => void) | null = null;

function initializeGoogleIdentity(
  identity: GoogleIdentityApi,
  clientId: string,
  handler: (response: GoogleCredentialResponse) => void
) {
  activeGoogleCredentialHandler = handler;
  if (initializedGoogleClientId === clientId) return;
  identity.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => activeGoogleCredentialHandler?.(response),
    auto_select: false,
    button_auto_select: false,
    use_fedcm_for_button: false,
    cancel_on_tap_outside: true,
  });
  initializedGoogleClientId = clientId;
}

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
          disableAutoSelect?: () => void;
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

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.11.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.67.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <circle cx="12" cy="12" r="11.5" fill="#29A9EA" />
      <path
        fill="#fff"
        d="M17.53 6.87 15.6 17.2c-.14.66-.53.82-1.08.51l-2.98-2.2-1.44 1.38c-.16.16-.29.29-.6.29l.22-3.04 5.53-5c.24-.21-.05-.33-.37-.12l-6.84 4.3-2.94-.92c-.64-.2-.65-.64.13-.95l11.5-4.43c.53-.2 1 .13.8.93Z"
      />
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
  // True once Google's own button has really rendered into the tile.
  const [googleSettled, setGoogleSettled] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { applySession } = useAuth();
  const router = useRouter();
  const socialEnabled = Boolean(
    GOOGLE_CLIENT_ID ||
      (APPLE_CLIENT_ID && APPLE_REDIRECT_URI) ||
      GITHUB_CLIENT_ID ||
      TELEGRAM_BOT_ID
  );

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
    // The auth page is an explicit account-selection surface. Reset Google's
    // remembered auto-select state before rendering so both login and register
    // always let the learner choose another active Google account.
    window.google.accounts.id.disableAutoSelect?.();
    initializeGoogleIdentity(window.google.accounts.id, GOOGLE_CLIENT_ID, handleGoogleCredential);

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

    // If the script loaded but produced nothing usable, fall back to our own
    // mark rather than leaving an empty tile.
    //
    // Google renders the button two different ways, and telling them apart is
    // the whole job here:
    //
    //   working origin      -> a cross-origin <iframe>, no mark in the light DOM
    //   unauthorised origin -> a light-DOM button shell whose "G" mark is 0x0,
    //                          because the origin-gated styling never arrives
    //
    // So a light-DOM mark is the failure signature, not the success one: if we
    // can see a mark, it has to be a real size, and if we cannot see one at all
    // Google used the iframe and a sized container is as much as we can check.
    // Measuring only the mark hid working iframe buttons; measuring only the
    // container accepted the collapsed shell. Check whichever one is present.
    //
    // Poll rather than sampling once: on a slow connection the iframe takes a
    // while, and a single early snapshot reads that as failure.
    const started = Date.now();
    const poll = window.setInterval(() => {
      const expired = Date.now() - started > 6000;
      const mark = container.querySelector("svg, img");
      const box = (mark ?? container).getBoundingClientRect();
      if (box.width >= 8 && box.height >= 8 && (mark || container.childElementCount > 0)) {
        window.clearInterval(poll);
        setGoogleSettled(true);
      } else if (expired) {
        window.clearInterval(poll);
        setGoogleScriptFailed(true);
      }
    }, 250);
    return () => window.clearInterval(poll);
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

  function handleGithubSignIn() {
    if (!GITHUB_CLIENT_ID) return;
    setError(null);
    // A full-page redirect, not a popup: GitHub's OAuth app flow needs a
    // server-held client secret to exchange the code, so there's no
    // same-page JS SDK the way Google/Apple offer. The callback route picks
    // this back up and finishes the sign-in.
    startGithubSignIn(GITHUB_CLIENT_ID, lang);
  }

  function handleTelegramSignIn() {
    if (!TELEGRAM_BOT_ID) return;
    setError(null);
    startTelegramSignIn(TELEGRAM_BOT_ID, lang);
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
                  ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [&_iframe]:!m-0 [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!shadow-none"
                  : "hidden"
              }
            />
            {googleScriptFailed && (
              // Google's real button occupies this same tile once it loads, so
              // this fallback needs its own hit target rather than sitting
              // inertly under it — without one, a failed load (an unauthorized
              // origin, the common case) left a tile that looked like a button
              // but did nothing at all when tapped.
              <button
                type="button"
                onClick={() => setError(auth.googleUnavailable)}
                aria-label={auth.googleButton}
                title={auth.googleButton}
                className="absolute inset-0 grid cursor-pointer place-items-center"
              >
                <GoogleMark />
              </button>
            )}
            {(!googleSettled || googleLoading) && !googleScriptFailed && (
              // Covers the tile until Google's own button has actually painted,
              // so the learner never sees an empty square while it loads.
              <span
                className="absolute inset-0 grid place-items-center bg-auth-field"
                title={auth.socialLoading}
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
            className="grid size-[3.4rem] cursor-pointer place-items-center rounded-2xl border border-auth-line bg-auth-field text-auth-ink transition-colors hover:border-auth-ink/34 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auth-primary/20"
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
        {GITHUB_CLIENT_ID && (
          <button
            type="button"
            onClick={handleGithubSignIn}
            aria-label={auth.githubButton}
            title={auth.githubButton}
            className="grid size-[3.4rem] cursor-pointer place-items-center rounded-2xl border border-auth-line bg-auth-field text-auth-ink transition-colors hover:border-auth-ink/34 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auth-primary/20"
          >
            <GithubMark />
          </button>
        )}
        {TELEGRAM_BOT_ID && (
          <button
            type="button"
            onClick={handleTelegramSignIn}
            aria-label={auth.telegramButton}
            title={auth.telegramButton}
            className="grid size-[3.4rem] cursor-pointer place-items-center overflow-hidden rounded-2xl border border-auth-line bg-auth-field transition-colors hover:border-auth-ink/34 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auth-primary/20"
          >
            <TelegramMark />
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
            setGoogleSettled(false);
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
    <svg viewBox="0 0 18 18" aria-hidden className="size-[18px] shrink-0">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.614Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.91-2.258c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.45.347 2.824.956 4.039l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.322 0 2.508.454 3.442 1.346l2.581-2.58C13.463.892 11.425 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58Z" />
    </svg>
  );
}
