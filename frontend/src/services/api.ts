import axios from "axios";
import {
  Equipment as Alat,
  PreRecord,
  CorRecord,
  Staff,
  LoginCredentials,
  RegisterData,
  Equipment,
} from "../types";
import { isAppStillInitializing } from "../utils/authUtils";
import { AppStateManager } from "../utils/appState";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

let isNavigating = true; 
let navigationStartTime = Date.now(); 
let refreshCount = 1; 
let lastRefreshTime = Date.now(); 
let rapidRefreshProtection = false;
const pageLoadTime = Date.now();

let isPageVisible = true;
let lastVisibilityChange = Date.now();
let totalRefreshAttempts = 1;

if (typeof window !== "undefined" && window.sessionStorage) {
  const sessionKey = "mms-navigation-state";
  const lastPageLoad = sessionStorage.getItem(sessionKey);
  const currentTime = Date.now();

  if (lastPageLoad) {
    const timeSinceLastLoad = currentTime - parseInt(lastPageLoad);
    if (timeSinceLastLoad < 5000) {
      isNavigating = true;
      rapidRefreshProtection = true;
      totalRefreshAttempts += 10;

      setTimeout(() => {
        if (Date.now() - navigationStartTime > 60000) {
          isNavigating = false;
          rapidRefreshProtection = false;
        }
      }, 60000);
    }
  }

  sessionStorage.setItem(sessionKey, currentTime.toString());
}

setTimeout(() => {
  if (
    isNavigating &&
    !rapidRefreshProtection &&
    Date.now() - navigationStartTime > 15000
  ) {
    isNavigating = false;
  }
}, 15000);

class RefreshProtectionManager {
  private refreshTimes: number[] = [];
  private readonly MAX_REFRESHES = 2; 
  private readonly TIME_WINDOW = 10000; 
  private readonly LOCKOUT_DURATION = 30000; 
  private isLocked = false;

  recordRefresh(): boolean {
    const now = Date.now();

    this.refreshTimes = this.refreshTimes.filter(
      (time) => now - time < this.TIME_WINDOW,
    );

    this.refreshTimes.push(now);
    if (this.refreshTimes.length > this.MAX_REFRESHES) {
      this.activateLockout();
      return false;
    }

    return true;
  }

  private activateLockout(): void {
    if (this.isLocked) return;

    this.isLocked = true;
    rapidRefreshProtection = true;

    setTimeout(() => {
      this.isLocked = false;
      rapidRefreshProtection = false;
      this.refreshTimes = [];
    }, this.LOCKOUT_DURATION);
  }

  isBlocked(): boolean {
    return this.isLocked;
  }

  reset(): void {
    this.refreshTimes = [];
    this.isLocked = false;
    rapidRefreshProtection = false;
  }
}

const refreshProtectionManager = new RefreshProtectionManager();

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    lastVisibilityChange = Date.now();
    isPageVisible = !document.hidden;

    if (isPageVisible) {
      const timeSinceLastVisibility = Date.now() - lastVisibilityChange;
      if (timeSinceLastVisibility < 1000) {
        activateNavigationShield("visibility-change");
      }
    }
  });

  if (window.performance) {
    const navigationEntries = performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      if (navEntry.type === "reload") {
        totalRefreshAttempts++;
        isNavigating = true;
        navigationStartTime = Date.now();
        refreshCount++;
        lastRefreshTime = Date.now();
      }
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const loadTime = Date.now() - pageLoadTime;
    if (loadTime < 2000) {
      activateNavigationShield("fast-load");
    }
  });

  const activateNavigationShield = (eventType: string) => {
    totalRefreshAttempts++;

    if (!refreshProtectionManager.recordRefresh()) {
      isNavigating = true;
      navigationStartTime = Date.now();
      rapidRefreshProtection = true;

      setTimeout(() => {
        if (Date.now() - navigationStartTime > 45000) {
          isNavigating = false;
        }
      }, 45000);

      return;
    }

    isNavigating = true;
    navigationStartTime = Date.now();
    refreshCount++;
    lastRefreshTime = Date.now();
    rapidRefreshProtection = refreshProtectionManager.isBlocked();
  };

  window.addEventListener("beforeunload", () =>
    activateNavigationShield("beforeunload"),
  );
  window.addEventListener("unload", () => activateNavigationShield("unload"));
  window.addEventListener("pagehide", () =>
    activateNavigationShield("pagehide"),
  );

  window.addEventListener("load", () => {
    activateNavigationShield("load");

    setTimeout(() => {
      const now = Date.now();
      const timeSinceRefresh = now - lastRefreshTime;

      if (timeSinceRefresh > 10000) {
        isNavigating = false;
      } else {
        setTimeout(() => {
          isNavigating = false;
        }, 20000);
      }
    }, 10000);
  });

  window.addEventListener("keydown", (e) => {
    if (
      e.key === "F5" ||
      (e.ctrlKey && e.key === "r") ||
      (e.metaKey && e.key === "r")
    ) {
      activateNavigationShield("keyboard-refresh");
    }
  });
}

const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: Number(API_TIMEOUT),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

class OptimisticLockingManager {
  private operationLocks = new Map<string, number>();
  private operationQueue = new Map<string, Promise<unknown>>();
  private readonly LOCK_TIMEOUT = 30000;

  async executeWithLock<T>(
    operationKey: string,
    operation: () => Promise<T>,
    retryCount = 3,
  ): Promise<T> {
    const now = Date.now();
    if (this.operationQueue.has(operationKey)) {
      return this.operationQueue.get(operationKey) as Promise<T>;
    }

    const lastLock = this.operationLocks.get(operationKey);
    if (lastLock && now - lastLock < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.operationLocks.set(operationKey, now);

    const operationPromise = this.executeWithRetry(
      operation,
      retryCount,
      operationKey,
    );
    this.operationQueue.set(operationKey, operationPromise);

    try {
      const result = await operationPromise;
      return result;
    } finally {
      this.operationQueue.delete(operationKey);
      setTimeout(() => {
        if (this.operationLocks.get(operationKey) === now) {
          this.operationLocks.delete(operationKey);
        }
      }, 2000);
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount: number,
    operationKey: string,
  ): Promise<T> {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(
          `❌ Attempt ${attempt} failed for ${operationKey}:`,
          errorMessage,
        );

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 401) {
            throw error;
          }
        }

        if (attempt === retryCount) {
          throw error;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      `Operation failed after ${retryCount} attempts: ${operationKey}`,
    );
  }

  clearLock(operationKey: string): void {
    this.operationLocks.delete(operationKey);
    this.operationQueue.delete(operationKey);
  }

  clearAllLocks(): void {
    this.operationLocks.clear();
    this.operationQueue.clear();
  }
}

const optimisticLockManager = new OptimisticLockingManager();

class LogoutManager {
  private isLoggingOut = false;
  private logoutTimeoutId: NodeJS.Timeout | null = null;
  private lastLogoutAttempt = 0;
  private logout401Count = 0;
  private requestCount = 0;
  private lastRequestTime = 0;
  private initializationEndTime = Date.now() + 60000;
  private onLogoutCallback?: () => void;

  private readonly DEBOUNCE_TIME = 30000; 
  private readonly MAX_401_COUNT = 20; 
  private readonly RACE_CONDITION_WINDOW = 15000;

  setLogoutCallback(callback: () => void): void {
    this.onLogoutCallback = callback;
  }

  canLogout(): boolean {
    const now = Date.now();
    this.logout401Count++;
    this.requestCount++;

    if (isNavigating) {
      return false;
    }

    if (rapidRefreshProtection || refreshProtectionManager.isBlocked()) {
      return false;
    }

    if (refreshCount > 0 && now - lastRefreshTime < 20000) {
      return false;
    }

    if (now < this.initializationEndTime) {
      return false;
    }

    if (this.isLoggingOut) {
      return false;
    }

    if (this.requestCount > 50 && now - this.lastRequestTime < 500) {
      return false;
    }

    if (
      this.logout401Count > 10 &&
      now - this.lastLogoutAttempt < this.RACE_CONDITION_WINDOW
    ) {
      return false;
    }

    if (now - this.lastLogoutAttempt < this.DEBOUNCE_TIME) {
      return false;
    }

    this.lastLogoutAttempt = now;
    this.lastRequestTime = now;
    return true;
  }

  performLogout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    try {
      optimisticLockManager.clearAllLocks();
      refreshProtectionManager.reset();
    } catch (error) {
      console.log("⚠️ Error clearing protections during logout:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    if (this.onLogoutCallback) {
      this.onLogoutCallback();
      this.reset();
      return;
    }

    if (this.logoutTimeoutId) {
      clearTimeout(this.logoutTimeoutId);
    }

    this.logoutTimeoutId = setTimeout(() => {
      this.reset();
      window.location.href = "/login";
    }, 1500);
  }

  reset(): void {
    this.isLoggingOut = false;
    this.logout401Count = 0;
    this.requestCount = 0;
  }

  onSuccessfulResponse(): void {
    this.logout401Count = 0;
  }

  extendInitialization(additionalMs: number): void {
    const newEndTime = Date.now() + additionalMs;
    if (newEndTime > this.initializationEndTime) {
      this.initializationEndTime = newEndTime;
    }
  }
}

const logoutManager = new LogoutManager();

export const setupLogoutCallback = (callback: () => void) => {
  logoutManager.setLogoutCallback(callback);
};

export const extendLogoutProtection = (ms: number) => {
  logoutManager.extendInitialization(ms);
};

api.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      logoutManager.onSuccessfulResponse();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const stillInitializing = isAppStillInitializing();
      const currentPath = window.location.pathname;
      const hasToken = localStorage.getItem("token");
      const inCriticalOperation = AppStateManager.isInCriticalOperation();

      if (stillInitializing) {
        return Promise.reject(error);
      }

      if (currentPath === "/login" || currentPath.includes("/login")) {
        return Promise.reject(error);
      }

      if (inCriticalOperation) {
        return Promise.reject(error);
      }
      if (isNavigating) {
        return Promise.reject(error);
      }

      if (rapidRefreshProtection) {
        return Promise.reject(error);
      }

      const timeSincePageLoad = Date.now() - pageLoadTime;
      if (timeSincePageLoad < 30000) {
        return Promise.reject(error);
      }

      if (!hasToken) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const alatService = {
  getAll: async () => {
    AppStateManager.startCriticalOperation("Equipment fetch");
    try {
      const response = await api.get<Alat[]>(`/alat?_v=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      return { data: response.data || [] };
    } finally {
      AppStateManager.endCriticalOperation();
    }
  },

  getById: (id: string) => {
    AppStateManager.startCriticalOperation(`Equipment getById ${id}`);
    return api
      .get<Alat>(`/alat/${id}`)
      .finally(() => AppStateManager.endCriticalOperation());
  },

  getWithMaintenanceStatus: (id: number) => {
    AppStateManager.startCriticalOperation(
      `Equipment maintenance status ${id}`,
    );
    return api
      .get<Equipment>(`/alat/${id}/maintenance-status`)
      .finally(() => AppStateManager.endCriticalOperation());
  },

  create: (data: FormData | Omit<Alat, "id">) => {
    AppStateManager.startCriticalOperation("Equipment create");
    const operationKey = `create-alat-${Date.now()}`;

    const config = data instanceof FormData
      ? { headers: { "Content-Type": false as unknown as string } }
      : {};

    return optimisticLockManager
      .executeWithLock(operationKey, () =>
        api.post<Alat>("/alat", data, config),
      )
      .finally(() => AppStateManager.endCriticalOperation());
  },

  update: (id: string, data: FormData | Partial<Alat>) => {
    AppStateManager.startCriticalOperation(`Equipment update ${id}`);
    const operationKey = `update-alat-${id}`;

    if (data instanceof FormData) {
      console.log("📤 Sending FormData:", [...data.entries()]);
    } else {
      console.log("📤 Sending JSON:", data);
    }

    const config = data instanceof FormData
      ? { headers: { "Content-Type": false as unknown as string } }
      : {};

    return optimisticLockManager
      .executeWithLock(operationKey, () =>
        api.put<Alat>(`/alat/${id}`, data, config),
      )
      .finally(() => AppStateManager.endCriticalOperation());
  },

  delete: (id: string) => {
    AppStateManager.startCriticalOperation(`Equipment delete ${id}`);
    const operationKey = `delete-alat-${id}`;
    return optimisticLockManager
      .executeWithLock(operationKey, () => api.delete(`/alat/${id}`))
      .finally(() => AppStateManager.endCriticalOperation());
  },

  stopMaintenance: (id: string) => {
    const operationKey = `stop-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.post(`/alat/${id}/stop-maintenance`),
    );
  },

  completeMaintenance: (id: string) => {
    const operationKey = `complete-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.post(`/alat/${id}/complete-maintenance`),
    );
  },

  updateMaintenanceSettings: (
    id: string,
    data: {
      maintenanceDate?: string;
      maintenanceInterval?: number;
      isMaintenanceActive?: boolean;
    },
  ) => {
    const operationKey = `update-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.put(`/alat/${id}/maintenance`, data),
    );
  },

  addMaintenanceActivity: (id: string, data: FormData) => {
    AppStateManager.startCriticalOperation(`add-maintenance-activity-${id}`);
    const operationKey = `maintenance-activity-${id}-${Date.now()}`;

    return optimisticLockManager
      .executeWithLock(operationKey, () =>
        api.post(`/alat/${id}/maintenance-activity`, data),
      )
      .finally(() => AppStateManager.endCriticalOperation());
  },
};


export const recordService = {
  getAll: () => api.get<PreRecord[]>("/record"),
  getById: (id: string) => api.get<PreRecord>(`/record/${id}`),
  getByEquipmentId: (equipmentId: number) =>
    api.get<PreRecord[]>(`/record/equipment/${equipmentId}`),
  create: (data: Omit<PreRecord, "id"> | FormData) => {
    AppStateManager.startCriticalOperation("Create record");

    const isFormData = data instanceof FormData;

    const config = isFormData
      ? {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data: FormData) => data],
        timeout: 60000,
      }
      : {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      };

    return api
      .post<PreRecord>("/record", data, config)
      .finally(() => AppStateManager.endCriticalOperation());
  },
  update: (id: string, data: Partial<PreRecord> | FormData) => {
    AppStateManager.startCriticalOperation("Update record");
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": undefined }, transformRequest: [(d: FormData) => d], timeout: 60000 }
      : { headers: { "Content-Type": "application/json" }, timeout: 60000 };
    return api
      .put<PreRecord>(`/record/${id}`, data, config)
      .finally(() => AppStateManager.endCriticalOperation());
  },
  delete: (id: number) => {
    AppStateManager.startCriticalOperation("Delete record");
    return api
      .delete(`/record/${id}`)
      .finally(() => AppStateManager.endCriticalOperation());
  },
};


export const recordCorrectiveService = {
  getAll: () => api.get<CorRecord[]>("/record/corrective"),
  getById: (id: string) => api.get<CorRecord>(`/record/corrective/${id}`),
  getByEquipmentId: (equipmentId: number) =>
    api.get<CorRecord[]>(`/record/corrective/equipment/${equipmentId}`),

  create: (data: Omit<CorRecord, "id"> | FormData) => {
    AppStateManager.startCriticalOperation("Create corrective record");

    const isFormData = data instanceof FormData;
    const config = isFormData
      ? {
        headers: { "Content-Type": undefined },
        transformRequest: [(data: FormData) => data],
        timeout: 60000,
      }
      : {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      };

    return api
      .post<CorRecord>("/record/corrective", data, config)
      .finally(() => AppStateManager.endCriticalOperation());
  },

  update: (id: string, data: Partial<CorRecord> | FormData) => {
    AppStateManager.startCriticalOperation("Update corrective record");
    const isFormData = data instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": undefined }, transformRequest: [(d: FormData) => d], timeout: 60000 }
      : { headers: { "Content-Type": "application/json" }, timeout: 60000 };
    return api
      .put<CorRecord>(`/record/corrective/${id}`, data, config)
      .finally(() => AppStateManager.endCriticalOperation());
  },

  delete: (id: number) => {
    AppStateManager.startCriticalOperation("Delete corrective record");
    return api
      .delete(`/record/corrective/${id}`)
      .finally(() => AppStateManager.endCriticalOperation());
  },
};

export const staffService = {
  getAll: async () => {
    try {
      const response = await api.get<Staff[]>("/staff");
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Staff API: Axios error details:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw error;
    }
  },
  getById: (id: string) => api.get<Staff>(`/staff/${id}`),
  create: (data: { nama: string; email?: string }) => {
    return api.post<Staff>("/staff", data);
  },
  update: (id: string, data: { nama: string; email?: string }) => {
    return api.put<Staff>(`/staff/${id}`, data);
  },
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const authService = {
  login: (data: LoginCredentials) => {
    AppStateManager.startCriticalOperation("User login");
    return api
      .post<{ token: string; user: Staff }>("/auth/login", data)
      .finally(() => AppStateManager.endCriticalOperation());
  },
  register: (data: RegisterData) => {
    AppStateManager.startCriticalOperation("User registration");
    return api
      .post<{ message: string }>("/auth/register", data)
      .finally(() => AppStateManager.endCriticalOperation());
  },
};


export const telemetryService = {
  getAll: async () => {
    const res = await api.get<{ id: number; jenis_telemetry: string }[]>("/telemetry");
    if (!Array.isArray(res.data)) return [];
    return res.data.map((d) => ({ id: d.id, name: d.jenis_telemetry }));
  },

  create: async (name: string) => {
    const res = await api.post("/telemetry", { jenis_telemetry: name });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/telemetry/${id}`);
    return res.data;
  },
};


export const publicAlatService = {
  getByClient: async (namaClient: string) => {
    const encoded = encodeURIComponent(namaClient);
    const res = await api.get<{
      success: boolean;
      client: string;
      data: Equipment[];
    }>(`/alat/public/by-client/${encoded}`);
    return res.data;
  },
};

export const clientService = {
  getAll: async () => {
    const res = await api.get<{ id: number; nama_client: string }[]>("/client");
    if (!Array.isArray(res.data)) return [];
    return res.data.map((d) => ({ id: d.id, name: d.nama_client }));
  },

  create: async (name: string) => {
    const res = await api.post("/client", { nama_client: name });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/client/${id}`);
    return res.data;
  },
};

export interface Item {
  itemId: number;
  title: string;
  content: string;
  image?: string;
  createdBy: number;
  createdDtm: string;
  updatedBy?: number;
  updatedDtm?: string;
  isDeleted: number;
  createdByName?: string;
  updatedByName?: string;
}

export const itemsService = {
  getAll: () => api.get<Item[]>("/items"),
  getById: (id: string) => api.get<Item>(`/items/${id}`),
  create: (data: FormData) =>
    api.post<Item>("/items", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id: string, data: FormData) =>
    api.put<Item>(`/items/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  delete: (id: string) => api.delete(`/items/${id}`),
  restore: (id: string) => api.patch(`/items/${id}/restore`),
};

export interface Role {
  roleId: number;
  roleName: string;
}

export const rolesService = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: Role[] }>("/roles");
    return res.data.data;
  },
  getById: (id: string) => api.get<Role>(`/roles/${id}`),
  create: (data: Omit<Role, "roleId">) => api.post<Role>("/roles", data),
  update: (id: string, data: Partial<Role>) =>
    api.put<Role>(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

export interface User {
  id: number;
  email: string;
  nama: string;
  username: string;
  telp: string;
  role: string;
  isDeleted: number;
  createdDtm: string;
  updatedDtm?: string;
}

export const usersService = {
  getAll: () => api.get<User[]>("/users"),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
    roleId: number;
  }) => api.post<User>("/users", data),
  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.patch(`/users/${id}/restore`),
};

export const RaceConditionUtils = {
  clearAllProtections: () => {
    optimisticLockManager.clearAllLocks();
    refreshProtectionManager.reset();

    isNavigating = false;
    refreshCount = 0;
    lastRefreshTime = 0;
    rapidRefreshProtection = false;
  },

  clearOperationLock: (operationKey: string) => {
    optimisticLockManager.clearLock(operationKey);
  },
  getProtectionStatus: () => {
    const timeSincePageLoad = Date.now() - pageLoadTime;
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;

    return {
      isNavigating,
      refreshCount,
      rapidRefreshProtection,
      isRefreshBlocked: refreshProtectionManager.isBlocked(),
      lastRefreshTime,
      timeSinceLastRefresh,
      timeSincePageLoad,
      totalRefreshAttempts,
      isPageVisible,
      protectionLevel:
        timeSincePageLoad < 30000
          ? "HIGH"
          : isNavigating
            ? "MEDIUM"
            : rapidRefreshProtection
              ? "HIGH"
              : "LOW",
    };
  },

  forceActivateProtection: (reason: string) => {
    isNavigating = true;
    rapidRefreshProtection = true;
    navigationStartTime = Date.now();
    lastRefreshTime = Date.now();
  },

  simulateFastRefresh: async () => {
    isNavigating = true;
    refreshCount = 5;
    lastRefreshTime = Date.now() - 1000;
    rapidRefreshProtection = true;
    try {
      const response = await api.get("/api/auth/profile");
    } catch (error) {
      console.log("❌ API call blocked/failed:", (error as Error).message);
    }

    setTimeout(() => {
      RaceConditionUtils.clearAllProtections();
    }, 3000);
  },
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (
    window as Window & { refreshProtection?: typeof RaceConditionUtils }
  ).refreshProtection = RaceConditionUtils;
}
