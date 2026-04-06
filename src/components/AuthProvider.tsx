import { useState, useCallback, ReactNode } from "react";
import { AuthContext, type AuthContextType } from "@/hooks/useAuth";
import type { MemberProfile } from "@/lib/api";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("access_token")
  );
  const [user, setUser] = useState<MemberProfile | null>(null);

  const setAuth = useCallback((newToken: string, newUser: MemberProfile) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user_role", newUser.role || "member");
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    setAuth,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
