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

// The fields Telegram signs and returns. Forwarding exactly this set matters:
// the backend recomputes the HMAC over whichever fields it receives, so
// dropping one Telegram signed (or inventing one it didn't) breaks the match.
const SIGNED_FIELDS = ["id", "first_name", "last_name", "username", "photo_url", "auth_date", "hash"];

/**
 * Reads the signed payload Telegram hands back on the callback URL.
 *
 * The redirect flow returns it as `#tgAuthResult=<base64url JSON>` in the URL
 * *fragment*, not as query parameters — which also means it never reaches the
 * server, so this has to run in the browser. Query parameters are still
 * accepted as a fallback, since that is the shape Telegram's embedded widget
 * uses when it posts to a `data-auth-url`.
 *
 * Returns null when there is nothing usable to send.
 */
export function readTelegramCallback(search: URLSearchParams, hash: string): Record<string, string> | null {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const encoded = fragment.get("tgAuthResult");
  const fields: Record<string, string> = {};

  if (encoded) {
    let decoded: unknown;
    try {
      // base64url, and Telegram omits the padding.
      const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(
        encoded.length + ((4 - (encoded.length % 4)) % 4),
        "="
      );
      decoded = JSON.parse(atob(base64));
    } catch {
      return null;
    }
    if (typeof decoded !== "object" || decoded === null) return null;
    const payload = decoded as Record<string, unknown>;
    for (const key of SIGNED_FIELDS) {
      const value = payload[key];
      // `id` and `auth_date` come back as JSON numbers; the API takes strings.
      if (typeof value === "string" || typeof value === "number") fields[key] = String(value);
    }
  } else {
    for (const key of SIGNED_FIELDS) {
      const value = search.get(key);
      if (value) fields[key] = value;
    }
  }

  return fields.id && fields.hash ? fields : null;
}
