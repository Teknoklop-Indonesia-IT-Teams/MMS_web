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
  // Tentukan apakah maintenance aktif (handle semua kemungkinan)
  const isMaintenanceActive = (() => {
    const value = equipment.isMaintenanceActive;

    // Jika sudah ada status 'selesai', anggap aktif untuk status display
    if (equipment.maintenanceStatus === "selesai") {
      return true;
    }

    // Handle berbagai tipe data
    if (
      value === true ||
      value === 1 ||
      String(value) === "1" ||
      String(value) === "true"
    ) {
      return true;
    }

    if (
      value === false ||
      value === 0 ||
      String(value) === "0" ||
      String(value) === "false"
    ) {
      return false;
    }

    // Default jika tidak ada data
    return false;
  })();

  // Jika status selesai, tampilkan selesai
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
                    "id-ID",
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

  // Jika tidak aktif
  if (!isMaintenanceActive) {
    return (
      <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
        <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
        Tidak Aktif
      </div>
    );
  }

  // Tentukan status berdasarkan data yang ada
  const getStatusInfo = () => {
    // Prioritaskan maintenanceStatusText jika ada
    if (equipment.maintenanceStatusText) {
      return {
        text: equipment.maintenanceStatusText,
        type: equipment.maintenanceStatus || "unknown",
      };
    }

    // Gunakan maintenanceStatus jika ada
    if (equipment.maintenanceStatus) {
      const status = equipment.maintenanceStatus.toLowerCase();
      const daysLeft = equipment.maintenanceDaysLeft || 0;

      switch (status) {
        case "overdue":
          return {
            text: "Terlambat maintenance",
            type: "overdue",
          };
        case "urgent":
          return {
            text: `${daysLeft} hari lagi (Urgent)`,
            type: "urgent",
          };
        case "needed":
        case "warning":
          return {
            text: `${daysLeft} hari lagi (Diperlukan)`,
            type: "warning",
          };
        case "good":
        case "normal":
          return {
            text: `${daysLeft} hari lagi`,
            type: "good",
          };
        case "inactive":
          return {
            text: "Tidak Aktif",
            type: "inactive",
          };
        default:
          return {
            text: "Status tidak diketahui",
            type: "unknown",
          };
      }
    }

    // Default jika tidak ada data
    return {
      text: "Status maintenance",
      type: "unknown",
    };
  };

  const statusInfo = getStatusInfo();

  const getColors = (type: string) => {
    switch (type) {
      case "overdue":
      case "urgent":
      case "red":
        return {
          bg: "bg-red-100 dark:bg-red-900",
          text: "text-red-800 dark:text-red-200",
          dot: "bg-red-500",
          border: "border-red-200 dark:border-red-700",
        };
      case "warning":
      case "needed":
      case "yellow":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          text: "text-yellow-800 dark:text-yellow-200",
          dot: "bg-yellow-500",
          border: "border-yellow-200 dark:border-yellow-700",
        };
      case "good":
      case "normal":
      case "green":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-800 dark:text-green-200",
          dot: "bg-green-500",
          border: "border-green-200 dark:border-green-700",
        };
      case "blue":
      case "selesai":
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

  const colors = getColors(statusInfo.type);

  if (showDetails) {
    return (
      <div className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className={`w-3 h-3 ${colors.dot} rounded-full mr-2`}></span>
            <span className={`font-semibold ${colors.text}`}>
              Status Maintenance
            </span>
          </div>
          <span className={`text-sm font-medium ${colors.text}`}>
            {statusInfo.text}
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
                  "id-ID",
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
      {statusInfo.text}
    </div>
  );
};

export default MaintenanceStatus;
