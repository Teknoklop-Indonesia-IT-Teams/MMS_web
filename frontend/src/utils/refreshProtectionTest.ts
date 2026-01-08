// Fast Refresh Protection Test
import { RaceConditionUtils } from "../services/api";

// Extend window interface for TypeScript
declare global {
  interface Window {
    debugRefreshProtection: () => void;
    simulateFastRefresh: () => Promise<void>;
    clearRefreshProtection: () => void;
    refreshProtectionUtils: typeof RaceConditionUtils;
  }
}

// Add debug info to window for easy testing
if (typeof window !== "undefined") {
  window.simulateFastRefresh = async () => {
    // Use the built-in simulation
    await RaceConditionUtils.simulateFastRefresh();
  };

  window.clearRefreshProtection = () => {
    RaceConditionUtils.clearAllProtections();

    // Also clear session storage
    const sessionKey = "mms-navigation-state";
    sessionStorage.removeItem(sessionKey);
  };

  // Expose all utils
  window.refreshProtectionUtils = RaceConditionUtils;

  // Auto-debug every 30 seconds in development
  if (process.env.NODE_ENV === "development") {
    setInterval(() => {
      window.debugRefreshProtection();
    }, 30000);
  }
}

// Show initial status
if (typeof window !== "undefined") {
  setTimeout(() => {
    window.debugRefreshProtection();
  }, 1000);
}
