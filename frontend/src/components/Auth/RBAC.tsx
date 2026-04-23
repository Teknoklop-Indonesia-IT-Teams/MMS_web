import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthSimple";

interface RBACProps {
  allowedRoles: readonly string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RBAC({
  allowedRoles,
  children,
  fallback = null,
  redirectTo = "/login",
}: RBACProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    console.log("❌ RBAC: No user, redirecting to login");
    return <Navigate to={redirectTo} replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
