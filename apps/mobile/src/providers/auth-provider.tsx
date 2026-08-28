import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { ApiError, authApi, installAuthBridge, pushTokenApi, type TokenPair, type User } from "@/api/client";
import { clearGoogleSignInSession } from "@/auth/google-session";

const ACCESS_KEY = "vocora.access";
const REFRESH_KEY = "vocora.refresh";
const EXPIRES_AT_KEY = "vocora.expiresAt";
const USER_KEY = "vocora.user";
const PUSH_TOKEN_KEY = "vocora.expoPushToken";

const credentialStore = {
  getItemAsync: async (key: string) => Platform.OS === "web" ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key),
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === "web") globalThis.localStorage?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === "web") globalThis.localStorage?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};

type AuthValue = {
  ready: boolean;
  user: User | null;
  token: string | null;
  accept: (pair: TokenPair) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlight = useRef<Promise<boolean> | null>(null);
  const sessionGeneration = useRef(0);

  const scheduleAt = useCallback((expiresAt: number) => {
    if (timer.current) clearTimeout(timer.current);
    const delay = Math.max(30_000, expiresAt - Date.now() - 60_000);
    timer.current = setTimeout(() => { void refreshRef.current(); }, delay);
  }, []);

  const clearCredentials = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await Promise.all([
      queryClient.cancelQueries(),
      credentialStore.deleteItemAsync(ACCESS_KEY),
      credentialStore.deleteItemAsync(REFRESH_KEY),
      credentialStore.deleteItemAsync(EXPIRES_AT_KEY),
      credentialStore.deleteItemAsync(USER_KEY),
    ]);
    queryClient.clear();
    setToken(null);
    setUser(null);
  }, [queryClient]);

  const accept = useCallback(async (pair: TokenPair) => {
    const refreshToken = pair.refresh_token ?? await credentialStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) throw new Error("The server did not return a mobile refresh token.");
    const expiresAt = Date.now() + pair.expires_in * 1000;
    await Promise.all([
      credentialStore.setItemAsync(ACCESS_KEY, pair.access_token),
      credentialStore.setItemAsync(REFRESH_KEY, refreshToken),
      credentialStore.setItemAsync(EXPIRES_AT_KEY, String(expiresAt)),
      credentialStore.setItemAsync(USER_KEY, JSON.stringify(pair.user)),
    ]);
    setToken(pair.access_token);
    setUser(pair.user);
    scheduleAt(expiresAt);
  }, [scheduleAt]);

  const performRefresh = useCallback(async () => {
    const saved = await credentialStore.getItemAsync(REFRESH_KEY);
    if (!saved) return false;
    const generation = sessionGeneration.current;
    try {
      const pair = await authApi.refresh(saved);
      if (generation !== sessionGeneration.current) return false;
      await accept(pair);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && generation === sessionGeneration.current) await clearCredentials();
      else if (generation === sessionGeneration.current) scheduleAt(Date.now() + 90_000);
      return false;
    }
  }, [accept, clearCredentials, scheduleAt]);

  const refresh = useCallback((): Promise<boolean> => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const attempt = performRefresh().finally(() => {
      if (refreshInFlight.current === attempt) refreshInFlight.current = null;
    });
    refreshInFlight.current = attempt;
    return attempt;
  }, [performRefresh]);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const logout = useCallback(async () => {
    sessionGeneration.current += 1;
    refreshInFlight.current = null;
    const [refreshToken, pushToken] = await Promise.all([
      credentialStore.getItemAsync(REFRESH_KEY),
      Platform.OS === "web" ? Promise.resolve(null) : SecureStore.getItemAsync(PUSH_TOKEN_KEY),
    ]);
    await Promise.all([clearCredentials(), clearGoogleSignInSession()]);
    if (token && pushToken) void pushTokenApi.unregister(pushToken, token).catch(() => undefined);
    if (refreshToken) void authApi.logout(refreshToken).catch(() => undefined);
  }, [clearCredentials, token]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    void credentialStore.setItemAsync(USER_KEY, JSON.stringify(updated));
  }, []);

  useEffect(() => {
    installAuthBridge({
      refreshAccessToken: async () => {
        const refreshed = await refreshRef.current();
        return refreshed ? credentialStore.getItemAsync(ACCESS_KEY) : null;
      },
    });
    return () => installAuthBridge(null);
  }, []);

  useEffect(() => {
    let active = true;
    const generation = sessionGeneration.current;

    void (async () => {
      try {
        const [access, cachedUserRaw] = await Promise.all([
          credentialStore.getItemAsync(ACCESS_KEY),
          credentialStore.getItemAsync(USER_KEY),
        ]);
        if (!active || generation !== sessionGeneration.current) return;
        let cachedUser: User | null = null;
        try { cachedUser = cachedUserRaw ? JSON.parse(cachedUserRaw) as User : null; } catch { cachedUser = null; }
        if (access && cachedUser) {
          const storedExpiry = Number(await credentialStore.getItemAsync(EXPIRES_AT_KEY));
          if (!active || generation !== sessionGeneration.current) return;
          setUser(cachedUser);
          setToken(access);
          setReady(true);
          if (Number.isFinite(storedExpiry) && storedExpiry > 0) scheduleAt(storedExpiry);
        }
        if (access) {
          try {
            const restoredUser = await authApi.me(access);
            if (!active || generation !== sessionGeneration.current) return;
            const currentAccess = await credentialStore.getItemAsync(ACCESS_KEY);
            const storedExpiry = Number(await credentialStore.getItemAsync(EXPIRES_AT_KEY));
            if (!active || generation !== sessionGeneration.current || !currentAccess) return;
            setUser(restoredUser);
            setToken(currentAccess);
            void credentialStore.setItemAsync(USER_KEY, JSON.stringify(restoredUser));
            if (Number.isFinite(storedExpiry) && storedExpiry > 0) scheduleAt(storedExpiry);
            else void refresh();
          } catch (error) {
            if (!active || generation !== sessionGeneration.current) return;
            if (error instanceof ApiError && error.status === 401) {
              await refresh();
            } else if (cachedUser) {
              // Keep the offline account usable and retry authentication shortly.
              scheduleAt(Date.now() + 90_000);
            } else {
              await refresh();
            }
          }
        } else {
          await refresh();
        }
      } finally {
        if (active && generation === sessionGeneration.current) setReady(true);
      }
    })();

    return () => { active = false; };
  }, [refresh, scheduleAt]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const value = useMemo(() => ({ ready, user, token, accept, updateUser, logout, refresh }), [ready, user, token, accept, updateUser, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be within AuthProvider");
  return value;
}
