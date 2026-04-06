import { createContext, useContext } from "react";
import type { MemberProfile } from "@/lib/api";

export interface AuthContextType {
  user: MemberProfile | null;
  token: string | null;
  setAuth: (token: string, user: {role: string}) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
