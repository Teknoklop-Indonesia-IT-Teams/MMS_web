import { useEffect } from "react";
import { AppStateManager } from "../utils/appState";
import { extendInitializationPeriod } from "../utils/authUtils";


export const usePageLifecycle = () => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (AppStateManager.isInCriticalOperation()) {
        const message =
          "Ada operasi yang sedang berjalan. Yakin ingin meninggalkan halaman?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handleUnload = () => {
      AppStateManager.endCriticalOperation();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        extendInitializationPeriod(2000);
      }
    };

    const handleFocus = () => {
      extendInitializationPeriod(1500);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
};
