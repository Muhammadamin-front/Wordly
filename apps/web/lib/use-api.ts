"use client";

import useSWR, { mutate as globalMutate, type SWRConfiguration } from "swr";

/** Shared SWR defaults for every client view.
 *
 *  Before this, each view owned a `useEffect` + `fetch` + three pieces of
 *  state, so the same endpoint was requested once per mounting component,
 *  again on every navigation back to it, and never revalidated after a
 *  background change. These settings give the whole app one cache: identical
 *  keys mounted together share a single request, a remount inside the
 *  deduping window is served from cache, and a stale tab refreshes itself
 *  when the learner comes back to it. */
export const SWR_DEFAULTS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  // Long enough that a page's own components (header widget, hub, panel)
  // asking for the same resource on mount produce one request.
  dedupingInterval: 30_000,
  // The API's own failures are already surfaced by each view; retrying
  // forever behind the learner's back just multiplies load during an outage.
  errorRetryCount: 2,
  errorRetryInterval: 4_000,
  shouldRetryOnError: true,
};

/** Wraps a typed API call in SWR. The key is what the cache is shared on, so
 *  it must include every argument the call depends on; pass `null` to hold
 *  the request until it is allowed to run (auth still loading, for example). */
export function useApi<T>(
  key: string | readonly unknown[] | null,
  fetcher: () => Promise<T>,
  config?: SWRConfiguration<T>
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    fetcher,
    config
  );
  return { data, error: error as unknown, isLoading, isValidating, mutate };
}

/** Cache keys used by more than one component. Anything shared belongs here
 *  rather than as a repeated string literal — a typo in one copy silently
 *  splits the cache instead of failing. */
export const apiKeys = {
  stats: "gamification:stats",
  achievements: "gamification:achievements",
  quests: "gamification:quests",
  learningPlan: "learning:plan",
  statistics: (days: number) => `statistics:overview:${days}`,
  subscription: "billing:subscription",
  ieltsOverview: "ielts:overview",
} as const;

/** Drops a cached entry and refetches it wherever it is mounted. Use after a
 *  mutation that the server has already accepted. */
export function refreshApi(key: string) {
  return globalMutate(key);
}
