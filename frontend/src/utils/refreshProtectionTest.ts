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
  window.debugRefreshProtection = () => {
    console.log("=== Refresh Protection Debug Info ===");
    console.log("Session Storage:", sessionStorage.getItem("mms-navigation-state"));
    console.log("Protection Utils:", RaceConditionUtils);
    // Tambahkan info debug lainnya sesuai kebutuhan
  };
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
    if (typeof window.debugRefreshProtection === "function") {
      window.debugRefreshProtection();
    }
  }, 1000);
}
