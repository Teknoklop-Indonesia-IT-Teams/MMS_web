// Global variable to track initialization state
let isAppInitializing = true;
let initializationTimer: NodeJS.Timeout | null = null;

// Set initialization complete after app loads
export const setInitializationComplete = () => {
  console.log("🔐 Auth initialization marked as complete");
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
    console.log(`⏰ Extending initialization period by ${additionalMs}ms`);

    // Clear existing timer
    if (initializationTimer) {
      clearTimeout(initializationTimer);
    }

    // Set new timer
    initializationTimer = setTimeout(() => {
      if (isAppInitializing) {
        console.log(
          "⏰ Extended initialization timeout reached - marking as complete"
        );
        isAppInitializing = false;
      }
    }, additionalMs);
  }
};

// Initialize with a longer timeout fallback to prevent premature logout
initializationTimer = setTimeout(() => {
  if (isAppInitializing) {
    console.log("⏰ Auth initialization timeout reached - marking as complete");
    isAppInitializing = false;
  }
}, 60000); // MUCH longer - 60 seconds for refresh scenarios
