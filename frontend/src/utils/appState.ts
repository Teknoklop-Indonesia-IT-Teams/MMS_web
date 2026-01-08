// Utility to manage app state persistence
export const AppStateManager = {
  // Track if app is in critical operation (prevent logout during operations)
  isCriticalOperation: false,
  criticalOperationTimeout: null as NodeJS.Timeout | null,

  // Mark start of critical operation (like saving, loading, etc.)
  startCriticalOperation: (description = "Unknown operation") => {
    AppStateManager.isCriticalOperation = true;

    // Clear any existing timeout
    if (AppStateManager.criticalOperationTimeout) {
      clearTimeout(AppStateManager.criticalOperationTimeout);
    }

    // Auto-end critical operation after 60 seconds as safety - MUCH longer
    AppStateManager.criticalOperationTimeout = setTimeout(() => {
      AppStateManager.endCriticalOperation();
    }, 60000); // 60 seconds instead of 10
  },

  // Mark end of critical operation
  endCriticalOperation: () => {
    AppStateManager.isCriticalOperation = false;

    if (AppStateManager.criticalOperationTimeout) {
      clearTimeout(AppStateManager.criticalOperationTimeout);
      AppStateManager.criticalOperationTimeout = null;
    }
  },

  // Check if currently in critical operation
  isInCriticalOperation: () => {
    return AppStateManager.isCriticalOperation;
  },

  // Save current state to localStorage
  saveState: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save state to localStorage:", error);
    }
  },

  // Load state from localStorage
  loadState: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn("Failed to load state from localStorage:", error);
      return defaultValue;
    }
  },

  // Clear specific state
  clearState: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear state from localStorage:", error);
    }
  },

  // Clear all app states
  clearAllStates: () => {
    try {
      // Clear all app-related keys but keep theme
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

  // Reset to initial state (called on refresh)
  resetToInitialState: () => {
    // Only clear non-persistent data, keep theme preference
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
