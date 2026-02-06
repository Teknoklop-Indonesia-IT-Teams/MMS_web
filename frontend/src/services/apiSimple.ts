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

const API_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = 30000;

// Simple refresh detection - sync with AuthContext using AuthStorage
let isRefreshing = false;

// Detect refresh from AuthStorage utility
if (typeof window !== "undefined") {
  isRefreshing = AuthStorage.isRefreshing();

  if (isRefreshing) {
    setTimeout(() => {
      isRefreshing = false;
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
  },
);

// Simple but effective response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors with refresh protection
    if (error.response?.status === 401) {
      // Block auto-logout if currently refreshing
      if (isRefreshing) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("❌ Logout API error:", error);
    }
  },
  getProfile: async () => {
    return api.get("/auth/profile");
  },
  updateProfile: (data: {
    email: string;
    nama: string;
    username: string;
    telp: string;
    role?: string;
  }) => api.patch("/auth/profile", data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.patch(`/auth/password`, data),
  register: async (data: RegisterData) => {
    return api.post("/auth/register", data);
  },
};

export const alatService = {
  getAll: async () => {
    const response = await api.get<Alat[]>("/alat");
    return response;
  },
  getAlatById: (id: string) =>
    api.get<{ success: boolean; data: Equipment }>(`/alat/public/${id}`),
  getById: (id: string) => api.get<Alat>(`/alat/${id}`),
  create: (data: Partial<Alat> | FormData) => {
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };
    return api.post<Alat>("/alat", data, { headers, timeout: 60000 });
  },
  update: (id: string, data: Partial<Alat> | FormData) => {
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };
    return api.put<Alat>(`/alat/${id}`, data, { headers, timeout: 60000 });
  },
  delete: (id: string) => api.delete(`/alat/${id}`),
  restore: (id: string) => api.patch(`/alat/${id}/restore`),
  updateMaintenance: (
    id: string,
    data: { isMaintenanceActive: boolean; maintenanceStatus?: string },
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
    data: Partial<{ name: string; email: string; roleId: number }>,
  ) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.patch(`/users/${id}/restore`),
  changePassword: (
    id: string,
    data: {
      oldPassword: string;
      newPassword: string;
    },
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
  AuthStorage.extendRefreshProtection(ms);
  isRefreshing = true;
  setTimeout(() => {
    isRefreshing = false;
  }, ms);
};

export { api };

// Enhanced Services for better authentication
export const enhancedEquipmentService = {
  getAll: async () => {
    try {
      const response = await alatService.getAll();
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
      const response = await api.post(`/alat/${id}/stop-maintenance`);
      return response;
    } catch (error) {
      console.error("❌ Enhanced Equipment: Stop maintenance error:", error);
      throw error;
    }
  },

  completeMaintenance: async (id: string) => {
    try {
      const response = await api.post(`/alat/${id}/complete-maintenance`);
      return response;
    } catch (error) {
      console.error(
        "❌ Enhanced Equipment: Complete maintenance error:",
        error,
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
    },
  ) => {
    try {
      const response = await api.put(`/alat/${id}/maintenance`, data);
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
      const response = await staffService.getAll();
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

const getImageSrc = (img?: string | null) => {
  if (!img) return null;
  if (img.startsWith("data:")) return img; // already a data URI (records)
  return `${import.meta.env.VITE_URL}/uploads/${img}`;
};

export default api;
