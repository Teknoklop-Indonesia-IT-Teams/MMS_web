import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/apiSimple";
import { EnhancedAuthStorage } from "../utils/enhancedAuthStorage";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User, expiresIn?: number) => void;
  logout: () => void;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Check authentication status on mount and after refresh
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔍 Enhanced Auth: Checking authentication status...");

      // Set refresh protection to prevent logout during this check
      EnhancedAuthStorage.setRefreshProtection(15000); // 15 seconds protection

      // Try to get valid auth data from enhanced storage
      const authData = EnhancedAuthStorage.loadAuthData();

      if (!authData) {
        console.log("❌ Enhanced Auth: No valid auth data found");
        setUser(null);
        return false;
      }

      // Verify token with backend
      try {
        console.log("🔐 Enhanced Auth: Verifying token with backend...");
        const response = await authService.getProfile();

        if (response.data) {
          // Adapt backend response to frontend User type
          const backendUser = response.data as {
            userId: number;
            name: string;
            email: string;
            role: string;
          };

          const adaptedUser: User = {
            id: backendUser.userId,
            nama: backendUser.name,
            email: backendUser.email || "",
            role: backendUser.role,
            username: backendUser.email, // Use email as username fallback
            petugas: backendUser.name,
          };

          setUser(adaptedUser);

          // Update stored user data with fresh data from server
          EnhancedAuthStorage.saveAuthData(
            authData.token,
            adaptedUser,
            Math.max(0, Math.floor((authData.expiresAt - Date.now()) / 1000))
          );

          console.log("✅ Enhanced Auth: Authentication verified with server");
          return true;
        }
      } catch (error: unknown) {
        console.error("❌ Enhanced Auth: Server verification failed:", error);

        // If server verification fails but we have valid local data, use it
        // This handles cases where server is down but token is still valid
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401) {
          console.log(
            "⚠️ Enhanced Auth: Using cached user data (server unavailable)"
          );
          // Use cached user data directly since it's already in correct format
          setUser(authData.user);
          return true;
        }

        // If 401, token is invalid - clear data
        console.log(
          "🔑 Enhanced Auth: Token invalid (401), clearing auth data"
        );
        EnhancedAuthStorage.clearAuthData();
        setUser(null);
        return false;
      }

      return false;
    } catch (error) {
      console.error("❌ Enhanced Auth: Check auth error:", error);
      setUser(null);
      return false;
    }
  }, []);

  /**
   * Initialize auth on component mount
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Enhanced Auth: Initializing...");

        // Small delay to ensure localStorage is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          console.log(
            "🔄 Enhanced Auth: Not authenticated, checking for redirect"
          );
          const currentPath = window.location.pathname;

          // Define public paths that don't require authentication
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/unauthorized",
          ];

          const isPublicPath =
            publicPaths.some((path) => currentPath === path) ||
            currentPath.startsWith("/public");

          if (!isPublicPath) {
            console.log("🔄 Enhanced Auth: Redirecting to login");
            navigate("/login", { replace: true });
          }
        } else {
          console.log("✅ Enhanced Auth: Authenticated successfully");
        }
      } catch (error) {
        console.error("❌ Enhanced Auth: Initialization error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuth, navigate]);

  /**
   * Login function with enhanced storage
   */
  const login = useCallback(
    (token: string, userData: User, expiresIn: number = 86400) => {
      try {
        console.log(
          "🔑 Enhanced Auth: Logging in user:",
          userData.username || userData.email
        );

        // Save auth data with enhanced storage
        const success = EnhancedAuthStorage.saveAuthData(
          token,
          userData,
          expiresIn
        );

        if (success) {
          setUser(userData);
          console.log("✅ Enhanced Auth: Login successful");

          // Navigate to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          console.error("❌ Enhanced Auth: Failed to save auth data");
          throw new Error("Failed to save authentication data");
        }
      } catch (error) {
        console.error("❌ Enhanced Auth: Login error:", error);
        throw error;
      }
    },
    [navigate]
  );

  /**
   * Logout function with proper cleanup
   */
  const logout = useCallback(async () => {
    try {
      console.log("🚪 Enhanced Auth: Logout initiated...");

      // Check if we're in refresh protection period
      if (EnhancedAuthStorage.isRefreshProtected()) {
        console.log(
          "🛡️ Enhanced Auth: Logout blocked - in refresh protection period, forcing logout..."
        );
        // Force logout anyway - user explicitly clicked logout
        EnhancedAuthStorage.clearRefreshProtection();
      }

      // Call API logout
      try {
        await authService.logout();
        console.log("✅ Enhanced Auth: API logout successful");
      } catch (error) {
        console.error("⚠️ Enhanced Auth: API logout failed:", error);
        // Continue with local logout even if API fails
      }

      // Clear all auth data
      EnhancedAuthStorage.clearAuthData();
      setUser(null);

      // Navigate to login
      navigate("/login", { replace: true });

      console.log("✅ Enhanced Auth: Logout complete");
    } catch (error) {
      console.error("❌ Enhanced Auth: Logout error:", error);
      // Force logout even on error
      EnhancedAuthStorage.clearAuthData();
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /**
   * Handle page visibility change to detect refresh
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Enhanced Auth: Page became visible");
        EnhancedAuthStorage.updateActivity();

        // Re-check auth after page becomes visible
        if (user) {
          checkAuth();
        }
      }
    };

    const handleBeforeUnload = () => {
      console.log(
        "🔄 Enhanced Auth: Page unloading - setting refresh protection"
      );
      EnhancedAuthStorage.setRefreshProtection(10000); // 10 seconds
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, checkAuth]);

  // Log auth status for debugging
  useEffect(() => {
    const authStatus = EnhancedAuthStorage.getAuthStatus();
    console.log("🔍 Enhanced Auth Status:", authStatus);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;
