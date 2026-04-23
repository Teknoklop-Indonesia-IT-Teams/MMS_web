import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthSimple";

const AuthRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const [forceReady, setForceReady] = useState(false);

  // Anti stuck loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 3000); // 3 detik

    return () => clearTimeout(timer);
  }, []);
  console.log("AUTH STATE:", { loading, isAuthenticated });
  if (loading && !forceReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
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
