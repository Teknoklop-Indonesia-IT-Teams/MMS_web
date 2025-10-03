import { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContextSimple";
import { EquipmentProvider } from "./contexts/EquipmentContext";
import { AppStateManager } from "./utils/appState";
import { usePageLifecycle } from "./hooks/usePageLifecycle";

// Critical auth components - keep immediate loading for better UX
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { RBAC } from "./components/Auth/RBAC";
import { PERMISSIONS } from "./constants/roles";

// Lazy load ALL components for maximum code splitting
const Layout = lazy(() => import("./components/Layout/Layout"));
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const StaffList = lazy(() => import("./components/Staff/StaffList"));
const EquipmentTable = lazy(
  () => import("./components/Equipment/EquipmentTable")
);
const SimpleEquipmentDetail = lazy(
  () => import("./components/Equipment/SimpleEquipmentDetail")
);
const PublicEquipmentDetail = lazy(
  () => import("./components/Equipment/PublicEquipmentDetail")
);
// Auth components - also lazy load to reduce initial bundle
const Login = lazy(() => import("./components/Auth/Login"));
const Unauthorized = lazy(() => import("./components/Auth/Unauthorized"));
const ForgotPassword = lazy(() => import("./components/Auth/ForgotPassword"));
const SignUp = lazy(() => import("./components/Auth/SignUp"));
const ResetPassword = lazy(() => import("./components/Auth/ResetPassword"));

// Loading component untuk suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  // Use page lifecycle hook
  usePageLifecycle();

  useEffect(() => {
    // Reset app state on mount/refresh but keep theme
    AppStateManager.resetToInitialState();

    // Preload critical components for better UX
    const preloadCriticalComponents = () => {
      // Preload dashboard and equipment table as they're commonly used
      import("./components/Dashboard/Dashboard");
      import("./components/Equipment/EquipmentTable");
    };

    // Preload after a short delay to not block initial render
    setTimeout(preloadCriticalComponents, 1000);
  }, []);

  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <EquipmentProvider>
            <div className="App">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Login />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <ForgotPassword />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <SignUp />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <ResetPassword />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public QR Code route - no auth required */}
                  <Route
                    path="/qr/telemetri/detail/:id"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                          </div>
                        }
                      >
                        <PublicEquipmentDetail />
                      </Suspense>
                    }
                  />

                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center min-h-screen">
                              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                            </div>
                          }
                        >
                          <Layout />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  >
                    {/* Dashboard - Admin and Supervisor only */}
                    <Route
                      index
                      element={
                        <RBAC allowedRoles={PERMISSIONS.DASHBOARD_VIEW}>
                          <Dashboard />
                        </RBAC>
                      }
                    />

                    {/* Staff Management - Admin and Supervisor */}
                    <Route
                      path="petugas"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.STAFF_VIEW}>
                          <StaffList />
                        </RBAC>
                      }
                    />

                    {/* Equipment - All roles can view */}
                    <Route
                      path="telemetri"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
                          <EquipmentTable />
                        </RBAC>
                      }
                    />
                    <Route
                      path="telemetri/detail/:id"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
                          <SimpleEquipmentDetail />
                        </RBAC>
                      }
                    />

                    {/* Equipment page as alias */}
                    <Route
                      path="equipment"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
                          <EquipmentTable />
                        </RBAC>
                      }
                    />

                    {/* Dashboard as alias for admin */}
                    <Route
                      path="dashboard"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.DASHBOARD_VIEW}>
                          <Dashboard />
                        </RBAC>
                      }
                    />

                    {/* Equipment routes - accessible by all authenticated users */}
                    <Route
                      path="telemetri"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
                          <EquipmentTable />
                        </RBAC>
                      }
                    />
                    <Route
                      path="telemetri/:id"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
                          <SimpleEquipmentDetail />
                        </RBAC>
                      }
                    />

                    {/* Staff management - Admin and Supervisor only */}
                    <Route
                      path="petugas"
                      element={
                        <RBAC allowedRoles={PERMISSIONS.STAFF_VIEW}>
                          <StaffList />
                        </RBAC>
                      }
                    />
                  </Route>

                  {/* Catch-all route */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Suspense>

              {/* Global toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#fff",
                    color: "#333",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    maxWidth: "400px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </EquipmentProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
