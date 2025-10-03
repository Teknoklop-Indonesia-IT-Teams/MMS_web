import toast from "react-hot-toast";

export const showSuccessToast = (title: string, message?: string) => {
  return toast.success(message ? `${title}\n${message}` : title, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#10B981",
      color: "#FFFFFF",
      minWidth: "300px",
    },
    iconTheme: {
      primary: "#FFFFFF",
      secondary: "#10B981",
    },
  });
};

export const showErrorToast = (title: string, message?: string) => {
  return toast.error(message ? `${title}\n${message}` : title, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#EF4444",
      color: "#FFFFFF",
      minWidth: "300px",
    },
    iconTheme: {
      primary: "#FFFFFF",
      secondary: "#EF4444",
    },
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#3B82F6",
      color: "#FFFFFF",
      minWidth: "300px",
    },
  });
};

export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  description?: string
) => {
  return new Promise<boolean>((resolve) => {
    const result = window.confirm(
      `${message}${description ? `\n\n${description}` : ""}`
    );

    if (result) {
      onConfirm();
      resolve(true);
    } else {
      if (onCancel) {
        onCancel();
      }
      resolve(false);
    }
  });
};

export const showInfoToast = (title: string, message?: string) => {
  return toast(message ? `${title}\n${message}` : title, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#3B82F6",
      color: "#FFFFFF",
      minWidth: "300px",
    },
    iconTheme: {
      primary: "#FFFFFF",
      secondary: "#3B82F6",
    },
  });
};

export const showWarningToast = (title: string, message?: string) => {
  return toast(message ? `${title}\n${message}` : title, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#F59E0B",
      color: "#FFFFFF",
      minWidth: "300px",
    },
    icon: "⚠️",
  });
};
