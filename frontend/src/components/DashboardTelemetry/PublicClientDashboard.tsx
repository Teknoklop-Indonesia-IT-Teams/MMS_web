import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Filter,
  ChevronDown,
  ChartNoAxesCombined,
  ChartPie,
  History,
} from "lucide-react";
import DeviceCard from "./DeviceCard";
import MaintenanceDashboard from "./MaintenanceDashboard";
import PMDashboard from "./PMDashboard";
import CMDashboard from "./CMDashboard";
import StatusBarChart from "../Stats/BarCharts";
import LocationPieChart from "../Stats/LineChart";
import { publicAlatService, telemetryService } from "../../services/api";
import { Equipment } from "../../types";

const PublicClientDashboard: React.FC = () => {
  const { nama_client } = useParams<{ nama_client: string }>();
  const clientName = nama_client ? decodeURIComponent(nama_client) : "";

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [telemetryList, setTelemetryList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 5;

  useEffect(() => {
    if (!clientName) return;

    setLoading(true);
    setNotFound(false);

    Promise.all([
      publicAlatService.getByClient(clientName),
      telemetryService.getAll(),
    ])
      .then(([alatRes, telemetry]) => {
        if (!alatRes.success) {
          setNotFound(true);
          return;
        }
        setEquipment(alatRes.data);
        setTelemetryList(telemetry);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [clientName]);

  const equipmentCountByType = useMemo(() => {
    return equipment.reduce(
      (acc, curr) => {
        const jenis = curr.jenis?.trim();
        if (!jenis) return acc;
        acc[jenis] = (acc[jenis] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [equipment]);

  const telemetryCards = useMemo(() => {
    return telemetryList.map((t) => ({
      type: t.name,
      count: equipmentCountByType[t.name] || 0,
    }));
  }, [telemetryList, equipmentCountByType]);

  const deviceTypes = telemetryList
    .filter((t) => (equipmentCountByType[t.name] || 0) > 0)
    .map((t) => t.name);

  const filteredEquipment = useMemo(() => {
    if (selectedFilter === "all") return equipment;
    return equipment.filter((item) => item.jenis === selectedFilter);
  }, [equipment, selectedFilter]);

  const locationChartData = useMemo(() => {
    const base =
      selectedFilter === "all"
        ? telemetryCards
        : telemetryCards.filter((c) => c.type === selectedFilter);
    return base.map(({ type, count }) => ({ name: type, value: count }));
  }, [telemetryCards, selectedFilter]);

  const getMaintenanceStats = (data: Equipment[]) => {
    let selesai = 0, urgent = 0, warning = 0, normal = 0, inactive = 0;
    data.forEach((item) => {
      if (item.maintenanceStatus === "selesai") { selesai++; return; }
      if (!Boolean(item.isMaintenanceActive)) { inactive++; return; }
      const days = item.maintenanceDaysLeft;
      if (days === null || days === undefined) { inactive++; return; }
      if (days <= 14) urgent++;
      else if (days <= 30) warning++;
      else normal++;
    });
    return { selesai, urgent, warning, normal, inactive };
  };

  const maintenanceStats = getMaintenanceStats(filteredEquipment);
  const hasActiveFilter = selectedFilter !== "all";

  const statusChartData = [
    { name: "Segera (≤14 Hari)", value: maintenanceStats.urgent },
    { name: "Perhatian (≤30 Hari)", value: maintenanceStats.warning },
    { name: "Normal (>30 Hari)", value: maintenanceStats.normal },
    { name: "Selesai", value: maintenanceStats.selesai },
    { name: "Tidak Aktif", value: maintenanceStats.inactive },
  ];

  const statusColors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#6b7280"];

  const activityTotalPages = Math.ceil(filteredEquipment.length / activityPerPage);
  const activityStart = (activityPage - 1) * activityPerPage;
  const paginatedActivity = filteredEquipment.slice(activityStart, activityStart + activityPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-6xl font-bold text-gray-300 mb-4">404</p>
          <p className="text-xl text-gray-600 font-semibold">Client tidak ditemukan</p>
          <p className="text-gray-400 mt-2">
            Tidak ada data untuk client <span className="font-medium">"{clientName}"</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center text-2xl font-bold text-gray-800">
              <span className="mr-2"><BarChart /></span>
              Dashboard Telemetry
            </h1>
            <p className="text-gray-600 mt-1">
              Client: <span className="font-semibold text-blue-600">{clientName}</span>
            </p>
          </div>

          <div className="flex items-center justify-between w-full px-4 py-2 space-x-2 bg-white border border-gray-200 rounded-lg shadow-sm md:w-auto">
            <Filter size={20} className="text-gray-500" />
            <div className="relative flex-grow">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-900 transition-colors rounded hover:bg-gray-100"
              >
                <span>{selectedFilter === "all" ? "Semua Jenis" : selectedFilter}</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
                  <button
                    onClick={() => { setSelectedFilter("all"); setShowDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-gray-900 transition-colors hover:bg-gray-100 first:rounded-t-lg"
                  >
                    Semua Jenis
                  </button>
                  {deviceTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => { setSelectedFilter(type); setShowDropdown(false); }}
                      className="w-full px-4 py-2 text-left text-gray-900 transition-colors hover:bg-gray-100"
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
        {telemetryCards.filter((c) => c.count > 0).length > 0 ? (
          telemetryCards.filter((c) => c.count > 0).map(({ type, count }) => (
            <DeviceCard
              key={type}
              type={type}
              count={count}
              onClick={() => setSelectedFilter(selectedFilter === type ? "all" : type)}
              isSelected={selectedFilter === type}
              hasActiveFilter={hasActiveFilter}
            />
          ))
        ) : (
          <div className="py-8 text-center col-span-full">
            <p className="text-lg text-gray-500">Tidak ada peralatan terdaftar</p>
          </div>
        )}
      </div>

      {/* Maintenance Dashboard */}
      <MaintenanceDashboard equipment={filteredEquipment} />

      {/* PM & CM Dashboard */}
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

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <ChartNoAxesCombined />
            <span className="ml-2">Status Peralatan</span>
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full">
                {selectedFilter}
              </span>
            )}
          </h3>
          <StatusBarChart statusChartData={statusChartData} colors={statusColors} />
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <ChartPie />
            <span className="ml-2">Peralatan Berdasarkan Jenis</span>
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full">
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

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <History />
            <span className="ml-2">Aktivitas Terbaru</span>
            {hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full">
                {selectedFilter}
              </span>
            )}
          </h3>
          <div className="space-y-3 text-sm">
            {paginatedActivity.length > 0 ? (
              paginatedActivity.map((item, index) => {
                let color = "bg-yellow-500";
                let statusText = "Maintenance";
                if (item.remot === "on") { color = "bg-green-500"; statusText = "Data normal"; }
                else if (item.status === "habis") { color = "bg-red-500"; statusText = "Garansi habis"; }

                return (
                  <div key={`${item.id}-${index}`} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${color} rounded-full`}></div>
                    <span className="text-gray-600">
                      {item.jenis} {item.lokasi} - {statusText}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-500">
                  {hasActiveFilter ? `Tidak ada aktivitas untuk ${selectedFilter}` : "Tidak ada aktivitas terbaru"}
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

export default PublicClientDashboard;
