"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { syncGrammarProgress } from "@/lib/grammar/progress-sync";

/** Keeps the small local cache in step with the signed-in account. */
export function GrammarProgressSync() {
  const { ready, user } = useAuth();

  useEffect(() => {
    if (!ready || !user) return;
    void syncGrammarProgress(user.id).catch(() => {
      // Offline learning remains available; the next authenticated launch retries.
    });
  }, [ready, user]);

  return null;
}
