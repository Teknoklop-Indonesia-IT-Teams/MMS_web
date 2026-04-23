/**
 * Enhanced Loading Component for Authentication
 * Shows during app initialization to prevent premature redirects
 */

import React from "react";
import { Loader2, Shield } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = "Initializing application...",
  showProgress = false,
  progress = 0,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-12 h-12 text-blue-600" />
              <Loader2 className="absolute w-6 h-6 text-blue-400 animate-spin -top-1 -right-1" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Loading Application
          </h2>

          {/* Message */}
          <p className="mb-6 text-gray-600">{message}</p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full h-2 mb-4 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all duration-300 ease-out bg-blue-600 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Loading Spinner */}
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm text-gray-500">Please wait...</span>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-xs text-gray-400">
            <p>Verifying authentication...</p>
            <p>This may take a few seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 mx-4 bg-white rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const InlineLoading: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
}> = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center justify-center py-4 space-x-2">
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      <span className="text-gray-600">{message}</span>
    </div>
  );
};
