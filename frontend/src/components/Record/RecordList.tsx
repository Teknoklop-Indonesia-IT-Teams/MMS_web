import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { Record } from "../../types";
import { recordService } from "../../services/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  showConfirmationToast,
} from "../../utils/toast";
import RecordForm from "./RecordForm";

const RecordList: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("RecordList: Starting to fetch record data...");

      const response = await recordService.getAll();
      console.log("RecordList: Full response:", response);

      if (response && response.status === 200 && response.data) {
        const recordData = Array.isArray(response.data) ? response.data : [];
        console.log("RecordList: Record data:", recordData);
        setRecords(recordData);
      } else {
        console.error("RecordList: Invalid response:", response);
        throw new Error(
          `HTTP ${response?.status || "Unknown"}: ${
            response?.statusText || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("RecordList: Error fetching records:", error);
      setError(
        `Gagal memuat data record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: Record) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDeleteRecord = async (recordId: number) => {
    const record = records.find((r) => r.id === recordId);
    const recordDesc = record ? record.deskripsi : `ID ${recordId}`;

    showConfirmationToast(`Hapus record "${recordDesc}"?`, async () => {
      const loadingToastId = showLoadingToast("Menghapus record...");
      try {
        await recordService.delete(recordId.toString());
        await fetchRecords();
        showSuccessToast(
          "Record berhasil dihapus!",
          `Record "${recordDesc}" telah dihapus dari sistem`
        );
      } catch (error) {
        console.error("Error deleting record:", error);
        showErrorToast(
          "Gagal menghapus record",
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
      } finally {
        toast.dismiss(loadingToastId);
      }
    });
  };

  const handleSaveRecord = async (recordData: Omit<Record, "id">) => {
    const loadingToastId = showLoadingToast(
      selectedRecord ? "Memperbarui record..." : "Menyimpan record..."
    );

    try {
      if (selectedRecord) {
        await recordService.update(selectedRecord.id.toString(), recordData);
        showSuccessToast("Record berhasil diperbarui!");
      } else {
        await recordService.create(recordData);
        showSuccessToast("Record berhasil ditambahkan!");
      }
      await fetchRecords();
      setIsFormOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error saving record:", error);
      showErrorToast(
        "Gagal menyimpan record",
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Memuat data record...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="mb-4 text-red-600">{error}</p>
              <button
                onClick={fetchRecords}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Record Maintenance
            </h1>
            <p className="text-gray-600">
              Kelola data record maintenance alat telemetri
            </p>
          </div>
          <button
            onClick={handleAddRecord}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Record
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Kondisi Awal
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Tindakan
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Kondisi Akhir
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Petugas
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-2 text-gray-400" />
                      <span>Tidak ada data record</span>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        {formatDate(record.tanggal)}
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-900">
                      <div className="truncate" title={record.deskripsi}>
                        {record.deskripsi || "-"}
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                      <div className="truncate" title={record.awal}>
                        {record.awal || "-"}
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                      <div className="truncate" title={record.tindakan}>
                        {record.tindakan || "-"}
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                      <div className="truncate" title={record.akhir}>
                        {record.akhir || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-green-500" />
                        {record.petugas || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-1 mr-3 text-blue-600 transition-colors rounded hover:text-blue-900"
                        title="Edit record"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1 text-red-600 transition-colors rounded hover:text-red-900"
                        title="Hapus record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Form Modal */}
      {isFormOpen && (
        <RecordForm
          record={selectedRecord}
          onSave={handleSaveRecord}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default RecordList;
