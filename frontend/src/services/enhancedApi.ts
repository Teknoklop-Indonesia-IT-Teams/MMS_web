/**
 * Enhanced API Service with Robust Authentication
 * Fixes logout on refresh issues with:
 * 1. Enhanced Auth Storage integration
 * 2. Proper token management
 * 3. Better error handling
 * 4. Consistent domain/port handling
 */

import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { EnhancedAuthStorage } from "../utils/enhancedAuthStorage";
import { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

// Request queue for handling requests during token refresh
interface QueuedRequest {
  resolve: (config: AxiosRequestConfig) => void;
  reject: (error: Error) => void;
  config: AxiosRequestConfig;
}

// Auth response types
interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: unknown;
}

class ApiService {
  private isRefreshing = false;
  private requestQueue: QueuedRequest[] = [];
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: Number(API_TIMEOUT),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        try {
          // Get valid token using enhanced storage
          const token = EnhancedAuthStorage.getValidToken();

          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Ensure consistent domain/port
          if (config.baseURL?.includes("localhost")) {
            config.baseURL = config.baseURL.replace("127.0.0.1", "localhost");
          }

          return config;
        } catch (error) {
          console.error("❌ Failed to get valid token for request:", error);

          // If token retrieval fails, proceed without token
          // Let the response interceptor handle 401
          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          // Mark this request as retried to prevent infinite loop
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newToken = EnhancedAuthStorage.getValidToken();

            if (newToken) {
              // Update the authorization header
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Retry the original request
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error(
              "❌ Token refresh failed in response interceptor:",
              refreshError
            );

            // If refresh fails, clear tokens and redirect to login
            EnhancedAuthStorage.clearAuthData();
            this.redirectToLogin();

            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private redirectToLogin() {
    // Check if we're already on login page
    if (window.location.pathname === "/login") return;

    // Use history API to avoid refresh
    window.history.pushState({}, "", "/login");

    // Dispatch custom event for React Router to pick up
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Public API methods
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Get the underlying axios instance for advanced usage
  getInstance() {
    return this.api;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export the axios instance for backward compatibility
export const api = apiService.getInstance();

// Enhanced Auth Service
export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiService.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    // Save tokens using enhanced storage
    if (response.data && (response.data.token || response.data.accessToken)) {
      const token = response.data.token || response.data.accessToken || "";
      const userData = response.data.user || {
        id: 0,
        nama: "Unknown",
        email: "",
        role: "user",
        username: "",
        petugas: "Unknown",
      };
      const expiresIn = response.data.expiresIn || 86400; // 24 hours default

      EnhancedAuthStorage.saveAuthData(token, userData as User, expiresIn);
    }

    return response;
  },

  logout: async () => {
    try {
      // Call logout endpoint
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("❌ Logout API call failed:", error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local tokens
      EnhancedAuthStorage.clearAuthData();
    }
  },

  refreshToken: async () => {
    return EnhancedAuthStorage.getValidToken();
  },

  getProfile: async () => {
    return apiService.get("/auth/profile");
  },

  register: async (data: Record<string, unknown>) => {
    return apiService.post("/auth/register", data);
  },
};

// Equipment/Alat Service
export const alatService = {
  getAll: () => apiService.get("/alat"),
  getById: (id: string) => apiService.get(`/alat/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/alat", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/alat/${id}`, data),
  delete: (id: string) => apiService.delete(`/alat/${id}`),
  restore: (id: string) => apiService.patch(`/alat/${id}/restore`),
  updateMaintenance: (id: string, data: Record<string, unknown>) =>
    apiService.patch(`/alat/${id}/maintenance`, data),
};

// Record Service
export const recordService = {
  getAll: () => apiService.get("/record"),
  getById: (id: string) => apiService.get(`/record/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/record", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/record/${id}`, data),
  delete: (id: string) => apiService.delete(`/record/${id}`),
};

// Staff Service
export const staffService = {
  getAll: () => apiService.get("/staff"),
  getById: (id: string) => apiService.get(`/staff/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/staff", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/staff/${id}`, data),
  delete: (id: string) => apiService.delete(`/staff/${id}`),
};

// Users Service
export const usersService = {
  getAll: () => apiService.get("/users"),
  getById: (id: string) => apiService.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/users", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/users/${id}`, data),
  delete: (id: string) => apiService.delete(`/users/${id}`),
  restore: (id: string) => apiService.patch(`/users/${id}/restore`),
  changePassword: (id: string, data: Record<string, unknown>) =>
    apiService.patch(`/users/${id}/password`, data),
};

// Items Service
export const itemsService = {
  getAll: () => apiService.get("/items"),
  getById: (id: string) => apiService.get(`/items/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/items", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/items/${id}`, data),
  delete: (id: string) => apiService.delete(`/items/${id}`),
};

// Email Service
export const emailService = {
  send: (data: Record<string, unknown>) => apiService.post("/email/send", data),
  getTemplates: () => apiService.get("/email/templates"),
};

// Roles Service
export const rolesService = {
  getAll: () => apiService.get("/roles"),
  getPermissions: (roleId: string) =>
    apiService.get(`/roles/${roleId}/permissions`),
};

// Debug helper for development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { apiService?: typeof apiService }).apiService =
    apiService;
  console.log("🧪 Debug: Use window.apiService to inspect API service");
}
