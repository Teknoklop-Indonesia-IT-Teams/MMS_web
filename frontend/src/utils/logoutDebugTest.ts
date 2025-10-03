/**
 * Logout Debug Test
 *
 * Debug flow untuk logout:
 * 1. User klik logout button di Header
 * 2. handleLogout() dipanggil dengan confirmation dialog
 * 3. Header calls logout() dari useAuth hook
 * 4. useAuth menggunakan RobustAuthContext.logout()
 * 5. RobustAuthContext.logout():
 *    - Check refresh protection (jika ada, clear paksa)
 *    - Call authService.logout() ke backend
 *    - Clear EnhancedAuthStorage.clearAuthData()
 *    - setUser(null)
 *    - navigate("/login", { replace: true })
 *
 * Perbaikan yang dilakukan:
 * - Menghapus return pada refresh protection check
 * - Menambahkan clearRefreshProtection() method
 * - Enhanced error handling di Header
 * - Force fallback dengan window.location.href jika navigate gagal
 */

// Test function untuk debug logout
export const testLogout = () => {
  console.log("🧪 Testing logout flow...");

  // Check current auth state
  console.log("Current auth storage:", localStorage.getItem("authToken"));
  console.log("Current user:", localStorage.getItem("authUser"));
  console.log("Refresh protection:", localStorage.getItem("refreshProtection"));

  // Simulate logout
  if (typeof window !== "undefined") {
    const logoutButton = document.querySelector(
      '[data-testid="logout-button"]'
    );
    if (logoutButton) {
      console.log("🎯 Found logout button, triggering click...");
      (logoutButton as HTMLElement).click();
    } else {
      console.log("⚠️ Logout button not found");
    }
  }
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { testLogout?: typeof testLogout }).testLogout =
    testLogout;
  console.log("🧪 Debug: Use window.testLogout() to test logout");
}

export default testLogout;
