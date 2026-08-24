import { useEffect } from "react";

import { syncGrammarProgress } from "@/grammar/progress-sync";
import { useAuth } from "@/providers/auth-provider";

export function GrammarProgressBootstrap() {
  const { ready, token, user } = useAuth();

  useEffect(() => {
    if (!ready || !token || !user) return;
    void syncGrammarProgress(token, user.id).catch(() => {
      // Offline grammar still works; a later authenticated launch retries.
    });
  }, [ready, token, user]);

  return null;
}
