// Shared between the sign-in button (which starts the redirect) and the
// callback page (which completes it) — GitHub requires the exact same
// redirect_uri on both the authorize request and the token exchange.
//
// GitHub OAuth Apps register a single callback URL, so this can't vary by
// the locale the learner started from the way the rest of the app's routes
// do — it's always the default-locale path. The learner's actual starting
// locale rides along in `state` instead (after the CSRF nonce, delimited by
// "::") so the callback can still land them back in the right language.
//
// This is the same value as `defaultLocale` in app/[lang]/dictionaries.ts,
// duplicated rather than imported: that module is marked "server-only" and
// this one is loaded from a client component.
const DEFAULT_LOCALE = "uz";

export const GITHUB_OAUTH_STATE_KEY = "vocora_github_oauth_state";

export function githubRedirectUri(): string {
  return `${window.location.origin}/${DEFAULT_LOCALE}/auth/github/callback`;
}

export function startGithubSignIn(clientId: string, lang: string): void {
  const nonce = crypto.randomUUID();
  window.sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, nonce);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: githubRedirectUri(),
    scope: "read:user user:email",
    state: `${nonce}::${lang}`,
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/** Splits a returned `state` back into the CSRF nonce and the starting locale. */
export function parseGithubState(state: string): { nonce: string; lang: string } {
  const [nonce, lang] = state.split("::");
  return { nonce, lang: lang || DEFAULT_LOCALE };
}
