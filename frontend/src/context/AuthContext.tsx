import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setToken, getToken, subscriptionApi } from "@/services/api";
import type { User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ── FIX 1: Always try refresh first so the 15-min access token
        //           is renewed from the 7-day refresh cookie. Without this,
        //           users are silently "logged out" after 15 minutes.
        const savedToken = getToken();

        if (savedToken) {
          // Token exists in memory/localStorage — verify it's still valid
          try {
            const { user: u } = await authApi.me();
            persist(u);
            await loadPremiumStatus(u._id);
            return;
          } catch {
            // Access token expired — fall through to refresh
          }
        }

        // Try to get a new access token from the refresh cookie
        const refreshed = await authApi.refresh();
        if (refreshed) {
          try {
            const { user: u } = await authApi.me();
            persist(u);
            await loadPremiumStatus(u._id);
          } catch {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadPremiumStatus = async (_userId: string) => {
    // ── FIX 2: Load isPremium on startup so premium gating works immediately
    //           on page load/refresh — not just after visiting /subscription.
    try {
      const { subscription } = await subscriptionApi.getMe();
      setIsPremium(
        subscription.isActive &&
        subscription.plan === "premium" &&
        (!subscription.expiresAt || new Date() < new Date(subscription.expiresAt))
      );
    } catch {
      setIsPremium(false);
    }
  };

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem("cc_user", JSON.stringify(u));
  };

  const clearAuth = () => {
    setUser(null);
    setIsPremium(false);
    localStorage.removeItem("cc_user");
    localStorage.removeItem("cc_token");
  };

  const login = async (email: string, password: string) => {
    const { user: u } = await authApi.login({ email, password });
    persist(u);
    await loadPremiumStatus(u._id);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: u } = await authApi.register({ name, email, password });
    persist(u);
    setIsPremium(false); // new users are never premium
  };

  const loginWithGoogle = async (accessToken: string) => {
    const { user: u } = await authApi.googleAuth(accessToken);
    persist(u);
    await loadPremiumStatus(u._id);
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
  };

  // ── FIX: refreshUser — re-fetches the user from /me and persists the updated
  //         object (including new role). Call this after setOwnerRole or after
  //         buying an owner subscription so Dashboard/Header update immediately.
  const refreshUser = async () => {
    try {
      const { user: u } = await authApi.me();
      persist(u);
      await loadPremiumStatus(u._id);
    } catch { /* silently ignore */ }
  };

  // ── FIX 3: Render children immediately with a loading state instead of
  //           returning null — prevents full white screen flash on every load.
  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, isPremium, setIsPremium, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
