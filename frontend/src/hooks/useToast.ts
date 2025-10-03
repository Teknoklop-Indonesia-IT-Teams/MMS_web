import { useCallback } from "react";
import { toast } from "react-hot-toast";

export const useToast = () => {
  const showSuccess = useCallback((message: string, description?: string) => {
    const displayMessage = description ? `${message}: ${description}` : message;
    toast.success(displayMessage, {
      duration: 3000,
      position: "top-right",
    });
  }, []);

  const showError = useCallback((message: string, description?: string) => {
    const displayMessage = description ? `${message}: ${description}` : message;
    toast.error(displayMessage, {
      duration: 4000,
      position: "top-right",
    });
  }, []);

  const showInfo = useCallback((message: string, description?: string) => {
    const displayMessage = description ? `${message}: ${description}` : message;
    toast(displayMessage, {
      duration: 3000,
      position: "top-right",
      icon: "ℹ️",
    });
  }, []);

  const showLoadingToast = useCallback((message: string) => {
    return toast.loading(message, {
      position: "top-right",
    });
  }, []);

  const showConfirmationToast = useCallback(
    (
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      description?: string
    ) => {
      const displayMessage = description
        ? `${message}\n${description}`
        : message;

      if (window.confirm(displayMessage)) {
        onConfirm();
      } else {
        onCancel?.();
      }
    },
    []
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showLoadingToast,
    showConfirmationToast,
  };
};
