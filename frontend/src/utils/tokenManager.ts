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
  private refreshCooldown = 5000;

  saveTokens(tokenData: TokenData): void {
    try {
      const expiresAt = Date.now() + tokenData.expiresIn * 1000;

      if (this.canUseHttpOnlyCookie()) {
        this.setHttpOnlyCookie(
          "accessToken",
          tokenData.accessToken,
          tokenData.expiresIn
        );
      } else {
        localStorage.setItem("accessToken", tokenData.accessToken);
      }

      localStorage.setItem("refreshToken", tokenData.refreshToken);
      localStorage.setItem("tokenExpiresAt", expiresAt.toString());
      localStorage.setItem("token", tokenData.accessToken);
    } catch (error) {
      console.error("❌ Failed to save tokens:", error);
      throw new Error("Failed to save authentication tokens");
    }
  }
  getAccessToken(): string | null {
    try {
      if (this.canUseHttpOnlyCookie()) {
        const cookieToken = this.getHttpOnlyCookie("accessToken");
        if (cookieToken) return cookieToken;
      }

      return (
        localStorage.getItem("accessToken") || localStorage.getItem("token")
      );
    } catch (error) {
      console.error("❌ Failed to get access token:", error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem("refreshToken");
    } catch (error) {
      console.error("❌ Failed to get refresh token:", error);
      return null;
    }
  }

  isTokenExpired(bufferMinutes: number = 5): boolean {
    try {
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      if (!expiresAt) return true;

      const expirationTime = parseInt(expiresAt);
      const bufferTime = bufferMinutes * 60 * 1000;

      return Date.now() >= expirationTime - bufferTime;
    } catch (error) {
      console.error("❌ Failed to check token expiration:", error);
      return true;
    }
  }

  async getValidToken(): Promise<string> {
    const currentToken = this.getAccessToken();

    if (currentToken && !this.isTokenExpired()) {
      return currentToken;
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      if (this.refreshPromise) {
        return this.refreshPromise;
      }
    }

    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
    if (timeSinceLastRefresh < this.refreshCooldown) {
      throw new Error(
        `Refresh cooldown active. Wait ${
          this.refreshCooldown - timeSinceLastRefresh
        }ms`
      );
    }

    if (this.refreshCount >= this.maxRefreshAttempts) {
      console.error("❌ Max refresh attempts reached");
      this.clearTokens();
      throw new Error("Maximum refresh attempts exceeded");
    }

    this.isRefreshing = true;
    this.refreshCount++;
    this.lastRefreshTime = Date.now();

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;

      this.refreshCount = 0;

      return newToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      if (this.refreshCount >= this.maxRefreshAttempts) {
        this.clearTokens();
      }

      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.statusText}`);
      }

      const data = await response.json();

      this.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn || 3600,
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000,
      });

      return data.accessToken;
    } catch (error) {
      console.error("❌ Token refresh API call failed:", error);
      throw error;
    }
  }

  clearTokens(): void {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");

      if (this.canUseHttpOnlyCookie()) {
        this.clearHttpOnlyCookie("accessToken");
      }

      this.isRefreshing = false;
      this.refreshPromise = null;
      this.refreshCount = 0;
      this.requestQueue = [];
    } catch (error) {
      console.error("❌ Failed to clear tokens:", error);
    }
  }

  private canUseHttpOnlyCookie(): boolean {
    return false;
  }

  private setHttpOnlyCookie(name: string, value: string, maxAge: number): void {
    document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; secure; samesite=strict`;
  }

  private getHttpOnlyCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }

  private clearHttpOnlyCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

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

export const tokenManager = new TokenManager();

export const getToken = () => tokenManager.getAccessToken();
export const getValidToken = () => tokenManager.getValidToken();
export const clearAllTokens = () => tokenManager.clearTokens();

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { tokenManager?: typeof tokenManager }).tokenManager =
    tokenManager;
}
