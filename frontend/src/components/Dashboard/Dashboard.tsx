import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import DeviceCard from "./DeviceCard";
import MaintenanceDashboard from "./MaintenanceDashboard";
import { useDashboardData } from "../../hooks/useLazyEquipment";
import { Equipment } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/roles";

const Dashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use lazy loading dashboard data - only fetch when dashboard is opened
  const { loading, isDataLoaded, stats, equipment } = useDashboardData();

  const { user } = useAuth();

  // Check if user has full dashboard access (admin/supervisor) or read-only (operator/maintenance)
  const userRole = user?.role || "";
  const hasFullAccess = PERMISSIONS.DASHBOARD_FULL_ACCESS.includes(
    userRole as "admin" | "supervisor"
  );
  const hasReadOnlyAccess = PERMISSIONS.DASHBOARD_READ_ONLY.includes(
    userRole as "operator" | "maintenance"
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const equipmentByType = equipment.reduce((acc, curr) => {
    acc[curr.jenis] = (acc[curr.jenis] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const deviceTypes = Object.keys(equipmentByType);

  const handleCardClick = (type: string) => {
    // Clear existing timeout if any
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    // Check if this is a double click (same card clicked twice quickly)
    if (selectedFilter === type) {
      // Double click: unselect (reset to "all")
      setSelectedFilter("all");
    } else {
      // Single click: use timeout to distinguish from potential double click
      const timeout = setTimeout(() => {
        setSelectedFilter(type);
        setClickTimeout(null);
      }, 200); // 200ms delay to catch double clicks

      setClickTimeout(timeout);
    }
  };

  // Filter data berdasarkan selectedFilter
  const filteredData = React.useMemo(() => {
    // Selalu tampilkan semua data untuk konteks visual
    return equipmentByType;
  }, [equipmentByType]);

  // Filter equipment berdasarkan jenis yang dipilih
  const filteredEquipment = React.useMemo(() => {
    if (selectedFilter === "all") {
      return equipment;
    } else {
      return equipment.filter((item) => item.jenis === selectedFilter);
    }
  }, [equipment, selectedFilter]);

  // Cek apakah ada filter aktif
  const hasActiveFilter = selectedFilter !== "all";

  // Show loading state
  if (loading && !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="flex items-center text-2xl font-bold text-gray-800 dark:text-gray-200">
              <span className="mr-2">📊</span>
              Dashboard
              {hasReadOnlyAccess && !hasFullAccess && (
                <span className="px-2 py-1 ml-3 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  View Only
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Control panel</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center px-4 py-2 space-x-2 transition-colors duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-600">
              <Filter size={20} className="text-gray-500 dark:text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border-none bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100 [&>option]:bg-white [&>option]:text-gray-900"
              >
                <option
                  value="all"
                  className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
                >
                  Semua Jenis
                </option>
                {deviceTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(filteredData).length > 0 ? (
          Object.entries(filteredData).map(([type, count]) => (
            <DeviceCard
              key={type}
              type={type}
              count={count}
              onClick={() => handleCardClick(type)}
              isSelected={selectedFilter === type}
              hasActiveFilter={hasActiveFilter}
            />
          ))
        ) : (
          <div className="py-8 text-center col-span-full">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Tidak ada data untuk jenis peralatan "{selectedFilter}"
            </p>
          </div>
        )}
      </div>

      {/* Maintenance Dashboard */}
      <MaintenanceDashboard equipment={filteredEquipment} />

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-3">
        <div className="p-6 transition-colors duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            📊 Status Peralatan
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                {selectedFilter}
              </span>
            )}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Peralatan
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {hasActiveFilter
                  ? filteredEquipment.length
                  : stats.totalEquipment}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Maintenance Aktif
              </span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                {hasActiveFilter
                  ? filteredEquipment.filter((e) => e.isMaintenanceActive)
                      .length
                  : stats.maintenanceActive}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Alert Merah
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {hasActiveFilter
                  ? filteredEquipment.filter(
                      (e) => e.maintenanceAlertLevel === "red"
                    ).length
                  : stats.alertCounts.red}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Alert Kuning
              </span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {hasActiveFilter
                  ? filteredEquipment.filter(
                      (e) => e.maintenanceAlertLevel === "yellow"
                    ).length
                  : stats.alertCounts.yellow}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Selesai Maintenance
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {hasActiveFilter
                  ? filteredEquipment.filter(
                      (e) => e.maintenanceAlertLevel === "blue"
                    ).length
                  : stats.alertCounts.blue}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 transition-colors duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            📍 Peralatan Berdasarkan Lokasi
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                {selectedFilter}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {Object.entries(
              filteredEquipment.reduce((acc, curr) => {
                acc[curr.lokasi] = (acc[curr.lokasi] || 0) + 1;
                return acc;
              }, {} as { [key: string]: number })
            ).length > 0 ? (
              Object.entries(
                filteredEquipment.reduce((acc, curr) => {
                  acc[curr.lokasi] = (acc[curr.lokasi] || 0) + 1;
                  return acc;
                }, {} as { [key: string]: number })
              ).map(([location, count], index) => (
                <div key={location} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {location}
                  </span>
                  <span
                    className={`${
                      index % 3 === 0
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        : index % 3 === 1
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                    } px-2 py-1 rounded`}
                  >
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hasActiveFilter
                    ? `Tidak ada data lokasi untuk ${selectedFilter}`
                    : "Tidak ada data lokasi"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 transition-colors duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            🔄 Aktivitas Terbaru
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                {selectedFilter}
              </span>
            )}
          </h3>
          <div className="space-y-3 text-sm">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.slice(0, 5).map((item, index) => {
                // Generate status berdasarkan data peralatan
                const getStatusInfo = (equipment: Equipment) => {
                  if (equipment.remot === "on") {
                    return {
                      color: "bg-green-500",
                      status: "Data normal",
                    };
                  } else if (equipment.status === "habis") {
                    return {
                      color: "bg-red-500",
                      status: "Garansi habis",
                    };
                  } else {
                    return {
                      color: "bg-yellow-500",
                      status: "Maintenance",
                    };
                  }
                };

                const statusInfo = getStatusInfo(item);

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={`w-2 h-2 ${statusInfo.color} rounded-full`}
                    ></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.jenis} {item.lokasi} - {statusInfo.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilter
                    ? `Tidak ada aktivitas untuk ${selectedFilter}`
                    : "Tidak ada aktivitas terbaru"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
