import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthProvider from "./contexts/AuthContext";
import { EquipmentProvider } from "./contexts/EquipmentContext";
import { usePageLifecycle } from "./hooks/usePageLifecycle";

// Critical auth components - keep immediate loading for better UX
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AuthRedirect from "./components/Auth/AuthRedirect";
import LayoutWrapper from "./components/Layout/LayoutWrapper";
import UsersProfile from "./components/Users/UsersProfile";

// Lazy load ALL components for maximum code splitting
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const StaffList = lazy(() => import("./components/Staff/StaffList"));
const EquipmentTable = lazy(
  () => import("./components/Equipment/EquipmentTable"),
);
const SimpleEquipmentDetail = lazy(
  () => import("./components/Equipment/SimpleEquipmentDetail"),
);
const PublicEquipmentDetail = lazy(
  () => import("./components/Equipment/PublicEquipmentDetail"),
);

// Auth components
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
      <p className="text-gray-600">Loading Enhanced Authentication...</p>
    </div>
  </div>
);

// App State Component
function AppStateComponent() {
  const pageLifecycle = usePageLifecycle();

  useEffect(() => {}, [pageLifecycle]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <EquipmentProvider>
            <AppStateComponent />
            <div className="App">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/*  Halaman QR Code For Public */}
                  <Route
                    path="/public/equipment/:id"
                    element={<PublicEquipmentDetail />}
                  />

                  {/* Halaman QR Code For Login, Halamannya masih belum bisa ngubah apapun */}
                  <Route
                    path="/qr/telemetri/detail/:id"
                    element={<PublicEquipmentDetail />}
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <Dashboard />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Telemetri/Equipment Routes */}
                  <Route
                    path="/telemetri"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <EquipmentTable />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Staff/Petugas Routes */}
                  <Route
                    path="/petugas"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <StaffList />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <UsersProfile />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/telemetri/:id"
                    element={
                      <ProtectedRoute>
                        <LayoutWrapper>
                          <SimpleEquipmentDetail />
                        </LayoutWrapper>
                      </ProtectedRoute>
                    }
                  />

                  {/* Root redirect - check authentication first */}
                  <Route path="/" element={<AuthRedirect />} />

                  {/* Catch all redirect - redirect to login if not authenticated */}
                  <Route path="*" element={<AuthRedirect />} />
                </Routes>
              </Suspense>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#4ade80",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 5000,
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
