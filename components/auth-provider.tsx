"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { getBrowserClient } from "@/lib/buildspace-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => void;
  signUp: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Client-side auth state. `initialUser` comes from the server (root layout),
// so there's no loading flash on first paint.
export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading] = useState(false);

  const signIn = useCallback(() => {
    const bs = getBrowserClient();
    window.location.href = bs.auth.getSignInUrl({
      redirectUri: `${window.location.origin}/api/auth/callback`,
    });
  }, []);

  const signUp = useCallback(() => {
    const bs = getBrowserClient();
    window.location.href = bs.auth.getSignUpUrl({
      redirectUri: `${window.location.origin}/api/auth/callback`,
    });
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return <AuthContext value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext>;
}
