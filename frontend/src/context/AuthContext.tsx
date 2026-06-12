"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

const USER_KEY = "ofcc_user";

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    if (u) window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api.login(username, password);
      setToken(res.accessToken);
      persist({
        id: res.id,
        username: res.username,
        email: res.email,
        roles: res.roles,
        customerId: res.customerId,
      });
    },
    [persist],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.register(username, email, password);
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    setToken(null);
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: !!user?.roles?.includes("ROLE_ADMIN"),
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
