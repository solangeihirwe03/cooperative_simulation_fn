import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/profile" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
