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


let isPageRefreshing = false;


if (typeof window !== "undefined") {
  const now = Date.now();
  const pageLoadTime = parseInt(localStorage.getItem("pageLoadTime") || "0");


  if (pageLoadTime && now - pageLoadTime < 5000) {
    isPageRefreshing = true;
    setTimeout(() => {
      isPageRefreshing = false;
    }, 10000);
  }

  localStorage.setItem("pageLoadTime", now.toString());
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
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

    setTimeout(initializeAuth, 100);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    if (isPageRefreshing) {
      return;
    }
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
