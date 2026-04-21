import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { EnhancedAuthStorage } from "../utils/enhancedAuthStorage";
import { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

interface QueuedRequest {
  resolve: (config: AxiosRequestConfig) => void;
  reject: (error: Error) => void;
  config: AxiosRequestConfig;
}

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
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = EnhancedAuthStorage.getValidToken();

          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }

          if (config.baseURL?.includes("localhost")) {
            config.baseURL = config.baseURL.replace("127.0.0.1", "localhost");
          }

          return config;
        } catch (error) {
          console.error("❌ Failed to get valid token for request:", error);

          return config;
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = EnhancedAuthStorage.getValidToken();

            if (newToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error(
              "❌ Token refresh failed in response interceptor:",
              refreshError
            );

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
    if (window.location.pathname === "/login") return;

    window.history.pushState({}, "", "/login");

    window.dispatchEvent(new PopStateEvent("popstate"));
  }

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

  getInstance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getInstance();

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiService.post<AuthResponse>(
      "/auth/login",
      credentials
    );

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
      const expiresIn = response.data.expiresIn || 86400;

      EnhancedAuthStorage.saveAuthData(token, userData as User, expiresIn);
    }

    return response;
  },

  logout: async () => {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("❌ Logout API call failed:", error);
    } finally {
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

export const recordService = {
  getAll: () => apiService.get("/record"),
  getById: (id: string) => apiService.get(`/record/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/record", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/record/${id}`, data),
  delete: (id: string) => apiService.delete(`/record/${id}`),
};

export const staffService = {
  getAll: () => apiService.get("/staff"),
  getById: (id: string) => apiService.get(`/staff/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/staff", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/staff/${id}`, data),
  delete: (id: string) => apiService.delete(`/staff/${id}`),
};

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

export const itemsService = {
  getAll: () => apiService.get("/items"),
  getById: (id: string) => apiService.get(`/items/${id}`),
  create: (data: Record<string, unknown>) => apiService.post("/items", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiService.put(`/items/${id}`, data),
  delete: (id: string) => apiService.delete(`/items/${id}`),
};
export const emailService = {
  send: (data: Record<string, unknown>) => apiService.post("/email/send", data),
  getTemplates: () => apiService.get("/email/templates"),
};

export const rolesService = {
  getAll: () => apiService.get("/roles"),
  getPermissions: (roleId: string) =>
    apiService.get(`/roles/${roleId}/permissions`),
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { apiService?: typeof apiService }).apiService =
    apiService;
}
