// Telegram's redirect-based login (the same flow the official widget opens
// in a popup, used here as a full-page redirect instead — consistent with
// how GitHub sign-in is wired, and avoids a popup+postMessage bridge).
//
// Unlike GitHub, there's no CSRF `state` to round-trip: Telegram signs the
// callback payload itself (HMAC, verified server-side), so a captured
// callback URL is the only replay risk, and that's bounded by the
// auth_date freshness check on the backend. What Telegram's redirect can't
// carry back on its own is which locale the learner started from, so that
// rides along as this app's own `lang` query param on the callback URL.

const DEFAULT_LOCALE = "uz"; // see lib/github-oauth.ts for why this isn't imported from dictionaries.ts

export function telegramCallbackUrl(lang: string): string {
  return `${window.location.origin}/${DEFAULT_LOCALE}/auth/telegram/callback?lang=${encodeURIComponent(lang)}`;
}

export function startTelegramSignIn(botId: string, lang: string): void {
  const params = new URLSearchParams({
    bot_id: botId,
    origin: window.location.origin,
    return_to: telegramCallbackUrl(lang),
    request_access: "write",
    embed: "0",
  });
  window.location.href = `https://oauth.telegram.org/auth?${params.toString()}`;
}
