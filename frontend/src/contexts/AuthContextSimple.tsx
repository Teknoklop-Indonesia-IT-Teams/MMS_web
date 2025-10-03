import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { AuthStorage } from "../utils/authStorage";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

// Global flags to prevent logout on refresh
let isPageRefreshing = false;
let refreshCount = 0;

// Detect page refresh using AuthStorage utility
if (typeof window !== "undefined") {
  isPageRefreshing = AuthStorage.isRefreshing();

  if (isPageRefreshing) {
    refreshCount++;
    console.log(
      `🔄 AuthContext: Page refresh detected (#${refreshCount}) - blocking logout for 5 seconds`
    );

    // Block logout for 5 seconds after refresh
    setTimeout(() => {
      isPageRefreshing = false;
      console.log("✅ AuthContext: Refresh protection period ended");
    }, 5000);
  } else {
    refreshCount = 0;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log("🔄 Initializing auth...");

        // Use AuthStorage to load auth data safely
        const authData = AuthStorage.loadAuthData();

        if (authData) {
          setUser(authData.user);
          console.log(
            "✅ Auth restored from localStorage:",
            authData.user.username || authData.user.nama
          );
          console.log("🛡️ Data will persist across refreshes");
        } else {
          console.log("ℹ️ No valid stored auth data found");

          // Only clear partial data if not refreshing
          if (!isPageRefreshing) {
            console.log("🔄 Not refreshing - safe to clear partial data");
            AuthStorage.clearAuthData();
          } else {
            console.log("🛡️ Page refreshing - preserving any existing data");
          }
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);

        // Only clear data if not refreshing
        if (!isPageRefreshing) {
          AuthStorage.clearAuthData();
        }
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    // Small delay to prevent race conditions
    setTimeout(initializeAuth, 100);
  }, []);

  const login = (token: string, userData: User) => {
    console.log("💾 Saving auth data with AuthStorage...");

    const success = AuthStorage.saveAuthData(token, userData);
    if (success) {
      setUser(userData);
      console.log(
        "✅ User logged in and data persisted:",
        userData.username || userData.nama
      );
    } else {
      console.error("❌ Failed to persist auth data");
    }
  };

  const logout = () => {
    // Prevent logout during refresh
    if (isPageRefreshing) {
      console.log("🛡️ Logout blocked - page is refreshing");
      return;
    }

    console.log("🚪 Manual logout - clearing persisted data");
    AuthStorage.clearAuthData();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
