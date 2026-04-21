export const testLogout = () => {
  if (typeof window !== "undefined") {
    const logoutButton = document.querySelector(
      '[data-testid="logout-button"]'
    );
    if (logoutButton) {
      (logoutButton as HTMLElement).click();
    }
  }
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { testLogout?: typeof testLogout }).testLogout =
    testLogout;
}

export default testLogout;
