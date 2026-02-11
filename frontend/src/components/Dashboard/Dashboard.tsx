import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  BarChart,
  MapPinned,
  History,
  ChevronDown,
} from "lucide-react";
import DeviceCard from "./DeviceCard";
import MaintenanceDashboard from "./MaintenanceDashboard";
import { useDashboardData } from "../../hooks/useLazyEquipment";
import { Equipment } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/roles";
import StatusBarChart from "../Stats/BarCharts";
import LocationPieChart from "../Stats/LineChart";
import PMDashboard from "./PMDashboard";
import CMDashboard from "./CMDashboard";

const Dashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use lazy loading dashboard data - only fetch when dashboard is opened
  const { loading, isDataLoaded, stats, equipment } = useDashboardData();

  const { user } = useAuth();

  const userRole = user?.role || "";
  const hasFullAccess = PERMISSIONS.DASHBOARD_FULL_ACCESS.includes(
    userRole as "admin" | "manager",
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const equipmentByType = equipment.reduce(
    (acc, curr) => {
      acc[curr.jenis] = (acc[curr.jenis] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number },
  );

  const deviceTypes = Object.keys(equipmentByType);

  const handleCardClick = (type: string) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    if (selectedFilter === type) {
      setSelectedFilter("all");
    } else {
      const timeout = setTimeout(() => {
        setSelectedFilter(type);
        setClickTimeout(null);
      }, 200);

      setClickTimeout(timeout);
    }
  };

  // Filter data berdasarkan selectedFilter
  const filteredData = useMemo(() => {
    return equipmentByType;
  }, [equipmentByType]);

  // Filter equipment berdasarkan jenis yang dipilih
  const filteredEquipment = useMemo(() => {
    if (selectedFilter === "all") {
      return equipment;
    } else {
      return equipment.filter((item) => item.jenis === selectedFilter);
    }
  }, [equipment, selectedFilter]);

  const locationChartData = Object.entries(
    filteredEquipment.reduce(
      (acc, curr) => {
        acc[curr.lokasi] = (acc[curr.lokasi] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  // Cek apakah ada filter aktif
  const hasActiveFilter = selectedFilter !== "all";

  const statusChartData = [
    {
      name: "Maintenance Aktif",
      value: hasActiveFilter
        ? filteredEquipment.filter((e) => e.isMaintenanceActive).length
        : stats.maintenanceActive,
    },
    {
      name: "Segera (≤ 14 Hari)",
      value: hasActiveFilter
        ? filteredEquipment.filter((e) => e.maintenanceAlertLevel === "red")
            .length
        : stats.alertCounts.red,
    },
    {
      name: "Perhatian (≤ 30 Hari)",
      value: hasActiveFilter
        ? filteredEquipment.filter((e) => e.maintenanceAlertLevel === "yellow")
            .length
        : stats.alertCounts.yellow,
    },
    {
      name: "Selesai",
      value: hasActiveFilter
        ? filteredEquipment.filter((e) => e.maintenanceAlertLevel === "blue")
            .length
        : stats.alertCounts.blue,
    },
  ];

  const statusColors = ["#f87171", "#fb923c", "#fbbf24", "#60a5fa"];

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
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center text-2xl font-bold text-gray-800 dark:text-gray-200">
              <span className="mr-2">
                <BarChart />
              </span>
              Dashboard
              {!hasFullAccess && (
                <span className="px-2 py-1 ml-3 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  View Only
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Control panel</p>
          </div>

          <div className="flex items-center justify-between w-full px-4 py-2 space-x-2 bg-white border border-gray-200 rounded-lg shadow-sm md:w-auto dark:bg-gray-800 dark:border-gray-600">
            <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            <div className="relative flex-grow">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-900 transition-colors rounded dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>
                  {selectedFilter === "all" ? "Semua Jenis" : selectedFilter}
                </span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showDropdown && (
                <div className="absolute left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full dark:bg-gray-700 dark:border-gray-600">
                  <button
                    onClick={() => {
                      setSelectedFilter("all");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-900 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg dark:text-gray-100"
                  >
                    Semua Jenis
                  </button>
                  {deviceTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedFilter(type);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-900 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device Cards */}
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

      {/* History Maintenance Section */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        <PMDashboard
          selectedFilter={selectedFilter}
          hasActiveFilter={hasActiveFilter}
          equipment={filteredEquipment}
        />
        <CMDashboard
          selectedFilter={selectedFilter}
          hasActiveFilter={hasActiveFilter}
          equipment={filteredEquipment}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Status Peralatan
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                {selectedFilter}
              </span>
            )}
          </h3>
          <StatusBarChart
            statusChartData={statusChartData}
            colors={statusColors}
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <MapPinned />{" "}
            <span className="ml-2">Peralatan Berdasarkan Lokasi</span>
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                {selectedFilter}
              </span>
            )}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <LocationPieChart data={locationChartData} />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <History /> <span className="ml-2">Aktivitas Terbaru</span>
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
