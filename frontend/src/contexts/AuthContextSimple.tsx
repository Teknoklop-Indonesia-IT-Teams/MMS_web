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

let isPageRefreshing = false;
let refreshCount = 0;

if (typeof window !== "undefined") {
  isPageRefreshing = AuthStorage.isRefreshing();

  if (isPageRefreshing) {
    refreshCount++;

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

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const authData = AuthStorage.loadAuthData();

        if (authData) {
          setUser(authData.user);
        } else {
          console.log("ℹ️ No valid stored auth data found");

          if (!isPageRefreshing) {
            AuthStorage.clearAuthData();
          }
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);

        if (!isPageRefreshing) {
          AuthStorage.clearAuthData();
        }
      } finally {
        setLoading(false);
      }
    };

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
