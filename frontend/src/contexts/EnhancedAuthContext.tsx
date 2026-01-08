import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { tokenManager } from "../utils/tokenManager";
import { authService } from "../services/enhancedApi";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isInitializing: boolean;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we have a valid token
      const token = await tokenManager.getValidToken();

      if (!token) {
        console.log("❌ No valid token found");
        return false;
      }

      // Check if we have user data in localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return true;
        } catch (error) {
          console.error("❌ Failed to parse stored user data:", error);
          localStorage.removeItem("user");
        }
      }

      // If we have a token but no user data, fetch user profile
      try {
        const profileResponse = await authService.getProfile();
        if (profileResponse.data) {
          const userData = profileResponse.data as User;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          return true;
        }
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        // Token might be invalid, clear it
        tokenManager.clearTokens();
        return false;
      }

      return false;
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      return false;
    }
  }, []);

  // Refresh authentication (force re-check)
  const refreshAuth = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Failed to refresh auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Show loading during initialization
        setLoading(true);
        setIsInitializing(true);

        // Give components time to mount before making API calls
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check authentication status
        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          console.log("ℹ️ User not authenticated");
        }
      } catch (error) {
        console.error("❌ Authentication initialization failed:", error);
        setUser(null);
      } finally {
        // Complete initialization
        setLoading(false);

        // Keep initialization flag for a bit longer to prevent premature redirects
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(
    async (token: string, userData: User): Promise<void> => {
      try {
        // Save tokens using token manager
        tokenManager.saveTokens({
          accessToken: token,
          refreshToken: token, // Use same token as refresh token for now
          expiresIn: 3600, // 1 hour
          expiresAt: Date.now() + 3600 * 1000,
        });

        // Save user data
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error("❌ Login failed:", error);
        throw error;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call API logout (if available)
      try {
        await authService.logout();
      } catch (error) {
        console.error(
          "⚠️ API logout failed, continuing with local logout:",
          error
        );
      }

      // Clear tokens and user data
      tokenManager.clearTokens();
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");

      // Clear user state
      setUser(null);

      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Even if logout fails, clear local state
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    isInitializing,
    checkAuth,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
