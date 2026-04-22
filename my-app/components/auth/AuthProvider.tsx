"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  simpleLogin, 
  simpleRegister, 
  getSessionFromToken,
  SimpleRegisterPayload,
  AuthSession 
} from "@/lib/api/simpleAuth";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api/token";

interface AuthContextValue {
  user: AuthSession | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (studentPhone: string, password: string) => Promise<void>;
  register: (payload: SimpleRegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthSession | null>(null);
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
      const session = await getSessionFromToken(storedToken);
      setUser(session);
      setToken(storedToken);
      console.log("[Auth] user refreshed", session);
    } catch (error) {
      console.error("[Auth] refresh failed", error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (studentPhone: string, password: string) => {
      const response = await simpleLogin({ studentPhone, password });
      setStoredToken(response.accessToken);
      setUser(response.session);
      setToken(response.accessToken);
      console.log("[Auth] login success", response.session);
      router.refresh();
    },
    [router],
  );

  const register = useCallback(
    async (payload: SimpleRegisterPayload) => {
      const response = await simpleRegister(payload);
      setStoredToken(response.accessToken);
      setUser(response.session);
      setToken(response.accessToken);
      console.log("[Auth] register success", response.session);
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
