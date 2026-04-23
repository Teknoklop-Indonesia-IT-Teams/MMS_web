export const AppStateManager = {
  isCriticalOperation: false,
  criticalOperationTimeout: null as NodeJS.Timeout | null,

  startCriticalOperation: (description = "Unknown operation") => {
    AppStateManager.isCriticalOperation = true;

    if (AppStateManager.criticalOperationTimeout) {
      clearTimeout(AppStateManager.criticalOperationTimeout);
    }

    AppStateManager.criticalOperationTimeout = setTimeout(() => {
      AppStateManager.endCriticalOperation();
    }, 60000);
  },

  endCriticalOperation: () => {
    AppStateManager.isCriticalOperation = false;

    if (AppStateManager.criticalOperationTimeout) {
      clearTimeout(AppStateManager.criticalOperationTimeout);
      AppStateManager.criticalOperationTimeout = null;
    }
  },

  isInCriticalOperation: () => {
    return AppStateManager.isCriticalOperation;
  },

  saveState: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save state to localStorage:", error);
    }
  },

  loadState: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn("Failed to load state from localStorage:", error);
      return defaultValue;
    }
  },

  clearState: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear state from localStorage:", error);
    }
  },

  clearAllStates: () => {
    try {
      const keysToKeep = ["theme"];
      const allKeys = Object.keys(localStorage);

      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear app states:", error);
    }
  },

  resetToInitialState: () => {
    const persistentKeys = ["theme"];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!persistentKeys.includes(key)) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to clear ${key}:`, error);
        }
      }
    });
  },
};
