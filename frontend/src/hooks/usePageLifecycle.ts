import { useEffect } from "react";
import { AppStateManager } from "../utils/appState";
import { extendInitializationPeriod } from "../utils/authUtils";

/**
 * Hook to manage page lifecycle events and prevent logout during critical operations
 */
export const usePageLifecycle = () => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // If in critical operation, warn user before leaving
      if (AppStateManager.isInCriticalOperation()) {
        const message =
          "Ada operasi yang sedang berjalan. Yakin ingin meninggalkan halaman?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handleUnload = () => {
      // Cleanup any remaining critical operations
      AppStateManager.endCriticalOperation();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔍 Page became visible - extending auth initialization");
        // Extend initialization when page becomes visible to prevent immediate logout
        extendInitializationPeriod(2000);
      }
    };

    const handleFocus = () => {
      console.log("🎯 Window focused - extending auth initialization");
      // Extend initialization when window gains focus
      extendInitializationPeriod(1500);
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
};
