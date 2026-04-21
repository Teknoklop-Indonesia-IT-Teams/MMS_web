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

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const token = await tokenManager.getValidToken();

      if (!token) {
        console.log("❌ No valid token found");
        return false;
      }

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

        tokenManager.clearTokens();
        return false;
      }

      return false;
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      return false;
    }
  }, []);


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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setIsInitializing(true);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          console.log("ℹ️ User not authenticated");
        }
      } catch (error) {
        console.error("❌ Authentication initialization failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (token: string, userData: User): Promise<void> => {
      try {
        tokenManager.saveTokens({
          accessToken: token,
          refreshToken: token,
          expiresIn: 3600,
          expiresAt: Date.now() + 3600 * 1000,
        });

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error("❌ Login failed:", error);
        throw error;
      }
    },
    []
  );


  const logout = useCallback(async (): Promise<void> => {
    try {
  
      try {
        await authService.logout();
      } catch (error) {
        console.error(
          "⚠️ API logout failed, continuing with local logout:",
          error
        );
      }

      tokenManager.clearTokens();
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");


      setUser(null);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Logout failed:", error);
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

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
