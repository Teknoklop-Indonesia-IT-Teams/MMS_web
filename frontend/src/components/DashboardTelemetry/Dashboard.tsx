import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  BarChart,
  ChartNoAxesCombined,
  History,
  ChevronDown,
  ChartPie,
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
import { telemetryService } from "../../services/api";

interface DashboardProps {
  hideEmptyCards?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ hideEmptyCards = false }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 5;
  const [telemetryList, setTelemetryList] = useState<{ id: number; name: string }[]>([]);
  const { loading, isDataLoaded, stats, equipment } = useDashboardData();

  const { user } = useAuth();

  const userRole = user?.role || "";
  const hasFullAccess = PERMISSIONS.DASHBOARD_FULL_ACCESS.includes(
    userRole as "admin" | "manager",
  );

  useEffect(() => {
    telemetryService.getAll().then(setTelemetryList).catch(() => setTelemetryList([]));
  }, []);

  useEffect(() => {
    console.log("Dashboard equipment count:", equipment.length);
  }, [equipment]);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const equipmentCountByType = useMemo(() => {
    return equipment.reduce(
      (acc, curr) => {
        const jenis = curr.jenis?.trim();
        if (!jenis) return acc;
        acc[jenis] = (acc[jenis] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );
  }, [equipment]);

  const telemetryCards = useMemo(() => {
    return telemetryList.map((t) => ({
      type: t.name,
      count: equipmentCountByType[t.name] || 0,
    }));
  }, [telemetryList, equipmentCountByType]);

  const deviceTypes = hideEmptyCards
    ? telemetryList.filter((t) => (equipmentCountByType[t.name] || 0) > 0).map((t) => t.name)
    : telemetryList.map((t) => t.name);

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

  const getMaintenanceStats = (data: Equipment[]) => {
    let selesai = 0;
    let urgent = 0;
    let warning = 0;
    let normal = 0;
    let inactive = 0;

    data.forEach((item) => {
      const isActive = Boolean(item.isMaintenanceActive);

      if (item.maintenanceStatus === "selesai") {
        selesai++;
        return;
      }

      if (!isActive) {
        inactive++;
        return;
      }

      const days = item.maintenanceDaysLeft;

      if (days === null || days === undefined) {
        inactive++;
        return;
      }

      if (days <= 14) {
        urgent++;
      } else if (days <= 30) {
        warning++;
      } else {
        normal++;
      }
    });

    return { selesai, urgent, warning, normal, inactive };
  };

  const filteredData = useMemo(() => {
    return hideEmptyCards ? telemetryCards.filter((c) => c.count > 0) : telemetryCards;
  }, [telemetryCards, hideEmptyCards]);

  const filteredEquipment = useMemo(() => {
    if (selectedFilter === "all") {
      return equipment;
    } else {
      return equipment.filter((item) => item.jenis === selectedFilter);
    }
  }, [equipment, selectedFilter]);

  const locationChartData = useMemo(() => {
    const base = selectedFilter === "all"
      ? telemetryCards
      : telemetryCards.filter((c) => c.type === selectedFilter);
    return base.map(({ type, count }) => ({ name: type, value: count }));
  }, [telemetryCards, selectedFilter]);

  const hasActiveFilter = selectedFilter !== "all";

  const maintenanceStats = getMaintenanceStats(filteredEquipment);

  const statusChartData = [
    {
      name: "Segera (≤14 Hari)",
      value: maintenanceStats.urgent,
    },
    {
      name: "Perhatian (≤30 Hari)",
      value: maintenanceStats.warning,
    },
    {
      name: "Normal (>30 Hari)",
      value: maintenanceStats.normal,
    },
    {
      name: "Selesai",
      value: maintenanceStats.selesai,
    },
    {
      name: "Tidak Aktif",
      value: maintenanceStats.inactive,
    },
  ];

  const activityTotalPages = Math.ceil(
    filteredEquipment.length / activityPerPage,
  );

  const activityStart = (activityPage - 1) * activityPerPage;

  const paginatedActivity = filteredEquipment.slice(
    activityStart,
    activityStart + activityPerPage,
  );

  const statusColors = [
    "#ef4444",
    "#f59e0b",
    "#22c55e",
    "#3b82f6", 
    "#6b7280", 
  ];

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
        {filteredData.length > 0 ? (
          filteredData.map(({ type, count }) => (
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
            <ChartNoAxesCombined />{" "}
            <span className="ml-2">Status Peralatan</span>
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
            <ChartPie />{" "}
            <span className="ml-2">Peralatan Berdasarkan Jenis</span>
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
            {paginatedActivity.length > 0 ? (
              paginatedActivity.map((item, index) => {
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
            {activityTotalPages > 1 && (
              <div className="flex justify-between mt-3">
                <button
                  disabled={activityPage === 1}
                  onClick={() => setActivityPage((prev) => prev - 1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-xs text-gray-500">
                  {activityPage} / {activityTotalPages}
                </span>

                <button
                  disabled={activityPage === activityTotalPages}
                  onClick={() => setActivityPage((prev) => prev + 1)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
