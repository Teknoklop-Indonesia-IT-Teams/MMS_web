// Global variable to track initialization state
let isAppInitializing = true;
let initializationTimer: NodeJS.Timeout | null = null;

// Set initialization complete after app loads
export const setInitializationComplete = () => {
  isAppInitializing = false;

  // Clear any existing timer
  if (initializationTimer) {
    clearTimeout(initializationTimer);
    initializationTimer = null;
  }
};

// Check if app is still initializing
export const isAppStillInitializing = () => {
  return isAppInitializing;
};

// Extend initialization period if needed (for slow connections or race conditions)
export const extendInitializationPeriod = (additionalMs: number = 2000) => {
  if (isAppInitializing) {
    // Clear existing timer
    if (initializationTimer) {
      clearTimeout(initializationTimer);
    }

    // Set new timer
    initializationTimer = setTimeout(() => {
      if (isAppInitializing) {
        isAppInitializing = false;
      }
    }, additionalMs);
  }
};

// Initialize with a longer timeout fallback to prevent premature logout
initializationTimer = setTimeout(() => {
  if (isAppInitializing) {
    isAppInitializing = false;
  }
}, 60000); // MUCH longer - 60 seconds for refresh scenarios
