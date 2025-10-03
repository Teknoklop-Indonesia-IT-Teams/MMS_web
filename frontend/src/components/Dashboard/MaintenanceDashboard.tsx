import React, { useState } from "react";
import { Equipment } from "../../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Activity,
  Calendar,
} from "lucide-react";

interface MaintenanceDashboardProps {
  equipment: Equipment[];
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  equipment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getMaintenanceStats = () => {
    let selesai = 0;
    let urgent = 0; // <= 14 days
    let warning = 0; // <= 30 days
    let normal = 0; // > 30 days
    let inactive = 0;

    // Arrays untuk tracking equipment per kategori
    const urgentEquipment: Equipment[] = [];
    const warningEquipment: Equipment[] = [];
    const normalEquipment: Equipment[] = [];
    const selesaiEquipment: Equipment[] = [];

    equipment.forEach((item) => {
      // Convert to boolean properly - handle both 0/1 and true/false
      const isMaintenanceActive = Boolean(item.isMaintenanceActive);

      // Check for completed maintenance FIRST before checking if maintenance is active
      if (item.maintenanceStatus === "selesai") {
        selesai++;
        selesaiEquipment.push(item);
        return;
      }

      if (!isMaintenanceActive) {
        inactive++;
        return;
      }

      switch (item.maintenanceAlertLevel) {
        case "red":
          urgent++;
          urgentEquipment.push(item);
          break;
        case "yellow":
          warning++;
          warningEquipment.push(item);
          break;
        case "green":
          normal++;
          normalEquipment.push(item);
          break;
        case "blue":
          // Blue alert level indicates completed maintenance
          selesai++;
          selesaiEquipment.push(item);
          break;
        default:
          // Equipment without specific maintenance alert level
          inactive++;
      }
    });

    // DEBUG LOG: Show exactly which equipment is in each category
    console.log("🏠 DASHBOARD STATS CALCULATION:");
    console.log(
      `  🔴 URGENT (${urgent}):`,
      urgentEquipment.map((eq) => ({
        nama: eq.nama,
        id: eq.id,
        alertLevel: eq.maintenanceAlertLevel,
        daysLeft: eq.maintenanceDaysLeft,
        status: eq.maintenanceStatus,
      }))
    );
    console.log(
      `  🟡 WARNING (${warning}):`,
      warningEquipment.map((eq) => ({
        nama: eq.nama,
        id: eq.id,
        alertLevel: eq.maintenanceAlertLevel,
        daysLeft: eq.maintenanceDaysLeft,
      }))
    );
    console.log(
      `  🟢 NORMAL (${normal}):`,
      normalEquipment.map((eq) => ({
        nama: eq.nama,
        id: eq.id,
        alertLevel: eq.maintenanceAlertLevel,
        daysLeft: eq.maintenanceDaysLeft,
      }))
    );

    return { selesai, urgent, warning, normal, inactive };
  };

  const stats = getMaintenanceStats();
  const total = equipment.length;
  const activeMaintenanceCount = total - stats.inactive;

  // Helper function to check if equipment matches category
  const getWillMatchCategory = (item: Equipment, category: string) => {
    switch (category) {
      case "selesai":
        return (
          item.maintenanceStatus === "selesai" ||
          (Boolean(item.isMaintenanceActive) && item.maintenanceAlertLevel === "blue")
        );
      case "urgent":
        return (
          Boolean(item.isMaintenanceActive) &&
          item.maintenanceAlertLevel === "red" &&
          item.maintenanceStatus !== "selesai"
        );
      case "warning":
        return (
          Boolean(item.isMaintenanceActive) &&
          item.maintenanceAlertLevel === "yellow"
        );
      case "normal":
        return (
          Boolean(item.isMaintenanceActive) &&
          item.maintenanceAlertLevel === "green"
        );
      case "inactive":
        return !item.isMaintenanceActive;
      default:
        return false;
    }
  };

  // Get equipment by category for detail view
  const getEquipmentByCategory = (category: string) => {
    // Debug specific equipment before filtering
    const debugEquipment = equipment.filter(
      (item) =>
        item.nama === "scsC" ||
        item.nama === "WQMS Sungai Progo Magelang" ||
        item.nama === "acafaaf"
    );

    if (debugEquipment.length > 0) {
      console.log(
        `🏠 DASHBOARD - Debug equipment for category "${category}":`,
        debugEquipment.map((item) => ({
          nama: item.nama,
          maintenanceAlertLevel: item.maintenanceAlertLevel,
          maintenanceDaysLeft: item.maintenanceDaysLeft,
          isMaintenanceActive: item.isMaintenanceActive,
          maintenanceStatus: item.maintenanceStatus,
          willMatchCategory: getWillMatchCategory(item, category),
        }))
      );
    }

    switch (category) {
      case "selesai":
        return equipment.filter(
          (item) =>
            item.maintenanceStatus === "selesai" ||
            (Boolean(item.isMaintenanceActive) && item.maintenanceAlertLevel === "blue")
        );
      case "urgent":
        return equipment.filter(
          (item) =>
            Boolean(item.isMaintenanceActive) &&
            item.maintenanceAlertLevel === "red" &&
            item.maintenanceStatus !== "selesai"
        );
      case "warning":
        return equipment.filter(
          (item) =>
            Boolean(item.isMaintenanceActive) &&
            item.maintenanceAlertLevel === "yellow"
        );
      case "normal":
        return equipment.filter(
          (item) =>
            Boolean(item.isMaintenanceActive) &&
            item.maintenanceAlertLevel === "green"
        );
      case "inactive":
        return equipment.filter((item) => !item.isMaintenanceActive);
      default:
        return [];
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  const StatCard: React.FC<{
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    textColor: string;
    category: string;
  }> = ({ title, count, icon, color, bgColor, textColor, category }) => (
    <div
      className={`${bgColor} p-4 rounded-lg border-l-4 ${color} cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
      onClick={() => handleCategoryClick(category)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor}`}>{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {count}
          </p>
        </div>
        <div
          className={`p-2 rounded-full ${bgColor
            .replace("bg-", "bg-")
            .replace("-50", "-100")}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        Klik untuk detail
      </div>
    </div>
  );

  return (
    <div className="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Status Maintenance Peralatan
      </h2>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Selesai"
          count={stats.selesai}
          icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
          color="border-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          textColor="text-blue-700 dark:text-blue-300"
          category="selesai"
        />
        <StatCard
          title="Segera (≤14 hari)"
          count={stats.urgent}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="border-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          textColor="text-orange-700 dark:text-orange-300"
          category="urgent"
        />
        <StatCard
          title="Perhatian (≤30 hari)"
          count={stats.warning}
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          color="border-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          textColor="text-yellow-700 dark:text-yellow-300"
          category="warning"
        />
        <StatCard
          title="Normal (>30 hari)"
          count={stats.normal}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="border-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
          textColor="text-green-700 dark:text-green-300"
          category="normal"
        />
        <StatCard
          title="Tidak Aktif"
          count={stats.inactive}
          icon={<XCircle className="w-6 h-6 text-gray-600" />}
          color="border-gray-500"
          bgColor="bg-gray-50 dark:bg-gray-900/20"
          textColor="text-gray-700 dark:text-gray-300"
          category="inactive"
        />
      </div>

      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total Peralatan:</span>
          <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span>Maintenance Aktif:</span>
          <span className="font-medium">{activeMaintenanceCount}</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span>Perlu Perhatian:</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            {stats.selesai + stats.urgent}
          </span>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Detail{" "}
                {selectedCategory === "selesai"
                  ? "Maintenance Selesai"
                  : selectedCategory === "urgent"
                  ? "Maintenance Segera"
                  : selectedCategory === "warning"
                  ? "Maintenance Perhatian"
                  : selectedCategory === "normal"
                  ? "Maintenance Normal"
                  : "Equipment Tidak Aktif"}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {getEquipmentByCategory(selectedCategory).map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.nama}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{item.lokasi}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Activity className="w-4 h-4 mr-1" />
                        <span>Device: {item.device}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            item.status?.toLowerCase() === "garansi"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Jenis:
                        </span>
                        <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          {item.jenis}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Pelanggan:
                        </span>
                        <span className="ml-2">{item.pelanggan}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {item.isMaintenanceActive && (
                        <>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              {item.maintenanceDaysLeft !== null &&
                              item.maintenanceDaysLeft !== undefined
                                ? `${Math.abs(item.maintenanceDaysLeft)} hari ${
                                    item.maintenanceDaysLeft < 0
                                      ? "terlambat"
                                      : "tersisa"
                                  }`
                                : "Tidak ada data"}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Status Maintenance:
                            </span>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                item.maintenanceAlertLevel === "red"
                                  ? "bg-red-100 text-red-800"
                                  : item.maintenanceAlertLevel === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.maintenanceAlertLevel === "green"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.maintenanceStatus}
                            </span>
                          </div>
                          {item.nextMaintenanceDate && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span>Maintenance Berikutnya:</span>
                              <span className="ml-2 font-medium">
                                {item.nextMaintenanceDate}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {!item.isMaintenanceActive && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Maintenance tidak aktif
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {getEquipmentByCategory(selectedCategory).length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada peralatan dalam kategori ini
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
