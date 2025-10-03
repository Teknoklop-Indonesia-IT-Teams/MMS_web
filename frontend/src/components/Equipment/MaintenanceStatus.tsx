import React from "react";
import { Equipment } from "../../types";

interface MaintenanceStatusProps {
  equipment: Equipment;
  showDetails?: boolean;
}

export const MaintenanceStatus: React.FC<MaintenanceStatusProps> = ({
  equipment,
  showDetails = false,
}) => {
  // Check for completed maintenance status first, before checking isMaintenanceActive
  // This handles the case where maintenance is completed (status = "selesai")
  // but isMaintenanceActive is set to false
  if (equipment.maintenanceStatus === "selesai") {
    const colors = {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-800 dark:text-blue-200",
      dot: "bg-blue-500",
      border: "border-blue-200 dark:border-blue-700",
    };

    if (showDetails) {
      return (
        <div
          className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span
                className={`w-3 h-3 ${colors.dot} rounded-full mr-2`}
              ></span>
              <span className={`font-semibold ${colors.text}`}>
                Maintenance Selesai
              </span>
            </div>
            <span className={`text-sm font-medium ${colors.text}`}>
              Selesai
            </span>
          </div>
          <div className={`text-sm ${colors.text} space-y-1`}>
            <div>
              <span className="font-medium">Terakhir Maintenance:</span>{" "}
              {equipment.maintenanceDate
                ? new Date(equipment.maintenanceDate).toLocaleDateString(
                    "id-ID"
                  )
                : "Hari ini"}
            </div>
            <div>
              <span className="font-medium">Status:</span> Maintenance telah
              selesai dilakukan
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
      >
        <span className={`w-2 h-2 ${colors.dot} rounded-full mr-2`}></span>
        Selesai
      </div>
    );
  }

  // Convert to boolean properly - handle both 0/1 and true/false
  const isMaintenanceActive = Boolean(equipment.isMaintenanceActive);

  if (!isMaintenanceActive) {
    return (
      <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
        <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
        Tidak Aktif
      </div>
    );
  }

  const getStatusColor = (alertLevel: string) => {
    switch (alertLevel) {
      case "red":
      case "urgent":
        return {
          bg: "bg-red-100 dark:bg-red-900",
          text: "text-red-800 dark:text-red-200",
          dot: "bg-red-500",
          border: "border-red-200 dark:border-red-700",
        };
      case "yellow":
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          text: "text-yellow-800 dark:text-yellow-200",
          dot: "bg-yellow-500",
          border: "border-yellow-200 dark:border-yellow-700",
        };
      case "green":
      case "good":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-800 dark:text-green-200",
          dot: "bg-green-500",
          border: "border-green-200 dark:border-green-700",
        };
      case "blue":
        return {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-800 dark:text-blue-200",
          dot: "bg-blue-500",
          border: "border-blue-200 dark:border-blue-700",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-800 dark:text-gray-300",
          dot: "bg-gray-400",
          border: "border-gray-200 dark:border-gray-600",
        };
    }
  };

  const getStatusText = () => {
    // Use the status text directly from the backend if available
    if (equipment.maintenanceStatusText) {
      return equipment.maintenanceStatusText;
    }

    // Fallback logic if maintenanceStatusText is not available
    if (equipment.maintenanceStatus === "overdue") {
      return "Terlambat maintenance";
    }

    if (equipment.maintenanceStatus === "urgent") {
      const daysLeft = equipment.maintenanceDaysLeft || 0;
      return `${daysLeft} hari lagi (Urgent)`;
    }

    if (equipment.maintenanceStatus === "needed") {
      const daysLeft = equipment.maintenanceDaysLeft || 0;
      return `${daysLeft} hari lagi (Diperlukan)`;
    }

    if (equipment.maintenanceStatus === "good") {
      const daysLeft = equipment.maintenanceDaysLeft || 0;
      return `${daysLeft} hari lagi`;
    }

    if (equipment.maintenanceStatus === "selesai") {
      return "Selesai";
    }

    if (equipment.maintenanceStatus === "inactive") {
      return "Tidak Aktif";
    }

    return "Status tidak diketahui";
  };

  const getDetailedStatusText = () => {
    if (equipment.maintenanceStatus === "overdue") {
      return "Maintenance Terlambat";
    }

    if (equipment.maintenanceStatus === "urgent") {
      return "Maintenance Urgent";
    }

    if (equipment.maintenanceStatus === "needed") {
      return "Maintenance Diperlukan";
    }

    if (equipment.maintenanceStatus === "good") {
      return "Maintenance Normal";
    }

    if (equipment.maintenanceStatus === "inactive") {
      return "Maintenance Tidak Aktif";
    }

    if (equipment.maintenanceStatus === "selesai") {
      return "Selesai";
    }

    return "Status Maintenance";
  };

  // Determine alert level based on new maintenance status
  const alertLevel = equipment.maintenanceAlertLevel || "none";

  const colors = getStatusColor(alertLevel);

  if (showDetails) {
    return (
      <div className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className={`w-3 h-3 ${colors.dot} rounded-full mr-2`}></span>
            <span className={`font-semibold ${colors.text}`}>
              {getDetailedStatusText()}
            </span>
          </div>
          <span className={`text-sm font-medium ${colors.text}`}>
            {getStatusText()}
          </span>
        </div>

        <div className={`text-sm ${colors.text} space-y-1`}>
          <div>
            <span className="font-medium">Terakhir Maintenance:</span>{" "}
            {equipment.maintenanceDate
              ? new Date(equipment.maintenanceDate).toLocaleDateString("id-ID")
              : "Belum ada data"}
          </div>
          <div>
            <span className="font-medium">Maintenance Berikutnya:</span>{" "}
            {equipment.nextMaintenanceDate
              ? new Date(equipment.nextMaintenanceDate).toLocaleDateString(
                  "id-ID"
                )
              : "Belum dijadwalkan"}
          </div>
          <div>
            <span className="font-medium">Interval:</span>{" "}
            {equipment.maintenanceInterval || 90} hari
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`w-2 h-2 ${colors.dot} rounded-full mr-2`}></span>
      {getStatusText()}
    </div>
  );
};

export default MaintenanceStatus;
