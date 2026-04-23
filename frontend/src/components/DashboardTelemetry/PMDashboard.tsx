import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  History,
  Calendar,
  AlertCircle,
  User,
  CheckCircle,
  Eye,
  Wrench,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
} from "lucide-react";
import { Equipment, PreRecord } from "../../types";
import { recordService } from "../../services/api";

interface PMDashboardProps {
  selectedFilter: string;
  hasActiveFilter?: boolean;
  equipment: Equipment[];
}

const PAGE_SIZE = 5;

const PMDashboard: React.FC<PMDashboardProps> = ({
  selectedFilter,
  hasActiveFilter = false,
  equipment,
}) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<PreRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<PreRecord | null>(null);
  const [search, setSearch] = useState("");

  const fetchMaintenanceRecords = useCallback(async () => {
    try {
      setLoadingRecords(true);
      const response = await recordService.getAll();
      setMaintenanceRecords(response.data || []);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      setMaintenanceRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [fetchMaintenanceRecords]);


  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, equipment, search]);


  const equipmentMap = useMemo(() => {
    const map = new Map<number, Equipment>();
    equipment.forEach((eq) => map.set(Number(eq.id), eq));
    return map;
  }, [equipment]);

  const filteredRecords = useMemo(() => {
    const equipmentIds = new Set(equipment.map((e) => Number(e.id)));
    return maintenanceRecords.filter((r) => {
      if (!equipmentIds.has(Number(r.id_m_alat))) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const eq = equipmentMap.get(Number(r.id_m_alat));
        const peralatanMatch = `${eq?.nama || ""} ${eq?.jenis || ""} ${eq?.lokasi || ""}`.toLowerCase().includes(q);
        const tanggalFormatted = new Date(r.tanggal).toLocaleDateString("id-ID", {
          day: "2-digit", month: "short", year: "numeric",
        }).toLowerCase();
        const tanggalIso = new Date(r.tanggal).toISOString().split("T")[0];
        const tanggalMatch = tanggalFormatted.includes(q) || tanggalIso.includes(q);
        if (!peralatanMatch && !tanggalMatch) return false;
      }

      return true;
    });
  }, [maintenanceRecords, equipment, equipmentMap, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="mt-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {/* Kolom kiri: judul */}
            <div>
              <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                <History className="mr-2" />
                History Maintenance Preventive
                {hasActiveFilter && selectedFilter !== "all" && (
                  <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {selectedFilter}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Riwayat perawatan dan maintenance peralatan secara berkala
              </p>
            </div>
            {/* Kolom kanan: total + search */}
            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {filteredRecords.length} records
              </p>
              <div className="relative">
                <Search size={14} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari peralatan atau tanggal (contoh: 01 Jan 2026)"
                  className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loadingRecords ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-3 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading maintenance history...</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <Wrench className="w-full h-full" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilter && selectedFilter !== "all"
                  ? `Tidak ada history maintenance untuk jenis ${selectedFilter}`
                  : "Belum ada history maintenance"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center"><Calendar size={14} className="mr-2" />Tanggal</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center"><Wrench size={14} className="mr-2" />Peralatan</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center"><AlertCircle size={14} className="mr-2" />Deskripsi</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center"><User size={14} className="mr-2" />Petugas</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {paginatedRecords.map((record) => {
                  const eq = equipmentMap.get(Number(record.id_m_alat));
                  return (
                    <tr key={record.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-gray-100">
                        {formatDate(record.tanggal)}
                      </td>
                      <td className="px-6 py-4">
                        {eq ? (
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            <div className="font-medium">{eq.nama}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{eq.jenis}</div>
                            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {eq.lokasi || "-"} | {Array.isArray(eq.device) ? (eq.device.length > 0 ? eq.device.join(", ") : "-") : (eq.device || "-")}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm italic text-gray-400">Equipment #{record.id_m_alat}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                          {record.deskripsi}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {record.petugas}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900 dark:hover:text-blue-200"
                        >
                          <Eye size={14} className="mr-1.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredRecords.length > PAGE_SIZE && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} dari {filteredRecords.length} records
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detail Record Preventive
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedRecord.tanggal)}
                  {equipmentMap.get(Number(selectedRecord.id_m_alat)) && (
                    <span className="ml-2 font-medium">
                      — {equipmentMap.get(Number(selectedRecord.id_m_alat))?.nama}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
              {/* Info Peralatan */}
              {equipmentMap.get(Number(selectedRecord.id_m_alat)) && (() => {
                const eq = equipmentMap.get(Number(selectedRecord.id_m_alat))!;
                return (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="mb-1 text-xs font-medium text-blue-600 uppercase dark:text-blue-400">Peralatan</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{eq.nama}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{eq.jenis} · {eq.lokasi || "-"} · {Array.isArray(eq.device) ? (eq.device.length > 0 ? eq.device.join(", ") : "-") : (eq.device || "-")}</p>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User size={14} className="mr-1.5" />Petugas
                  </h4>
                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                    {selectedRecord.petugas || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertCircle size={14} className="mr-1.5" />Deskripsi
                  </h4>
                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                    {selectedRecord.deskripsi || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertCircle size={14} className="mr-1.5" />Kondisi Awal
                  </h4>
                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                    {selectedRecord.awal || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Wrench size={14} className="mr-1.5" />Tindakan
                  </h4>
                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                    {selectedRecord.tindakan || "-"}
                  </p>
                </div>
                {selectedRecord.tambahan && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Tindakan Tambahan</h4>
                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                      {selectedRecord.tambahan}
                    </p>
                  </div>
                )}
                {selectedRecord.akhir && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Kondisi Akhir</h4>
                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                      {selectedRecord.akhir}
                    </p>
                  </div>
                )}
                {selectedRecord.berikutnya && (
                  <div className="md:col-span-2">
                    <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <CheckCircle size={14} className="mr-1.5" />Rencana Berikutnya
                    </h4>
                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                      {selectedRecord.berikutnya}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PMDashboard;
