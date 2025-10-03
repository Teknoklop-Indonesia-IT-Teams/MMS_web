import { useAuth as useMainAuth } from "./useAuth";

/**
 * Compatibility hook for components that still use the old useAuth interface
 * This allows gradual migration from old auth system to robust auth system
 */
export const useAuth = () => {
  const { user, isAuthenticated, login, logout, loading, checkAuth } =
    useMainAuth();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPermission = (): boolean => {
    // For now, just check if user is authenticated
    // Can be extended later for more granular permissions
    return isAuthenticated;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    checkAuth,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
};

export default useAuth;
