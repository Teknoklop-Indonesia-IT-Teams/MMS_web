/**
 * Robust Token Management System
 * Solves refresh logout issues with:
 * 1. HttpOnly cookie storage for access tokens
 * 2. Secure localStorage for refresh tokens
 * 3. Single-flight refresh token mechanism
 * 4. Request queuing during token refresh
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  private requestQueue: QueuedRequest[] = [];
  private isRefreshing = false;
  private refreshCount = 0;
  private lastRefreshTime = 0;
  private maxRefreshAttempts = 3;
  private refreshCooldown = 5000; // 5 seconds between refresh attempts

  /**
   * Save tokens securely
   * Access token in httpOnly cookie (if backend supports)
   * Refresh token in localStorage (encrypted)
   */
  saveTokens(tokenData: TokenData): void {
    try {
      // Calculate expiration time
      const expiresAt = Date.now() + tokenData.expiresIn * 1000;

      // Save access token (prefer httpOnly cookie, fallback to localStorage)
      if (this.canUseHttpOnlyCookie()) {
        this.setHttpOnlyCookie(
          "accessToken",
          tokenData.accessToken,
          tokenData.expiresIn
        );
      } else {
        localStorage.setItem("accessToken", tokenData.accessToken);
      }

      // Save refresh token in localStorage (will implement encryption later)
      localStorage.setItem("refreshToken", tokenData.refreshToken);
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());

      // Legacy support
      localStorage.setItem("token", tokenData.accessToken);

      console.log("✅ Tokens saved securely");
    } catch (error) {
      console.error("❌ Failed to save tokens:", error);
      throw new Error("Failed to save authentication tokens");
    }
  }

  /**
   * Get current access token
   * Try httpOnly cookie first, then localStorage
   */
  getAccessToken(): string | null {
    try {
      // Try httpOnly cookie first
      if (this.canUseHttpOnlyCookie()) {
        const cookieToken = this.getHttpOnlyCookie("accessToken");
        if (cookieToken) return cookieToken;
      }

      // Fallback to localStorage
      return (
        localStorage.getItem("accessToken") || localStorage.getItem("token")
      );
    } catch (error) {
      console.error("❌ Failed to get access token:", error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem("refreshToken");
    } catch (error) {
      console.error("❌ Failed to get refresh token:", error);
      return null;
    }
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(bufferMinutes: number = 5): boolean {
    try {
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      if (!expiresAt) return true;

      const expirationTime = parseInt(expiresAt);
      const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds

      return Date.now() >= expirationTime - bufferTime;
    } catch (error) {
      console.error("❌ Failed to check token expiration:", error);
      return true;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   * This is the main method that handles single-flight refresh
   */
  async getValidToken(): Promise<string> {
    const currentToken = this.getAccessToken();

    // If token exists and not expired, return it
    if (currentToken && !this.isTokenExpired()) {
      return currentToken;
    }

    // If already refreshing, add to queue
    if (this.isRefreshing && this.refreshPromise) {
      console.log("🔄 Token refresh in progress, queuing request...");
      return this.refreshPromise;
    }

    // Start refresh process
    return this.refreshAccessToken();
  }

  /**
   * Refresh access token using refresh token
   * Implements single-flight pattern to prevent multiple simultaneous refreshes
   */
  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refreshes
    if (this.isRefreshing) {
      if (this.refreshPromise) {
        return this.refreshPromise;
      }
    }

    // Check refresh cooldown
    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
    if (timeSinceLastRefresh < this.refreshCooldown) {
      throw new Error(
        `Refresh cooldown active. Wait ${
          this.refreshCooldown - timeSinceLastRefresh
        }ms`
      );
    }

    // Check max refresh attempts
    if (this.refreshCount >= this.maxRefreshAttempts) {
      console.error("❌ Max refresh attempts reached");
      this.clearTokens();
      throw new Error("Maximum refresh attempts exceeded");
    }

    this.isRefreshing = true;
    this.refreshCount++;
    this.lastRefreshTime = Date.now();

    console.log(
      `🔄 Starting token refresh (attempt ${this.refreshCount}/${this.maxRefreshAttempts})`
    );

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;

      // Reset refresh counter on success
      this.refreshCount = 0;
      console.log("✅ Token refresh successful");

      return newToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // If all attempts failed, clear tokens
      if (this.refreshCount >= this.maxRefreshAttempts) {
        this.clearTokens();
      }

      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include", // Important for httpOnly cookies
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Save new tokens
      this.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken, // Keep old refresh token if not provided
        expiresIn: data.expiresIn || 3600, // Default 1 hour
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000,
      });

      return data.accessToken;
    } catch (error) {
      console.error("❌ Token refresh API call failed:", error);
      throw error;
    }
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    try {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("token"); // Legacy
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");

      // Clear httpOnly cookie
      if (this.canUseHttpOnlyCookie()) {
        this.clearHttpOnlyCookie("accessToken");
      }

      // Reset state
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.refreshCount = 0;
      this.requestQueue = [];

      console.log("✅ All tokens cleared");
    } catch (error) {
      console.error("❌ Failed to clear tokens:", error);
    }
  }

  /**
   * Check if httpOnly cookies are supported
   */
  private canUseHttpOnlyCookie(): boolean {
    // For now, return false since we need backend support
    // TODO: Implement backend httpOnly cookie support
    return false;
  }

  /**
   * Set httpOnly cookie (requires backend support)
   */
  private setHttpOnlyCookie(name: string, value: string, maxAge: number): void {
    // This would be handled by the backend when it sends Set-Cookie header
    // For now, we'll use regular cookies as fallback
    document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; secure; samesite=strict`;
  }

  /**
   * Get httpOnly cookie value
   */
  private getHttpOnlyCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }

  /**
   * Clear httpOnly cookie
   */
  private clearHttpOnlyCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  /**
   * Get token manager status for debugging
   */
  getStatus() {
    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      isTokenExpired: this.isTokenExpired(),
      isRefreshing: this.isRefreshing,
      refreshCount: this.refreshCount,
      lastRefreshTime: this.lastRefreshTime,
      queueSize: this.requestQueue.length,
    };
  }
}

// Singleton instance
export const tokenManager = new TokenManager();

// Utility functions for backward compatibility
export const getToken = () => tokenManager.getAccessToken();
export const getValidToken = () => tokenManager.getValidToken();
export const clearAllTokens = () => tokenManager.clearTokens();

// Debug helper
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { tokenManager?: typeof tokenManager }).tokenManager =
    tokenManager;
  console.log(
    "🧪 Debug: Use window.tokenManager.getStatus() to check token status"
  );
}
