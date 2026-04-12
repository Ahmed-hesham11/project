"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, login as loginApi, register as registerApi, RegisterPayload } from "@/lib/api/auth";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api/token";
import { AuthUser } from "@/lib/api/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const me = await getMe(storedToken);
      setUser(me);
      setToken(storedToken);
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("[Auth] initializing user session");
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginApi({ email, password });
      setStoredToken(response.accessToken);
      const me = await getMe(response.accessToken);
      setUser(me);
      setToken(response.accessToken);
      console.log("[Auth] login success", me);
      router.refresh();
    },
    [router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerApi(payload);
      setStoredToken(response.accessToken);
      const me = await getMe(response.accessToken);
      setUser(me);
      setToken(response.accessToken);
      console.log("[Auth] register success", me);
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setToken(null);
    console.log("[Auth] logout");
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
