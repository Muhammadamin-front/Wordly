"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi, refreshSession, setAccessToken, type TokenPair, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  /** false until the silent-refresh attempt on first load has settled */
  ready: boolean;
  applySession: (pair: TokenPair) => void;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Goes through the same deduped refreshSession() as apiFetch's own
    // 401-retry — both used to call /auth/refresh independently, racing to
    // redeem the same single-use rotating refresh-token cookie. The loser
    // wasn't just a wasted request: the backend treats a reused refresh
    // token as theft and revokes every session for that user, so an
    // unlucky race could silently sign a genuinely logged-in visitor out.
    refreshSession()
      .then((pair) => {
        if (cancelled || !pair) return;
        setUser(pair.user);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((pair: TokenPair) => {
    setAccessToken(pair.access_token);
    setUser(pair.user);
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, applySession, updateUser, logout }),
    [user, ready, applySession, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
