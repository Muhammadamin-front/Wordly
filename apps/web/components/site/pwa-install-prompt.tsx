"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/app/[lang]/dictionaries";

/** The event Chromium fires when the app meets the install criteria. Not in
 *  lib.dom yet, so the shape is declared here. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "vocora-pwa-prompt-dismissed";
/** How long "Not now" is respected before offering again. */
const SNOOZE_DAYS = 14;

function snoozed(): boolean {
  try {
    const until = Number(window.localStorage.getItem(DISMISSED_KEY) ?? 0);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    // Private mode or blocked storage — showing the banner is the safe default.
    return false;
  }
}

function snooze(): void {
  try {
    window.localStorage.setItem(
      DISMISSED_KEY,
      String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
    );
  } catch {
    // Not being able to remember the dismissal is not worth failing over.
  }
}

/** Bottom sheet offering to install the PWA.
 *
 *  Driven by `beforeinstallprompt` rather than shown on every visit: the
 *  browser only fires it when the app is genuinely installable and not already
 *  installed, so this never nags someone who has it or whose browser cannot
 *  install it at all.
 */
export function PwaInstallPrompt({ t }: { t: Dictionary["pwaInstall"] }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onBeforeInstall(event: Event) {
      // Keep the event so the install can be triggered from our own button
      // later; without preventDefault Chrome may show its own mini-infobar.
      event.preventDefault();
      if (snoozed()) return;
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    }
    function onInstalled() {
      setVisible(false);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  function dismiss() {
    snooze();
    setVisible(false);
  }

  async function install() {
    if (!deferred) return;
    setVisible(false);
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      // Declining the browser's own dialog is a "not now" too — asking again on
      // the next page load would be nagging.
      if (outcome === "dismissed") snooze();
    } catch {
      // The prompt can only be used once; if it throws there is nothing to
      // recover, and the banner is already gone.
    }
    setDeferred(null);
  }

  return (
    <div
      role="region"
      aria-label={t.title}
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-safe:animate-fade-up print:hidden"
    >
      <div className="surface-panel pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-line p-4 shadow-raised backdrop-blur-xl">
        <span className="icon-tile flex size-11 shrink-0 items-center justify-center rounded-lg text-brand-600 dark:text-brand-300">
          <Download className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-ink">{t.title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">{t.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={install}>
              {t.install}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t.dismiss}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label={t.close}
          className="-mr-1 -mt-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-soft transition-colors hover:bg-hover hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
