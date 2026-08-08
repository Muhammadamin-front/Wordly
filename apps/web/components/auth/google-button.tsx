"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
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

/** Renders Google Identity Services sign-in. Hidden unless
 *  NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured. */
export function GoogleButton({ lang, divider }: { lang: string; divider: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const { applySession } = useAuth();
  const router = useRouter();

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const pair = await authApi.google(response.credential);
        applySession(pair);
        router.push(
          `/${lang}/${pair.user.profile.onboarding_completed ? "dashboard" : "onboarding"}`
        );
      } catch {
        // Surfacing Google-side failures is handled by the form's generic error UI paths;
        // a failed exchange simply leaves the user on the page.
      }
    },
    [applySession, router, lang]
  );

  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !container.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(container.current, {
      theme: "outline",
      size: "large",
      width: 320,
      locale: lang,
    });
  }, [scriptReady, handleCredential, lang]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase text-white/36">
        <span className="h-px flex-1 bg-white/12" />
        {divider}
        <span className="h-px flex-1 bg-white/12" />
      </div>
      <div ref={container} className="flex justify-center" />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
    </>
  );
}
