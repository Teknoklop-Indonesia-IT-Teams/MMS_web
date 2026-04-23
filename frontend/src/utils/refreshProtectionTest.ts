import { RaceConditionUtils } from "../services/api";

declare global {
  interface Window {
    debugRefreshProtection: () => void;
    simulateFastRefresh: () => Promise<void>;
    clearRefreshProtection: () => void;
    refreshProtectionUtils: typeof RaceConditionUtils;
  }
}

if (typeof window !== "undefined") {
  window.debugRefreshProtection = () => {
  };
  window.simulateFastRefresh = async () => {
    await RaceConditionUtils.simulateFastRefresh();
  };

  window.clearRefreshProtection = () => {
    RaceConditionUtils.clearAllProtections();

    const sessionKey = "mms-navigation-state";
    sessionStorage.removeItem(sessionKey);
  };

  window.refreshProtectionUtils = RaceConditionUtils;

  if (process.env.NODE_ENV === "development") {
    setInterval(() => {
      window.debugRefreshProtection();
    }, 30000);
  }
}

if (typeof window !== "undefined") {
  setTimeout(() => {
    if (typeof window.debugRefreshProtection === "function") {
      window.debugRefreshProtection();
    }
  }, 1000);
}
