import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Enhanced ProtectedRoute Component with Robust Authentication
 * - No more accidental redirects on refresh
 * - Proper loading states
 * - Enhanced debug logging
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute:", {
    path: location.pathname,
    loading,
    isAuthenticated,
    requireAuth,
    user: user?.email || "none",
  });

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log("🔒 ProtectedRoute: Access denied, redirecting to login");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated or auth is not required
  console.log("✅ ProtectedRoute: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
