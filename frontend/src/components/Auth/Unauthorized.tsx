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
    // Navigate based on user role
    switch (user?.role) {
      case "admin":
        navigate("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-2">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>

          {user && (
            <p className="text-sm text-gray-500 mb-8">
              Role Anda:{" "}
              <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
            >
              Kembali ke Halaman Utama
            </button>

            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out"
            >
              Kembali ke Halaman Sebelumnya
            </button>

            <button
              onClick={logout}
              className="w-full text-red-600 hover:text-red-700 font-medium py-2 transition duration-200"
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
