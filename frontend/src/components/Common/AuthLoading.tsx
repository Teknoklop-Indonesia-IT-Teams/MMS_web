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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="h-12 w-12 text-blue-600" />
              <Loader2 className="h-6 w-6 text-blue-400 animate-spin absolute -top-1 -right-1" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Application
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {/* Loading Spinner */}
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
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

// Simple loading overlay for smaller components
export const LoadingOverlay: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Inline loading component
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
    <div className="flex items-center justify-center space-x-2 py-4">
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      <span className="text-gray-600">{message}</span>
    </div>
  );
};
