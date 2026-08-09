import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role: "RESEARCHER" | "ORGANIZATION";
    orgName?: string;
    orgWebsite?: string;
    researcherHandle?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = (await api.get("/api/auth/me")) as { user: User };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = (await api.post("/api/auth/login", { email, password })) as { user: User };
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      role: "RESEARCHER" | "ORGANIZATION";
      orgName?: string;
      orgWebsite?: string;
      researcherHandle?: string;
    }) => {
      const data = (await api.post("/api/auth/register", payload)) as { user: User };
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
