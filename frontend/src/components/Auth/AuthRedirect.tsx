import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthSimple";

const AuthRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard-telemetry" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AuthRedirect;
