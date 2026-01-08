import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      showError("Invalid Link", "Password reset link is invalid or missing");
      navigate("/login");
    }
  }, [token, navigate, showError]);

  const validateForm = (): boolean => {
    if (!password) {
      showError("Error", "Password is required");
      return false;
    }
    if (password.length < 6) {
      showError("Error", "Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      showError("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        showSuccess(
          "Password Reset Successful",
          "Your password has been reset successfully"
        );
      } else {
        showError("Error", data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showError(
        "Network Error",
        "Unable to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Password Reset Successful!
            </h1>

            <p className="mb-8 text-gray-600">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Reset Your Password
            </h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pl-10 pr-12 transition duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 pl-10 pr-12 transition duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 font-semibold text-white transition duration-200 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-600 transition-colors hover:text-blue-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
