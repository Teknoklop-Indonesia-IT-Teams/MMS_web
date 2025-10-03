import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthSimple";

interface RBACProps {
  allowedRoles: readonly string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * RBAC (Role-Based Access Control) Component
 * Controls access to components based on user roles
 */
export function RBAC({
  allowedRoles,
  children,
  fallback = null,
  redirectTo = "/login",
}: RBACProps) {
  const { user, isAuthenticated } = useAuth();

  console.log("🔒 RBAC Debug:", {
    isAuthenticated,
    user,
    allowedRoles,
    userRole: user?.role,
  });

  // If no user, redirect to login
  if (!isAuthenticated || !user) {
    console.log("❌ RBAC: No user, redirecting to login");
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user role is allowed
  const hasAccess = allowedRoles.includes(user.role);
  console.log("🔑 RBAC: Access check:", {
    hasAccess,
    userRole: user.role,
    allowedRoles,
  });

  if (!hasAccess) {
    // If fallback provided, show it. Otherwise redirect
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
