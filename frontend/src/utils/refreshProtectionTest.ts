// Fast Refresh Protection Test
import { RaceConditionUtils } from "../services/api";

console.log("🧪 TESTING FAST REFRESH PROTECTION");

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
    console.log("🔍 REFRESH PROTECTION STATUS:");
    const status = RaceConditionUtils.getProtectionStatus();
    console.table(status);

    // Check session storage manually
    const sessionKey = "mms-navigation-state";
    const lastPageLoad = sessionStorage.getItem(sessionKey);
    if (lastPageLoad) {
      console.log(
        "📱 Session update:",
        Date.now() - parseInt(lastPageLoad),
        "ms ago"
      );
    }
  };

  window.simulateFastRefresh = async () => {
    console.log("🔄 SIMULATING FAST REFRESH...");

    // Use the built-in simulation
    await RaceConditionUtils.simulateFastRefresh();
  };

  window.clearRefreshProtection = () => {
    console.log("🧹 CLEARING ALL PROTECTIONS (DEBUG ONLY)");
    RaceConditionUtils.clearAllProtections();

    // Also clear session storage
    const sessionKey = "mms-navigation-state";
    sessionStorage.removeItem(sessionKey);

    console.log("✅ All protections cleared");
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

// Test instructions
console.log(`
🧪 FAST REFRESH PROTECTION TEST INSTRUCTIONS:

1. Open DevTools Console
2. Try refreshing quickly (F5 F5)
3. Check console logs for protection messages
4. Use debug commands in console:
   - debugRefreshProtection() - Check current status
   - simulateFastRefresh() - Simulate fast refresh
   - clearRefreshProtection() - Clear all protections
   - refreshProtectionUtils.logDebugInfo() - Detailed debug info

Expected behavior:
✅ Fast refresh should trigger protection
✅ No logout should occur during protection
✅ Console should show "FAST REFRESH DETECTED"
✅ Protection should last 60 seconds for fast refresh

Current protection status:
`);

// Show initial status
if (typeof window !== "undefined") {
  setTimeout(() => {
    window.debugRefreshProtection();
  }, 1000);
}
