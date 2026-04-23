import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthSimple";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    switch (user?.role) {
      case "admin":
        navigate("/dashboard-telemetry");
        break;
      case "manager":
        navigate("/equipment");
        break;
      case "ast_manager":
        navigate("/equipment");
        break;
      case "engineer":
        navigate("/equipment");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-lg">
        <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
          {/* Icon */}
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Akses Ditolak
          </h1>

          {/* Message */}
          <p className="mb-2 text-gray-600">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>

          {user && (
            <p className="mb-8 text-sm text-gray-500">
              Role Anda:{" "}
              <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 font-semibold text-white transition duration-200 ease-in-out transform bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105"
            >
              Kembali ke Halaman Utama
            </button>

            <button
              onClick={handleGoBack}
              className="w-full px-6 py-3 font-semibold text-gray-700 transition duration-200 ease-in-out bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Kembali ke Halaman Sebelumnya
            </button>

            <button
              onClick={logout}
              className="w-full py-2 font-medium text-red-600 transition duration-200 hover:text-red-700"
            >
              Logout dan Login dengan Akun Lain
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator
            sistem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
