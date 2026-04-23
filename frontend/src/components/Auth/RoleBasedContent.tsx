import React from "react";
import { useAuth } from "../../hooks/useAuthSimple";

interface RoleBasedContentProps {
  allowedRoles: readonly string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  allowedRoles,
  children,
  fallback = null,
  showFallback = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return showFallback ? <>{fallback}</> : null;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default RoleBasedContent;
