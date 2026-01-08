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

    // Block logout for 5 seconds after refresh
    setTimeout(() => {
      isPageRefreshing = false;
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
        // Use AuthStorage to load auth data safely
        const authData = AuthStorage.loadAuthData();

        if (authData) {
          setUser(authData.user);
        } else {
          console.log("ℹ️ No valid stored auth data found");

          // Only clear partial data if not refreshing
          if (!isPageRefreshing) {
            AuthStorage.clearAuthData();
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
    const success = AuthStorage.saveAuthData(token, userData);
    if (success) {
      setUser(userData);
    } else {
      console.error("❌ Failed to persist auth data");
    }
  };

  const logout = () => {
    // Prevent logout during refresh
    if (isPageRefreshing) {
      return;
    }
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
