import axios from "axios";
import {
  Equipment as Alat,
  Record,
  Staff,
  LoginCredentials,
  RegisterData,
} from "../types";
import { isAppStillInitializing } from "../utils/authUtils";
import { AppStateManager } from "../utils/appState";

const API_URL = import.meta.env.VITE_API_URL;
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000; // Reduced from 60s to 10s

// ABSOLUTE PROTECTION: Navigation/Refresh Detection - STRONGEST protection
// START WITH IMMEDIATE PROTECTION ACTIVE!
let isNavigating = true; // START PROTECTED!
let navigationStartTime = Date.now(); // Initialize immediately
let refreshCount = 1; // Assume at least 1 refresh (page load)
let lastRefreshTime = Date.now(); // Initialize immediately
let rapidRefreshProtection = false;
const pageLoadTime = Date.now(); // Track when page was loaded

// Detect page visibility changes and focus events for better refresh detection
let isPageVisible = true;
let lastVisibilityChange = Date.now();
let totalRefreshAttempts = 1; // Start with 1 (initial page load)

// IMMEDIATE PROTECTION: Assume we're in navigation state from the start
console.log(
  "🛡️ IMMEDIATE NAVIGATION PROTECTION ACTIVATED - Page loading detected"
);

// SESSION STORAGE STRATEGY - Most reliable refresh detection
if (typeof window !== "undefined" && window.sessionStorage) {
  const sessionKey = "mms-navigation-state";
  const lastPageLoad = sessionStorage.getItem(sessionKey);
  const currentTime = Date.now();

  if (lastPageLoad) {
    const timeSinceLastLoad = currentTime - parseInt(lastPageLoad);
    if (timeSinceLastLoad < 5000) {
      // Less than 5 seconds
      console.log(
        `🚨 FAST REFRESH DETECTED! Only ${timeSinceLastLoad}ms since last page load`
      );

      // FORCE MAXIMUM PROTECTION
      isNavigating = true;
      rapidRefreshProtection = true;
      totalRefreshAttempts += 10; // Heavily penalize fast refresh
      refreshCount += 5;

      // Extended protection for fast refresh
      setTimeout(() => {
        console.log(
          "🔒 Extended protection active for fast refresh - 60 seconds"
        );
      }, 1000);

      // Only lift after 60 seconds for fast refresh
      setTimeout(() => {
        if (Date.now() - navigationStartTime > 60000) {
          isNavigating = false;
          rapidRefreshProtection = false;
          console.log("✅ Fast refresh protection finally lifted after 60s");
        }
      }, 60000);
    }
  }

  // Always update the session storage with current time
  sessionStorage.setItem(sessionKey, currentTime.toString());
}

// Auto-lift protection after a reasonable time if no other events
setTimeout(() => {
  if (
    isNavigating &&
    !rapidRefreshProtection &&
    Date.now() - navigationStartTime > 15000
  ) {
    console.log(
      "⏰ Auto-lifting navigation protection after 15s of no activity"
    );
    isNavigating = false;
  }
}, 15000);

// Anti-spam refresh protection
class RefreshProtectionManager {
  private refreshTimes: number[] = [];
  private readonly MAX_REFRESHES = 2; // Maximum 2 refreshes
  private readonly TIME_WINDOW = 10000; // dalam 10 detik
  private readonly LOCKOUT_DURATION = 30000; // Lockout 30 detik
  private isLocked = false;

  recordRefresh(): boolean {
    const now = Date.now();

    // Remove old refresh times outside the window
    this.refreshTimes = this.refreshTimes.filter(
      (time) => now - time < this.TIME_WINDOW
    );

    // Add current refresh
    this.refreshTimes.push(now);

    console.log(
      `🔄 Refresh recorded: ${this.refreshTimes.length}/${
        this.MAX_REFRESHES
      } in ${this.TIME_WINDOW / 1000}s`
    );

    // Check if we exceed the limit
    if (this.refreshTimes.length > this.MAX_REFRESHES) {
      this.activateLockout();
      return false; // Block this refresh
    }

    return true; // Allow this refresh
  }

  private activateLockout(): void {
    if (this.isLocked) return;

    this.isLocked = true;
    rapidRefreshProtection = true;

    console.log(
      `🚫 RAPID REFRESH DETECTED! Activating ${
        this.LOCKOUT_DURATION / 1000
      }s lockout`
    );

    // Show user warning
    if (typeof window !== "undefined") {
      setTimeout(() => {
        alert(
          `⚠️ Refresh terlalu cepat! Harap tunggu ${
            this.LOCKOUT_DURATION / 1000
          } detik untuk mencegah logout otomatis.`
        );
      }, 100);
    }

    setTimeout(() => {
      this.isLocked = false;
      rapidRefreshProtection = false;
      this.refreshTimes = [];
      console.log("✅ Refresh lockout lifted");
    }, this.LOCKOUT_DURATION);
  }

  isBlocked(): boolean {
    return this.isLocked;
  }

  reset(): void {
    this.refreshTimes = [];
    this.isLocked = false;
    rapidRefreshProtection = false;
    console.log("🧹 Refresh protection reset");
  }
}

const refreshProtectionManager = new RefreshProtectionManager();

if (typeof window !== "undefined") {
  // ENHANCED REFRESH DETECTION - Multiple strategies

  // Strategy 1: Visibility API for tab switching and refresh detection
  document.addEventListener("visibilitychange", () => {
    lastVisibilityChange = Date.now();
    isPageVisible = !document.hidden;

    if (isPageVisible) {
      // Page became visible - potential refresh or tab switch
      const timeSinceLastVisibility = Date.now() - lastVisibilityChange;
      if (timeSinceLastVisibility < 1000) {
        console.log("🔍 FAST VISIBILITY CHANGE - Potential refresh detected");
        activateNavigationShield("visibility-change");
      }
    }
  });

  // Strategy 2: Performance API to detect actual page reloads
  if (window.performance) {
    const navigationEntries = performance.getEntriesByType("navigation");
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      if (navEntry.type === "reload") {
        console.log("🔄 PERFORMANCE API DETECTED RELOAD");
        totalRefreshAttempts++;
        isNavigating = true;
        navigationStartTime = Date.now();
        refreshCount++;
        lastRefreshTime = Date.now();
      }
    }
  }

  // Strategy 3: Page load time analysis
  window.addEventListener("DOMContentLoaded", () => {
    const loadTime = Date.now() - pageLoadTime;
    if (loadTime < 2000) {
      // Very fast load - likely a refresh
      console.log(`⚡ FAST PAGE LOAD (${loadTime}ms) - Likely refresh`);
      activateNavigationShield("fast-load");
    }
  });

  // Detect ANY kind of navigation or refresh
  const activateNavigationShield = (eventType: string) => {
    totalRefreshAttempts++;

    // Check rapid refresh protection first
    if (!refreshProtectionManager.recordRefresh()) {
      console.log(`🚫 RAPID REFRESH BLOCKED: ${eventType}`);

      // FORCE NAVIGATION SHIELD even if refresh is blocked
      isNavigating = true;
      navigationStartTime = Date.now();
      rapidRefreshProtection = true;

      // Extended lockout for fast refresh
      setTimeout(() => {
        if (Date.now() - navigationStartTime > 45000) {
          // 45 seconds
          isNavigating = false;
          console.log(
            "✅ Extended navigation protection lifted after fast refresh block"
          );
        }
      }, 45000);

      return; // Block this refresh attempt
    }

    isNavigating = true;
    navigationStartTime = Date.now();
    refreshCount++;
    lastRefreshTime = Date.now();
    rapidRefreshProtection = refreshProtectionManager.isBlocked();

    console.log(
      `🛡️ NAVIGATION SHIELD ACTIVATED: ${eventType} (refresh #${refreshCount}, total attempts: ${totalRefreshAttempts})`
    );
  };

  // Multiple event listeners for comprehensive detection
  window.addEventListener("beforeunload", () =>
    activateNavigationShield("beforeunload")
  );
  window.addEventListener("unload", () => activateNavigationShield("unload"));
  window.addEventListener("pagehide", () =>
    activateNavigationShield("pagehide")
  );

  // Page load protection
  window.addEventListener("load", () => {
    activateNavigationShield("load");

    // Extended protection after load
    setTimeout(() => {
      const now = Date.now();
      const timeSinceRefresh = now - lastRefreshTime;

      if (timeSinceRefresh > 10000) {
        // Only lift if no recent refresh
        isNavigating = false;
        console.log("✅ Navigation protection lifted after 10s");
      } else {
        // Keep protection longer if recent refresh
        setTimeout(() => {
          isNavigating = false;
          console.log("✅ Navigation protection lifted after extended period");
        }, 20000);
      }
    }, 10000);
  });

  // Keyboard shortcut detection (F5, Ctrl+R, etc.)
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
  baseURL: API_URL,
  timeout: Number(API_TIMEOUT), // Use environment variable
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  validateStatus: (status) => {
    return status >= 200 && status < 500; // Handle all responses
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    // Try multiple token sources for enhanced compatibility
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 API: Added auth token to request");
    } else {
      console.log("⚠️ API: No auth token found for request");
    }
    return config;
  },
  (error) => {
    console.error("❌ API: Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Optimistic Locking Manager untuk mencegah race conditions
class OptimisticLockingManager {
  private operationLocks = new Map<string, number>();
  private operationQueue = new Map<string, Promise<unknown>>();
  private readonly LOCK_TIMEOUT = 30000; // 30 detik timeout

  async executeWithLock<T>(
    operationKey: string,
    operation: () => Promise<T>,
    retryCount = 3
  ): Promise<T> {
    const now = Date.now();

    // Check if operation is already in progress
    if (this.operationQueue.has(operationKey)) {
      console.log(`🔄 Waiting for existing operation: ${operationKey}`);
      return this.operationQueue.get(operationKey) as Promise<T>;
    }

    // Check if we have a recent lock
    const lastLock = this.operationLocks.get(operationKey);
    if (lastLock && now - lastLock < 5000) {
      console.log(`⏳ Operation too recent, waiting: ${operationKey}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Set lock
    this.operationLocks.set(operationKey, now);

    const operationPromise = this.executeWithRetry(
      operation,
      retryCount,
      operationKey
    );
    this.operationQueue.set(operationKey, operationPromise);

    try {
      const result = await operationPromise;
      return result;
    } finally {
      // Clean up
      this.operationQueue.delete(operationKey);
      setTimeout(() => {
        if (this.operationLocks.get(operationKey) === now) {
          this.operationLocks.delete(operationKey);
        }
      }, 2000); // Keep lock for 2 seconds after completion
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount: number,
    operationKey: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(
          `🔄 Executing ${operationKey}, attempt ${attempt}/${retryCount}`
        );
        const result = await operation();
        console.log(`✅ Operation successful: ${operationKey}`);
        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(
          `❌ Attempt ${attempt} failed for ${operationKey}:`,
          errorMessage
        );

        // Don't retry on authentication errors to prevent logout loops
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 401) {
            throw error;
          }
        }

        if (attempt === retryCount) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      `Operation failed after ${retryCount} attempts: ${operationKey}`
    );
  }

  // Clear locks untuk operasi tertentu
  clearLock(operationKey: string): void {
    this.operationLocks.delete(operationKey);
    this.operationQueue.delete(operationKey);
    console.log(`🧹 Cleared lock for: ${operationKey}`);
  }

  // Clear semua locks (untuk cleanup)
  clearAllLocks(): void {
    this.operationLocks.clear();
    this.operationQueue.clear();
    console.log(`🧹 Cleared all operation locks`);
  }
}

const optimisticLockManager = new OptimisticLockingManager();

// Robust logout prevention system
class LogoutManager {
  private isLoggingOut = false;
  private logoutTimeoutId: NodeJS.Timeout | null = null;
  private lastLogoutAttempt = 0;
  private logout401Count = 0;
  private requestCount = 0;
  private lastRequestTime = 0;
  private initializationEndTime = Date.now() + 60000; // 60 seconds - VERY long initialization
  private onLogoutCallback?: () => void;

  private readonly DEBOUNCE_TIME = 30000; // 30 seconds - VERY long debounce
  private readonly MAX_401_COUNT = 20; // Allow MANY more 401s
  private readonly RACE_CONDITION_WINDOW = 15000; // 15 seconds - MUCH longer window

  setLogoutCallback(callback: () => void): void {
    this.onLogoutCallback = callback;
  }

  canLogout(): boolean {
    const now = Date.now();
    this.logout401Count++;
    this.requestCount++;

    console.log(
      `🔍 401 Analysis: count=${
        this.logout401Count
      }, navigation=${isNavigating}, timeSinceNav=${
        now - navigationStartTime
      }ms`
    );

    // ABSOLUTE PROTECTION #1: Navigation/Refresh Shield
    if (isNavigating) {
      console.log(
        "🛡️ NAVIGATION SHIELD ACTIVE - Blocking logout during navigation/refresh"
      );
      return false;
    }

    // ABSOLUTE PROTECTION #1.5: Rapid refresh protection
    if (rapidRefreshProtection || refreshProtectionManager.isBlocked()) {
      console.log(
        "🛡️ RAPID REFRESH PROTECTION ACTIVE - Blocking logout during rapid refresh lockout"
      );
      return false;
    }

    // ABSOLUTE PROTECTION #2: Recent refresh detection
    if (refreshCount > 0 && now - lastRefreshTime < 20000) {
      // 20 seconds after any refresh
      console.log(
        `🛡️ RECENT REFRESH DETECTED - Blocking logout (refresh #${refreshCount}, ${
          now - lastRefreshTime
        }ms ago)`
      );
      return false;
    }

    // Never logout during initialization period
    if (now < this.initializationEndTime) {
      console.log("🚫 Still in initialization period - blocking logout");
      return false;
    }

    // Never logout if already in progress
    if (this.isLoggingOut) {
      console.log("🚫 Logout already in progress");
      return false;
    }

    // Detect rapid fire requests (refresh scenario) - MUCH more permissive
    if (this.requestCount > 50 && now - this.lastRequestTime < 500) {
      // Allow way more requests
      console.log("🚫 Rapid fire requests detected - likely refresh");
      return false;
    }

    // Race condition detection - MUCH more permissive
    if (
      this.logout401Count > 10 && // Allow way more 401s
      now - this.lastLogoutAttempt < this.RACE_CONDITION_WINDOW
    ) {
      console.log(
        `🚫 Race condition: ${this.logout401Count} 401s in ${
          now - this.lastLogoutAttempt
        }ms`
      );
      return false;
    }

    // Only allow logout if we have a reasonable pause between attempts
    if (now - this.lastLogoutAttempt < this.DEBOUNCE_TIME) {
      console.log(
        `🚫 Debounce: Only ${now - this.lastLogoutAttempt}ms since last attempt`
      );
      return false;
    }

    this.lastLogoutAttempt = now;
    this.lastRequestTime = now;
    return true;
  }

  performLogout(): void {
    if (this.isLoggingOut) return;

    console.log("🚨 PERFORMING LOGOUT");
    this.isLoggingOut = true;

    // Clear all race condition protections
    try {
      optimisticLockManager.clearAllLocks();
      refreshProtectionManager.reset();
      console.log("🧹 Race condition protections cleared during logout");
    } catch (error) {
      console.log("⚠️ Error clearing protections during logout:", error);
    }

    // Clear auth immediately
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    // Use callback if available (React Router navigate)
    if (this.onLogoutCallback) {
      console.log("✅ Using React Router navigate for logout");
      this.onLogoutCallback();
      this.reset();
      return;
    }

    // Fallback: debounced redirect (only if no callback)
    console.log("⚠️ No callback set - using fallback window.location redirect");
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
    // Reset counters on successful response but preserve debounce window
    this.logout401Count = 0;
  }

  extendInitialization(additionalMs: number): void {
    const newEndTime = Date.now() + additionalMs;
    if (newEndTime > this.initializationEndTime) {
      this.initializationEndTime = newEndTime;
      console.log(`🔒 Extended logout protection by ${additionalMs}ms`);
    }
  }
}

const logoutManager = new LogoutManager();

// Export logout manager untuk setup callback dari AuthContext
export const setupLogoutCallback = (callback: () => void) => {
  logoutManager.setLogoutCallback(callback);
};

// Export method to extend initialization period from components
export const extendLogoutProtection = (ms: number) => {
  logoutManager.extendInitialization(ms);
};

// Response interceptor to handle token expiration with robust logout management
api.interceptors.response.use(
  (response) => {
    // Reset counters on successful response
    if (response.status >= 200 && response.status < 300) {
      logoutManager.onSuccessfulResponse();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔍 401 response received");

      // Check basic conditions first
      const stillInitializing = isAppStillInitializing();
      const currentPath = window.location.pathname;
      const hasToken = localStorage.getItem("token");
      const inCriticalOperation = AppStateManager.isInCriticalOperation();

      // Early exit conditions
      if (stillInitializing) {
        console.log("🚫 Still initializing - ignoring 401");
        return Promise.reject(error);
      }

      if (currentPath === "/login" || currentPath.includes("/login")) {
        console.log("🚫 Already on login page - ignoring 401");
        return Promise.reject(error);
      }

      if (inCriticalOperation) {
        console.log("🚫 In critical operation - ignoring 401");
        return Promise.reject(error);
      }

      // ADDITIONAL FAST REFRESH PROTECTION
      if (isNavigating) {
        console.log("🛡️ Navigation shield active - blocking 401 logout");
        return Promise.reject(error);
      }

      if (rapidRefreshProtection) {
        console.log("🛡️ Rapid refresh protection active - blocking 401 logout");
        return Promise.reject(error);
      }

      // Check if we're in the danger zone (first 30 seconds after page load)
      const timeSincePageLoad = Date.now() - pageLoadTime;
      if (timeSincePageLoad < 30000) {
        console.log(
          `🛡️ Page load protection active (${timeSincePageLoad}ms since load) - blocking 401 logout`
        );
        return Promise.reject(error);
      }

      if (!hasToken) {
        console.log("🚫 No token - 401 expected");
        return Promise.reject(error);
      }

      // COMPLETELY DISABLE AUTO-LOGOUT TO FIX REFRESH ISSUE
      console.log("⚠️ 401 detected but auto-logout is DISABLED");
      console.log("� This prevents logout on refresh. Manual logout only.");
      // Let the components handle 401 errors individually
    }
    return Promise.reject(error);
  }
);

// Page reload detection is now handled by LogoutManager's initialization period

export const alatService = {
  getAll: async () => {
    // Mark as critical operation to prevent logout during fetch
    AppStateManager.startCriticalOperation("Equipment fetch");

    try {
      // Minimal cache strategy for performance
      const response = await api.get<Alat[]>(`/alat?_v=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
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
  create: (data: FormData | Omit<Alat, "id">) => {
    AppStateManager.startCriticalOperation("Equipment create");
    const operationKey = `create-alat-${Date.now()}`;

    // For FormData, don't set Content-Type header - let browser set it automatically
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };

    return optimisticLockManager
      .executeWithLock(operationKey, () =>
        api.post<Alat>("/alat", data, { headers })
      )
      .finally(() => AppStateManager.endCriticalOperation());
  },
  update: (id: string, data: FormData | Partial<Alat>) => {
    AppStateManager.startCriticalOperation(`Equipment update ${id}`);
    const operationKey = `update-alat-${id}`;

    // For FormData, don't set Content-Type header - let browser set it automatically
    const headers =
      data instanceof FormData ? {} : { "Content-Type": "application/json" };

    return optimisticLockManager
      .executeWithLock(operationKey, () =>
        api.put<Alat>(`/alat/${id}`, data, { headers })
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
  // Maintenance functions dengan Optimistic Locking
  stopMaintenance: (id: string) => {
    console.log(
      `🛑 API Service: Sending stop maintenance request for ID: ${id}`
    );
    const operationKey = `stop-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.post(`/alat/${id}/stop-maintenance`)
    );
  },
  completeMaintenance: (id: string) => {
    console.log(
      `✅ API Service: Sending complete maintenance request for ID: ${id}`
    );
    const operationKey = `complete-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.post(`/alat/${id}/complete-maintenance`)
    );
  },
  updateMaintenanceSettings: (
    id: string,
    data: {
      maintenanceDate?: string;
      maintenanceInterval?: number;
      isMaintenanceActive?: boolean;
    }
  ) => {
    console.log(`🔧 API Service: Updating maintenance settings for ID: ${id}`);
    const operationKey = `update-maintenance-${id}`;
    return optimisticLockManager.executeWithLock(operationKey, () =>
      api.put(`/alat/${id}/maintenance`, data)
    );
  },
};

export const recordService = {
  getAll: () => api.get<Record[]>("/record"),
  getById: (id: string) => api.get<Record>(`/record/${id}`),
  create: (data: Omit<Record, "id">) => {
    AppStateManager.startCriticalOperation("Create record");

    // Log the size of the request to help with debugging
    const totalSize = JSON.stringify(data).length;
    console.log(`Sending record with total size: ${totalSize} bytes`);

    return api
      .post<Record>("/record", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 seconds for image upload
      })
      .finally(() => AppStateManager.endCriticalOperation());
  },
  update: (id: string, data: Partial<Record>) => {
    AppStateManager.startCriticalOperation("Update record");

    const totalSize = JSON.stringify(data).length;
    console.log(`Updating record with total size: ${totalSize} bytes`);

    return api
      .put<Record>(`/record/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      })
      .finally(() => AppStateManager.endCriticalOperation());
  },
  delete: (id: string) => {
    AppStateManager.startCriticalOperation("Delete record");
    return api
      .delete(`/record/${id}`)
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

// Items service
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

// Roles service
export interface Role {
  roleId: number;
  roleName: string;
  createdDtm: string;
  updatedDtm?: string;
}

export const rolesService = {
  getAll: () => api.get<Role[]>("/roles"),
  getById: (id: string) => api.get<Role>(`/roles/${id}`),
  create: (data: Omit<Role, "roleId" | "createdDtm" | "updatedDtm">) =>
    api.post<Role>("/roles", data),
  update: (id: string, data: Partial<Role>) =>
    api.put<Role>(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

// Users service
export interface User {
  userId: number;
  email: string;
  name: string;
  mobile: string;
  roleId: number;
  isDeleted: number;
  createdDtm: string;
  updatedDtm?: string;
  roleName?: string;
}

export const usersService = {
  getAll: () => api.get<User[]>("/users"),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
    roleId: number;
  }) => api.post<User>("/users", data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
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

// Utility functions untuk race condition protection
export const RaceConditionUtils = {
  // Clear semua locks dan proteksi (gunakan saat logout manual)
  clearAllProtections: () => {
    console.log("🧹 Clearing all race condition protections...");
    optimisticLockManager.clearAllLocks();
    refreshProtectionManager.reset();

    // Reset navigation protection
    isNavigating = false;
    refreshCount = 0;
    lastRefreshTime = 0;
    rapidRefreshProtection = false;
  },

  // Clear locks untuk operasi tertentu
  clearOperationLock: (operationKey: string) => {
    optimisticLockManager.clearLock(operationKey);
  },

  // Check status proteksi
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

  // Force activate protection (untuk testing)
  forceActivateProtection: (reason: string) => {
    console.log(`🛡️ FORCE ACTIVATING PROTECTION: ${reason}`);
    isNavigating = true;
    rapidRefreshProtection = true;
    navigationStartTime = Date.now();
    lastRefreshTime = Date.now();
  },

  // Debug info
  logDebugInfo: () => {
    const status = RaceConditionUtils.getProtectionStatus();
    // Check session storage
    if (typeof window !== "undefined" && window.sessionStorage) {
      const sessionKey = "mms-navigation-state";
      const lastPageLoad = sessionStorage.getItem(sessionKey);
      if (lastPageLoad) {
        console.log(
          `📱 Session: ${
            Date.now() - parseInt(lastPageLoad)
          }ms since last recorded page load`
        );
      }
    }
  },

  // Test fast refresh simulation
  simulateFastRefresh: async () => {
    // Simulate rapid navigation
    isNavigating = true;
    refreshCount = 5;
    lastRefreshTime = Date.now() - 1000;
    rapidRefreshProtection = true;
    try {
      const response = await api.get("/api/auth/profile");
      console.log("✅ API call succeeded despite protection:", response.data);
    } catch (error) {
      console.log("❌ API call blocked/failed:", (error as Error).message);
    }

    // Reset
    setTimeout(() => {
      RaceConditionUtils.clearAllProtections();
      console.log("🔄 Protection reset after test");
    }, 3000);
  },
};

// Add debug to window in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (
    window as Window & { refreshProtection?: typeof RaceConditionUtils }
  ).refreshProtection = RaceConditionUtils;
  console.log(
    "🧪 Debug: Use window.refreshProtection.logDebugInfo() to check protection status"
  );
  console.log(
    "🧪 Debug: Use window.refreshProtection.simulateFastRefresh() to test protection"
  );
}
