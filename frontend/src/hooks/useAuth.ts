import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Hook to get current user and check permissions
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const hasRole = (role: string): boolean => {
    return authContext.user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authContext.user ? roles.includes(authContext.user.role) : false;
  };

  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    loading: authContext.loading,
    login: authContext.login,
    logout: authContext.logout,
    checkAuth: authContext.checkAuth,
    updateUser: authContext.updateUser,
    hasRole,
    hasAnyRole,
  };
};
