/**
 * Enhanced Auth Storage with Robust Token Management
 * Solves auto-logout on refresh issues
 */

import { User } from "../types";

export interface TokenData {
  token: string;
  user: User;
  expiresAt: number;
  issuedAt: number;
}

export class EnhancedAuthStorage {
  private static readonly TOKEN_KEY = "authToken";
  private static readonly USER_KEY = "authUser";
  private static readonly EXPIRES_KEY = "authExpires";
  private static readonly ISSUED_KEY = "authIssued";
  private static readonly REFRESH_PROTECTION_KEY = "refreshProtection";
  private static readonly LAST_ACTIVITY_KEY = "lastActivity";

  /**
   * Save auth data with enhanced persistence
   */
  static saveAuthData(
    token: string,
    userData: User,
    expiresIn: number = 86400
  ): boolean {
    try {
      const now = Date.now();
      const expiresAt = now + expiresIn * 1000; // Convert seconds to milliseconds

      // Save all auth data
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
      localStorage.setItem(this.ISSUED_KEY, now.toString());
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());

      // Legacy support
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("❌ Failed to save auth data:", error);
      return false;
    }
  }

  /**
   * Load auth data with validation
   */
  static loadAuthData(): TokenData | null {
    try {
      const token =
        localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem("token");
      const userStr =
        localStorage.getItem(this.USER_KEY) || localStorage.getItem("user");
      const expiresStr = localStorage.getItem(this.EXPIRES_KEY);
      const issuedStr = localStorage.getItem(this.ISSUED_KEY);

      if (!token || !userStr) {
        return null;
      }

      const user = JSON.parse(userStr);
      const expiresAt = expiresStr ? parseInt(expiresStr) : 0;
      const issuedAt = issuedStr ? parseInt(issuedStr) : 0;
      const now = Date.now();

      // Check if token is expired
      if (expiresAt && now > expiresAt) {
        this.clearAuthData();
        return null;
      }

      // Update last activity
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());

      return {
        token,
        user,
        expiresAt,
        issuedAt,
      };
    } catch (error) {
      console.error("❌ Error loading auth data:", error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  static isTokenValid(): boolean {
    const authData = this.loadAuthData();
    return authData !== null;
  }

  /**
   * Get token if valid
   */
  static getValidToken(): string | null {
    const authData = this.loadAuthData();
    return authData ? authData.token : null;
  }

  /**
   * Get user data if token is valid
   */
  static getValidUser(): User | null {
    const authData = this.loadAuthData();
    return authData ? authData.user : null;
  }

  /**
   * Clear all auth data
   */
  static clearAuthData(): void {
    try {
      // Remove enhanced keys
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRES_KEY);
      localStorage.removeItem(this.ISSUED_KEY);
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
      localStorage.removeItem(this.REFRESH_PROTECTION_KEY);

      // Remove legacy keys
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
    }
  }

  /**
   * Refresh protection to prevent logout during page refresh
   */
  static setRefreshProtection(durationMs: number = 10000): void {
    try {
      const protectUntil = Date.now() + durationMs;
      localStorage.setItem(
        this.REFRESH_PROTECTION_KEY,
        protectUntil.toString()
      );
    } catch (error) {
      console.error("❌ Error setting refresh protection:", error);
    }
  }

  /**
   * Check if currently in refresh protection period
   */
  static isRefreshProtected(): boolean {
    try {
      const protectUntilStr = localStorage.getItem(this.REFRESH_PROTECTION_KEY);
      if (!protectUntilStr) return false;

      const protectUntil = parseInt(protectUntilStr);
      const now = Date.now();

      if (now < protectUntil) {
        return true;
      } else {
        localStorage.removeItem(this.REFRESH_PROTECTION_KEY);
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking refresh protection:", error);
      return false;
    }
  }

  /**
   * Clear refresh protection (force)
   */
  static clearRefreshProtection(): void {
    try {
      localStorage.removeItem(this.REFRESH_PROTECTION_KEY);
    } catch (error) {
      console.error("❌ Error clearing refresh protection:", error);
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    try {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (error) {
      console.error("❌ Error updating activity:", error);
    }
  }

  /**
   * Get authentication status for debugging
   */
  static getAuthStatus() {
    const authData = this.loadAuthData();
    const isProtected = this.isRefreshProtected();

    return {
      hasToken: !!authData?.token,
      hasUser: !!authData?.user,
      isExpired: authData ? Date.now() > authData.expiresAt : true,
      expiresAt: authData ? new Date(authData.expiresAt) : null,
      isRefreshProtected: isProtected,
      user: authData?.user?.username || authData?.user?.email || null,
    };
  }
}

export default EnhancedAuthStorage;
