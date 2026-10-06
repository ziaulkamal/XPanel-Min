// Sesi auth panel: token + profil di localStorage, guard rute di router.tsx.
// RELASI: src/modules/auth — laman login/register yang memanggil login()/register().
// RELASI: src/lib/api/client.ts — pembaca token untuk header Authorization.
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import type { AuthUser, TokenResponse } from "@/lib/api/types";
import { STORAGE_KEYS } from "@/lib/config";

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, tenantName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistSession(tok: TokenResponse) {
  try {
    localStorage.setItem(STORAGE_KEYS.token, tok.access_token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(tok.user));
  } catch {
    /* mode privat: sesi hanya bertahan di memori */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const value = useMemo<AuthState>(
    () => ({
      user,
      async login(email, password) {
        const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
        persistSession(data);
        setUser(data.user);
      },
      async register(name, email, password, tenantName) {
        const { data } = await api.post<TokenResponse>("/auth/register", {
          name, email, password, tenant_name: tenantName,
        });
        persistSession(data);
        setUser(data.user);
      },
      logout() {
        void api.post("/auth/logout").catch(() => {});
        try {
          localStorage.removeItem(STORAGE_KEYS.token);
          localStorage.removeItem(STORAGE_KEYS.user);
        } catch { /* abaikan */ }
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
