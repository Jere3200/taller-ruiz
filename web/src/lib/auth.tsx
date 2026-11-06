"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createApiClient, type ApiClient } from "./api";
import type { Session } from "./types";

const STORAGE_KEY = "tr_session";
export const SESSION_EXPIRED_NOTICE = "Tu sesión expiró. Ingresá de nuevo.";

// The session lives in sessionStorage (per tab). useSyncExternalStore keeps React in sync with it.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked (private mode): the session just lasts until reload.
  }
  emit();
}

function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    return parsed.token && parsed.user ? parsed : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => undefined;

// One client for the whole app. The 401 handler needs the router, so the provider registers it from an effect.
let unauthorizedHandler: () => void = () => undefined;
const api: ApiClient = createApiClient({
  getToken: () => parseSession(readRaw())?.token ?? null,
  onUnauthorized: () => unauthorizedHandler(),
});

interface AuthContextValue {
  session: Session | null;
  /** False during server render and the first client render, so guards do not redirect too early. */
  ready: boolean;
  api: ApiClient;
  /** Notice to show on the login screen (for example when the session expired). */
  notice: string | null;
  clearNotice: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const session = useMemo(() => parseSession(raw), [raw]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    unauthorizedHandler = () => {
      if (!readRaw()) return;
      writeRaw(null);
      setNotice(SESSION_EXPIRED_NOTICE);
      router.replace("/login");
    };
    return () => {
      unauthorizedHandler = () => undefined;
    };
  }, [router]);

  const login = useCallback(
    async (username: string, password: string) => {
      const next = await api.login(username, password);
      setNotice(null);
      writeRaw(JSON.stringify(next));
    },
    [],
  );

  const logout = useCallback(() => {
    writeRaw(null);
    setNotice(null);
    router.push("/login");
  }, [router]);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, ready, api, notice, clearNotice, login, logout }),
    [session, ready, notice, clearNotice, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
