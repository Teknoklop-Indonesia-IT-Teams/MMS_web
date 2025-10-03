import React from "react";
import { useAuth } from "../../hooks/useAuthSimple";

interface RoleBasedContentProps {
  allowedRoles: readonly string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * RoleBasedContent Component
 * Shows/hides content based on user roles without redirecting
 */
const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  allowedRoles,
  children,
  fallback = null,
  showFallback = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't show anything
  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check if user role is allowed
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default RoleBasedContent;
