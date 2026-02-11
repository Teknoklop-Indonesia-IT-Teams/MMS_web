import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  History,
  ChevronDown,
  Calendar,
  AlertCircle,
  User,
  CheckCircle,
  Eye,
  Wrench,
} from "lucide-react";
import { useDashboardData } from "../../hooks/useLazyEquipment";
import { CorRecord, Equipment } from "../../types";
import { alatService, recordCorrectiveService } from "../../services/api";

interface CMDashboardProps {
  selectedFilter: string; // Ubah dari isSelected ke selectedFilter
  hasActiveFilter?: boolean;
  equipment: Equipment[]; // Tambahkan prop equipment dari parent
}

const CMDashboard: React.FC<CMDashboardProps> = ({
  selectedFilter,
  hasActiveFilter = false,
  equipment,
}) => {
  // State untuk history maintenance
  const [maintenanceRecords, setMaintenanceRecords] = useState<CorRecord[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [showRecordsModal, setShowRecordsModal] = useState<boolean>(false);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  // Fetch maintenance records
  const fetchMaintenanceRecords = useCallback(async () => {
    try {
      setLoadingRecords(true);
      const response = await recordCorrectiveService.getAll();
      setMaintenanceRecords(response.data || []);
      console.log("RESPONSE", response.data);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      setMaintenanceRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const fetchEquipments = useCallback(async () => {
    try {
      const response = await alatService.getAll();
      setEquipments(response.data || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      setEquipments([]);
    }
  }, []);

  // Load records on component mount
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchEquipments();
  }, [fetchMaintenanceRecords, fetchEquipments]);

  // Create equipment map for fast lookup
  const equipmentMap = useMemo(() => {
    const map = new Map<number, Equipment>();
    equipments.forEach((eq) => {
      map.set(Number(eq.id), eq);
    });
    return map;
  }, [equipments]);

  // Filter maintenance records berdasarkan equipment yang difilter
  const filteredMaintenanceRecords = useMemo(() => {
    if (selectedFilter === "all") {
      return maintenanceRecords;
    } else {
      // Filter records berdasarkan jenis equipment
      const filteredEquipmentIds = equipment
        .filter((item) => item.jenis === selectedFilter)
        .map((item) => item.id);

      return maintenanceRecords.filter((record) =>
        filteredEquipmentIds.includes(record.id_m_alat),
      );
    }
  }, [maintenanceRecords, equipment, selectedFilter]);

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to get equipment by id
  const getEquipmentById = useCallback(
    (equipmentId: number) => {
      return equipmentMap.get(equipmentId);
    },
    [equipmentMap],
  );

  // Toggle record detail
  const toggleRecordDetail = (recordId: number) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };
  return (
    <>
      <div className="mt-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                <History className="mr-2" />
                History Maintenance Corrective
                {hasActiveFilter && (
                  <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {selectedFilter}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Riwayat perbaikan dan maintenance peralatan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredMaintenanceRecords.length} records
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingRecords ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-3 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading maintenance history...
                </p>
              </div>
            </div>
          ) : filteredMaintenanceRecords.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <Wrench className="w-full h-full" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilter
                  ? `Tidak ada history maintenance untuk jenis ${selectedFilter}`
                  : "Belum ada history maintenance"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      Tanggal
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center">
                      <Wrench size={14} className="mr-2" />
                      Peralatan
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center">
                      <AlertCircle size={14} className="mr-2" />
                      Deskripsi
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    <div className="flex items-center">
                      <User size={14} className="mr-2" />
                      Petugas
                    </div>
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredMaintenanceRecords.slice(0, 5).map((record) => {
                  const petugasName = record.petugas;
                  return (
                    <React.Fragment key={record.id}>
                      <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            <div className="font-medium">
                              {formatDate(record.tanggal)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const equipment = getEquipmentById(
                              Number(record.id_m_alat),
                            );

                            return equipment ? (
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                <div className="font-medium">
                                  {equipment.nama}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {equipment.jenis}
                                </div>
                                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  {equipment.lokasi || "-"} |{" "}
                                  {equipment.device || "-"}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm italic text-gray-400">
                                Equipment #{record.id_m_alat}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                              {record.deskripsi}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {petugasName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() => toggleRecordDetail(record.id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                              expandedRecordId === record.id
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            <Eye size={14} className="mr-1.5" />
                            {expandedRecordId === record.id
                              ? "Tutup"
                              : "Detail"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Detail Row */}
                      {expandedRecordId === record.id && (
                        <tr className="bg-blue-50 dark:bg-gray-900">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  <AlertCircle size={14} className="mr-1.5" />
                                  Kondisi Awal
                                </h4>
                                <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                  {record.awal || "-"}
                                </p>
                              </div>
                              <div>
                                <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  <Wrench size={14} className="mr-1.5" />
                                  Tindakan
                                </h4>
                                <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                  {record.tindakan || "-"}
                                </p>
                              </div>
                              {record.tambahan && (
                                <div>
                                  <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tindakan Tambahan
                                  </h4>
                                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    {record.tambahan}
                                  </p>
                                </div>
                              )}
                              {record.akhir && (
                                <div>
                                  <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kondisi Akhir
                                  </h4>
                                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    {record.akhir}
                                  </p>
                                </div>
                              )}
                              {record.berikutnya && (
                                <div className="md:col-span-2">
                                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <CheckCircle size={14} className="mr-1.5" />
                                    Rencana Berikutnya
                                  </h4>
                                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    {record.berikutnya}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredMaintenanceRecords.length > 5 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan 10 dari {filteredMaintenanceRecords.length} records
              </p>
              <button
                onClick={() => setShowRecordsModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                Lihat Semua
                <ChevronDown size={16} className="ml-1.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal untuk semua records */}
      {showRecordsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl dark:bg-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Semua History Maintenance Corrective
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total {filteredMaintenanceRecords.length} records
                </p>
              </div>
              <button
                onClick={() => setShowRecordsModal(false)}
                className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-6">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        Tanggal
                      </div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                      <div className="flex items-center">
                        <Wrench size={14} className="mr-2" />
                        Peralatan
                      </div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                      <div className="flex items-center">
                        <AlertCircle size={14} className="mr-2" />
                        Deskripsi
                      </div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                      <div className="flex items-center">
                        <User size={14} className="mr-2" />
                        Petugas
                      </div>
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredMaintenanceRecords.slice(0, 20).map((record) => {
                    const petugasName = record.petugas;
                    return (
                      <React.Fragment key={record.id}>
                        <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              <div className="font-medium">
                                {formatDate(record.tanggal)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const equipment = getEquipmentById(
                                Number(record.id_m_alat),
                              );

                              return equipment ? (
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  <div className="font-medium">
                                    {equipment.nama}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {equipment.jenis}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {equipment.lokasi || "-"} |{" "}
                                    {equipment.device || "-"}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm italic text-gray-400">
                                  Equipment #{record.id_m_alat}
                                </div>
                              );
                            })()}
                          </td>

                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                                {record.deskripsi}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {petugasName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => toggleRecordDetail(record.id)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                                expandedRecordId === record.id
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              <Eye size={14} className="mr-1.5" />
                              {expandedRecordId === record.id
                                ? "Tutup"
                                : "Detail"}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Detail Row */}
                        {expandedRecordId === record.id && (
                          <tr className="bg-blue-50 dark:bg-gray-900">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <AlertCircle size={14} className="mr-1.5" />
                                    Kondisi Awal
                                  </h4>
                                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    {record.awal || "-"}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Wrench size={14} className="mr-1.5" />
                                    Tindakan
                                  </h4>
                                  <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    {record.tindakan || "-"}
                                  </p>
                                </div>
                                {record.tambahan && (
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Tindakan Tambahan
                                    </h4>
                                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                      {record.tambahan}
                                    </p>
                                  </div>
                                )}
                                {record.akhir && (
                                  <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Kondisi Akhir
                                    </h4>
                                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                      {record.akhir}
                                    </p>
                                  </div>
                                )}
                                {record.berikutnya && (
                                  <div className="md:col-span-2">
                                    <h4 className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                      <CheckCircle
                                        size={14}
                                        className="mr-1.5"
                                      />
                                      Rencana Berikutnya
                                    </h4>
                                    <p className="p-3 text-sm text-gray-600 rounded dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                      {record.berikutnya}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CMDashboard;
