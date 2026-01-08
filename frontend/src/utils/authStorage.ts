/**
 * Utility functions for managing auth data in localStorage
 * with persistence and refresh protection
 */

import { User } from "../types";

interface AuthData {
  token: string;
  user: User;
  timestamp: number;
}

export class AuthStorage {
  private static readonly AUTH_TOKEN_KEY = "token";
  private static readonly AUTH_USER_KEY = "user";
  private static readonly AUTH_REMEMBER_KEY = "rememberMe";
  private static readonly AUTH_TIMESTAMP_KEY = "authTimestamp";
  private static readonly AUTH_REFRESH_KEY = "lastPageLoad";

  /**
   * Save auth data to localStorage with persistence protection
   */
  static saveAuthData(token: string, userData: User): boolean {
    try {
      const timestamp = Date.now();

      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(this.AUTH_REMEMBER_KEY, "true");
      localStorage.setItem(this.AUTH_TIMESTAMP_KEY, timestamp.toString());
      return true;
    } catch (error) {
      console.error("❌ Failed to save auth data:", error);
      return false;
    }
  }

  /**
   * Load auth data from localStorage with validation
   */
  static loadAuthData(): AuthData | null {
    try {
      const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
      const userDataStr = localStorage.getItem(this.AUTH_USER_KEY);
      const rememberMe = localStorage.getItem(this.AUTH_REMEMBER_KEY);
      const timestampStr = localStorage.getItem(this.AUTH_TIMESTAMP_KEY);

      if (!token || !userDataStr || rememberMe !== "true") {
        return null;
      }

      const userData = JSON.parse(userDataStr);
      const timestamp = timestampStr ? parseInt(timestampStr) : Date.now();

      // Validate auth age (max 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      const age = Date.now() - timestamp;

      if (age > maxAge) {
        this.clearAuthData();
        return null;
      }
      return { token, user: userData, timestamp };
    } catch (error) {
      console.error("❌ Error loading auth data:", error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Clear auth data from localStorage (only on manual logout)
   */
  static clearAuthData(): void {
    try {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
      localStorage.removeItem(this.AUTH_REMEMBER_KEY);
      localStorage.removeItem(this.AUTH_TIMESTAMP_KEY);
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
    }
  }

  /**
   * Check if currently in refresh state
   */
  static isRefreshing(): boolean {
    try {
      const now = Date.now();
      const lastPageLoad = parseInt(
        localStorage.getItem(this.AUTH_REFRESH_KEY) || "0"
      );

      if (lastPageLoad && now - lastPageLoad < 3000) {
        return true;
      }

      // Update page load time
      localStorage.setItem(this.AUTH_REFRESH_KEY, now.toString());
      return false;
    } catch (error) {
      console.error("❌ Error checking refresh state:", error);
      return false;
    }
  }

  /**
   * Extend refresh protection period
   */
  static extendRefreshProtection(ms: number = 5000): void {
    try {
      const extendedTime = Date.now() - 3000 + ms; // Extend the window
      localStorage.setItem(this.AUTH_REFRESH_KEY, extendedTime.toString());
    } catch (error) {
      console.error("❌ Error extending refresh protection:", error);
    }
  }

  /**
   * Get auth token safely
   */
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("❌ Error getting token:", error);
      return null;
    }
  }

  /**
   * Check if user is remembered
   */
  static isRemembered(): boolean {
    try {
      return localStorage.getItem(this.AUTH_REMEMBER_KEY) === "true";
    } catch (error) {
      console.error("❌ Error checking remember state:", error);
      return false;
    }
  }
}
