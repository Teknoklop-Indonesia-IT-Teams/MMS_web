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
        return {
          bg: "bg-red-100 dark:bg-red-900",
          text: "text-red-800 dark:text-red-200",
          dot: "bg-red-500",
          border: "border-red-200 dark:border-red-700",
        };
      case "yellow":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          text: "text-yellow-800 dark:text-yellow-200",
          dot: "bg-yellow-500",
          border: "border-yellow-200 dark:border-yellow-700",
        };
      case "green":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-800 dark:text-green-200",
          dot: "bg-green-500",
          border: "border-green-200 dark:border-green-700",
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
    // Handle different maintenance statuses from backend
    if (equipment.maintenanceStatus === "selesai") {
      return "Maintenance Selesai";
    }

    if (equipment.maintenanceStatus === "active") {
      // For active maintenance, show countdown with alert level context
      const daysLeft = equipment.maintenanceDaysLeft || 0;

      if (equipment.maintenanceAlertLevel === "red") {
        if (daysLeft <= 0) {
          return "Maintenance hari ini";
        } else if (daysLeft <= 7) {
          return `${daysLeft} hari lagi (Urgent)`;
        } else {
          return `${daysLeft} hari lagi (Segera)`;
        }
      }

      if (equipment.maintenanceAlertLevel === "yellow") {
        return `${daysLeft} hari lagi (Diperlukan)`;
      }

      if (equipment.maintenanceAlertLevel === "green") {
        if (daysLeft > 60) {
          return `${daysLeft} hari lagi (Normal)`;
        } else {
          return `${daysLeft} hari lagi`;
        }
      }

      return `${daysLeft} hari lagi`;
    }

    if (equipment.maintenanceStatus === "inactive") {
      return "Tidak Aktif";
    }

    // Fallback for days-based calculation if available
    if (equipment.maintenanceDaysLeft === 0) {
      return "Hari ini";
    }
    if (equipment.maintenanceDaysLeft && equipment.maintenanceDaysLeft > 0) {
      return `${equipment.maintenanceDaysLeft} hari lagi`;
    }

    return "Belum ada data";
  };

  const getDetailedStatusText = () => {
    if (equipment.maintenanceStatus === "selesai") {
      return "Maintenance Selesai";
    }

    if (equipment.maintenanceStatus === "active") {
      const daysLeft = equipment.maintenanceDaysLeft || 0;

      if (equipment.maintenanceAlertLevel === "red") {
        if (daysLeft <= 0) {
          return "Maintenance Hari Ini";
        } else if (daysLeft <= 7) {
          return "Maintenance Urgent";
        } else {
          return "Maintenance Segera";
        }
      }
      if (equipment.maintenanceAlertLevel === "yellow") {
        return "Maintenance Diperlukan";
      }
      if (equipment.maintenanceAlertLevel === "green") {
        return "Maintenance Terjadwal";
      }
      return "Maintenance Aktif";
    }

    if (equipment.maintenanceStatus === "inactive") {
      return "Maintenance Tidak Aktif";
    }

    return "Maintenance Normal";
  };

  const colors = getStatusColor(equipment.maintenanceAlertLevel || "none");

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
