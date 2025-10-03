import toast from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

// Success toast with custom styling
export const showSuccessToast = (message: string, subtitle?: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-green-600 dark:text-green-400 border border-transparent rounded-none rounded-r-lg hover:text-green-500 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 4000, position: "top-right" }
  );
};

// Error toast with custom styling
export const showErrorToast = (message: string, subtitle?: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-red-600 dark:text-red-400 border border-transparent rounded-none rounded-r-lg hover:text-red-500 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 5000, position: "top-right" }
  );
};

// Warning toast
export const showWarningToast = (message: string, subtitle?: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-yellow-600 dark:text-yellow-400 border border-transparent rounded-none rounded-r-lg hover:text-yellow-500 dark:hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 4000, position: "top-right" }
  );
};

// Info toast
export const showInfoToast = (message: string, subtitle?: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-600">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-blue-600 dark:text-blue-400 border border-transparent rounded-none rounded-r-lg hover:text-blue-500 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 4000, position: "top-right" }
  );
};

// Loading toast with spinner
export const showLoadingToast = (message: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-6 h-6 border-b-2 border-blue-500 dark:border-blue-400 rounded-full animate-spin"></div>
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity, position: "top-right" }
  );
};

// Confirmation toast with action buttons
export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  subtitle?: string
) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-gray-600 transition-colors duration-200`}
      >
        <div className="p-4">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 pt-0.5">
              <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {message}
              </p>
              {subtitle && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 dark:bg-red-700 border border-transparent rounded-md hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
            >
              🗑️ Ya, Hapus
            </button>
            <button
              onClick={() => {
                onCancel?.();
                toast.dismiss(t.id);
              }}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              ❌ Tidak
            </button>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity, position: "top-right" }
  );
};
