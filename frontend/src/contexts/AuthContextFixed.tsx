import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

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

// Detect page refresh
if (typeof window !== "undefined") {
  const now = Date.now();
  const pageLoadTime = parseInt(localStorage.getItem("pageLoadTime") || "0");

  // If page loaded within 5 seconds of last load, it's a refresh
  if (pageLoadTime && now - pageLoadTime < 5000) {
    isPageRefreshing = true;
    console.log("🔄 Page refresh detected - blocking logout for 10 seconds");

    // Block logout for 10 seconds after refresh
    setTimeout(() => {
      isPageRefreshing = false;
      console.log("✅ Refresh protection period ended");
    }, 10000);
  }

  localStorage.setItem("pageLoadTime", now.toString());
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

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log(
            "✅ Auth restored from localStorage:",
            parsedUser.username || parsedUser.nama
          );
        } else {
          console.log("ℹ️ No stored auth data found");
        }
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    // Small delay to prevent race conditions
    setTimeout(initializeAuth, 100);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    console.log("✅ User logged in:", userData.username || userData.nama);
  };

  const logout = () => {
    // Prevent logout during refresh
    if (isPageRefreshing) {
      console.log("🛡️ Logout blocked - page is refreshing");
      return;
    }

    console.log("🚪 Manual logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
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
