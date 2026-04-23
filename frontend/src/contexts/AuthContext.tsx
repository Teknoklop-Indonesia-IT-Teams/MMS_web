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
  updateUser: (newUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      EnhancedAuthStorage.setRefreshProtection(15000);

      const authData = EnhancedAuthStorage.loadAuthData();

      if (!authData) {
        console.log("❌ Enhanced Auth: No valid auth data found");
        setUser(null);
        return false;
      }

      try {
        const response = await authService.getProfile();

        if (response.data) {
          const backendUser = response.data as {
            id: number;
            nama: string;
            email: string;
            role: string;
            username: string;
            telp: string;
          };

          const adaptedUser: User = {
            id: backendUser.id,
            nama: backendUser.nama,
            email: backendUser.email || "",
            role: backendUser.role,
            username: backendUser.username,
            telp: backendUser.telp || "",
          };

          setUser(adaptedUser);

          EnhancedAuthStorage.saveAuthData(
            authData.token,
            adaptedUser,
            Math.max(0, Math.floor((authData.expiresAt - Date.now()) / 1000)),
          );

          return true;
        }
      } catch (error: unknown) {
        console.error("❌ Enhanced Auth: Server verification failed:", error);

        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 401) {
          setUser(authData.user);
          return true;
        }

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

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        const currentPath = window.location.pathname;

        if (currentPath === "/") {
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }

        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/unauthorized",
          ];

          const isPublicPath =
            publicPaths.includes(currentPath) ||
            currentPath.startsWith("/public");

          if (!isPublicPath) {
            navigate("/login", { replace: true });
          }
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

  const login = useCallback(
    (token: string, userData: User, expiresIn: number = 86400) => {
      try {
        const success = EnhancedAuthStorage.saveAuthData(
          token,
          userData,
          expiresIn,
        );

        if (success) {
          setUser(userData);

          navigate("/dashboard-telemetry", { replace: true });
        } else {
          console.error("❌ Enhanced Auth: Failed to save auth data");
          throw new Error("Failed to save authentication data");
        }
      } catch (error) {
        console.error("❌ Enhanced Auth: Login error:", error);
        throw error;
      }
    },
    [navigate],
  );

  const updateUser = (newUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...newUser } : prev));
  };

  const logout = useCallback(async () => {
    try {
      if (EnhancedAuthStorage.isRefreshProtected()) {
        EnhancedAuthStorage.clearRefreshProtection();
      }

      try {
        await authService.logout();
      } catch (error) {
        console.error("⚠️ Enhanced Auth: API logout failed:", error);
      }

      EnhancedAuthStorage.clearAuthData();
      setUser(null);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ Enhanced Auth: Logout error:", error);
      EnhancedAuthStorage.clearAuthData();
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        EnhancedAuthStorage.updateActivity();

        if (user) {
          checkAuth();
        }
      }
    };

    const handleBeforeUnload = () => {
      EnhancedAuthStorage.setRefreshProtection(10000);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, checkAuth]);

  useEffect(() => {
    const authStatus = EnhancedAuthStorage.getAuthStatus();
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    checkAuth,
    updateUser,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Initializing...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;
