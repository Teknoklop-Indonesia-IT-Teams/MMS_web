let isAppInitializing = true;
let initializationTimer: NodeJS.Timeout | null = null;

export const setInitializationComplete = () => {
  isAppInitializing = false;

  if (initializationTimer) {
    clearTimeout(initializationTimer);
    initializationTimer = null;
  }
};

export const isAppStillInitializing = () => {
  return isAppInitializing;
};

export const extendInitializationPeriod = (additionalMs: number = 2000) => {
  if (isAppInitializing) {
    if (initializationTimer) {
      clearTimeout(initializationTimer);
    }

    initializationTimer = setTimeout(() => {
      if (isAppInitializing) {
        isAppInitializing = false;
      }
    }, additionalMs);
  }
};

initializationTimer = setTimeout(() => {
  if (isAppInitializing) {
    isAppInitializing = false;
  }
}, 60000);
