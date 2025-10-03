import axios from "axios";
import {
  Equipment as Alat,
  Equipment,
  Record,
  Staff,
  LoginCredentials,
  RegisterData,
} from "../types";
import { AuthStorage } from "../utils/authStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_TIMEOUT = 30000;

// Simple refresh detection - sync with AuthContext using AuthStorage
let isRefreshing = false;

// Detect refresh from AuthStorage utility
if (typeof window !== "undefined") {
  isRefreshing = AuthStorage.isRefreshing();

  if (isRefreshing) {
    console.log(
      "🔄 API: Page refresh detected - blocking auto-logout for 5 seconds"
    );

    setTimeout(() => {
      isRefreshing = false;
      console.log("✅ API: Refresh protection period ended");
    }, 5000);
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple but effective response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors with refresh protection
    if (error.response?.status === 401) {
      console.log("🔍 401 response received");

      // Block auto-logout if currently refreshing
      if (isRefreshing) {
        console.log("🛡️ Blocking auto-logout - page is refreshing");
        return Promise.reject(error);
      }

      // Don't auto-logout, let components handle 401 errors
      console.log("⚠️ 401 error - letting component handle it");
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      console.log("✅ Logout API call successful");
    } catch (error) {
      console.error("❌ Logout API error:", error);
    }

    // Don't clear localStorage here - let AuthContext handle it
    // This prevents accidental data clearing during API errors
    console.log(
      "ℹ️ AuthService logout complete - localStorage managed by AuthContext"
    );
  },
  getProfile: async () => {
    return api.get("/auth/profile");
  },
  register: async (data: RegisterData) => {
    return api.post("/auth/register", data);
  },
};

export const alatService = {
  getAll: async () => {
    const response = await api.get<Alat[]>("/alat");
    return response;
  },
  getById: (id: string) => api.get<Alat>(`/alat/${id}`),
  create: (data: Partial<Alat>) => api.post<Alat>("/alat", data),
  update: (id: string, data: Partial<Alat>) =>
    api.put<Alat>(`/alat/${id}`, data),
  delete: (id: string) => api.delete(`/alat/${id}`),
  restore: (id: string) => api.patch(`/alat/${id}/restore`),
  updateMaintenance: (
    id: string,
    data: { isMaintenanceActive: boolean; maintenanceStatus?: string }
  ) => api.patch(`/alat/${id}/maintenance`, data),
};

export const recordService = {
  getAll: () => api.get<Record[]>("/record"),
  getById: (id: string) => api.get<Record>(`/record/${id}`),
  create: (data: Partial<Record>) => api.post<Record>("/record", data),
  update: (id: string, data: Partial<Record>) =>
    api.put<Record>(`/record/${id}`, data),
  delete: (id: string) => api.delete(`/record/${id}`),
};

export const staffService = {
  getAll: () => api.get<Staff[]>("/staff"),
  getById: (id: string) => api.get<Staff>(`/staff/${id}`),
  create: (data: Partial<Staff>) => api.post<Staff>("/staff", data),
  update: (id: string, data: Partial<Staff>) =>
    api.put<Staff>(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const usersService = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: {
    name: string;
    email: string;
    password: string;
    roleId: number;
  }) => api.post("/users", data),
  update: (
    id: string,
    data: Partial<{ name: string; email: string; roleId: number }>
  ) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.patch(`/users/${id}/restore`),
  changePassword: (
    id: string,
    data: {
      oldPassword: string;
      newPassword: string;
    }
  ) => api.patch(`/users/${id}/password`, data),
};

export const itemsService = {
  getAll: () => api.get("/items"),
  getById: (id: string) => api.get(`/items/${id}`),
  create: (data: unknown) => api.post("/items", data),
  update: (id: string, data: unknown) => api.put(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
};

export const emailService = {
  send: (data: { to: string; subject: string; text: string; html?: string }) =>
    api.post("/email/send", data),
  getTemplates: () => api.get("/email/templates"),
};

export const rolesService = {
  getAll: () => api.get("/roles"),
  getPermissions: (roleId: string) => api.get(`/roles/${roleId}/permissions`),
};

// Simple function to extend logout protection
export const extendLogoutProtection = (ms: number) => {
  console.log(`🛡️ Extending logout protection for ${ms}ms`);
  AuthStorage.extendRefreshProtection(ms);
  isRefreshing = true;
  setTimeout(() => {
    isRefreshing = false;
    console.log("✅ Extended logout protection period ended");
  }, ms);
};

export { api };

// Enhanced Services for better authentication
export const enhancedEquipmentService = {
  getAll: async () => {
    try {
      console.log("🔄 Enhanced Equipment: Fetching all equipment...");
      const response = await alatService.getAll();
      console.log(
        "✅ Enhanced Equipment: Success!",
        response.data?.length || 0,
        "items"
      );
      return response;
    } catch (error) {
      console.error("❌ Enhanced Equipment: Error:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    return alatService.getById(id);
  },

  create: async (data: unknown) => {
    return alatService.create(data as Partial<Equipment>);
  },

  update: async (id: string, data: unknown) => {
    return alatService.update(id, data as Partial<Equipment>);
  },

  delete: async (id: string) => {
    return alatService.delete(id);
  },

  stopMaintenance: async (id: string) => {
    try {
      console.log(`🛑 Enhanced Equipment: Stopping maintenance for ${id}...`);
      const response = await api.post(`/alat/${id}/stop-maintenance`);
      console.log("✅ Enhanced Equipment: Successfully stopped maintenance");
      return response;
    } catch (error) {
      console.error("❌ Enhanced Equipment: Stop maintenance error:", error);
      throw error;
    }
  },

  completeMaintenance: async (id: string) => {
    try {
      console.log(`✅ Enhanced Equipment: Completing maintenance for ${id}...`);
      const response = await api.post(`/alat/${id}/complete-maintenance`);
      console.log("✅ Enhanced Equipment: Successfully completed maintenance");
      return response;
    } catch (error) {
      console.error(
        "❌ Enhanced Equipment: Complete maintenance error:",
        error
      );
      throw error;
    }
  },

  updateMaintenanceSettings: async (
    id: string,
    data: {
      maintenanceDate?: string;
      maintenanceInterval?: number;
      isMaintenanceActive?: boolean;
    }
  ) => {
    try {
      console.log(
        `🔧 Enhanced Equipment: Updating maintenance settings for ${id}...`
      );
      const response = await api.put(`/alat/${id}/maintenance`, data);
      console.log("✅ Enhanced Equipment: Successfully updated maintenance");
      return response;
    } catch (error) {
      console.error("❌ Enhanced Equipment: Update maintenance error:", error);
      throw error;
    }
  },
};

export const enhancedStaffService = {
  getAll: async () => {
    try {
      console.log("🔄 Enhanced Staff: Fetching all staff...");
      const response = await staffService.getAll();
      console.log(
        "✅ Enhanced Staff: Success!",
        response.data?.length || 0,
        "staff members"
      );
      return response;
    } catch (error) {
      console.error("❌ Enhanced Staff: Error:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    return staffService.getById(id);
  },

  create: async (data: unknown) => {
    return staffService.create(data as Partial<Staff>);
  },

  update: async (id: string, data: unknown) => {
    return staffService.update(id, data as Partial<Staff>);
  },

  delete: async (id: string) => {
    return staffService.delete(id);
  },
};

export default api;
