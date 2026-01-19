import React, { useEffect, useState, useCallback } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Equipment, Record } from "../../types";
import { recordService, staffService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import MaintenanceStatus from "./MaintenanceStatus";
import MaintenanceActions from "./MaintenanceActions";
import ImageDisplay from "../Common/ImageDisplay";

interface EquipmentDetailProps {
  equipment: Equipment;
  onClose: () => void;
  onUpdate?: () => void;
}

interface StaffMember {
  id: number;
  nama: string;
}

interface StaffResponse {
  id: number;
  nama?: string;
  petugas?: string;
}

export default function EquipmentDetail({
  equipment,
  onClose,
  onUpdate,
}: EquipmentDetailProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    deskripsi: "",
    awal: "",
    tindakan: "",
    tambahan: "",
    akhir: "",
    berikutnya: "",
    keterangan: "",
    petugas: "",
  });

  const { showSuccess } = useToast();

  const fetchRecords = useCallback(async () => {
    try {
      const response = await recordService.getAll();
      const equipmentRecords = response.data.filter(
        (record: Record) => record.id_m_alat === equipment.id.toString()
      );
      setRecords(equipmentRecords);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  }, [equipment.id]);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await staffService.getAll();
      if (response && response.data) {
        const staffData = Array.isArray(response.data) ? response.data : [];
        const mappedStaff = (staffData as unknown as StaffResponse[]).map(
          (staff: StaffResponse) => ({
            id: staff.id,
            nama: staff.nama || staff.petugas || "",
          })
        );
        setStaffList(mappedStaff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
    void fetchStaff();
  }, [fetchRecords, fetchStaff]);

  function handleAddRecord() {
    setShowAddRecord(true);
  }

  async function handleSaveRecord(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.tanggal || !formData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi");
      return;
    }

    try {
      const newRecord = {
        id_m_alat: equipment.id.toString(),
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        awal: formData.awal,
        tindakan: formData.tindakan,
        tambahan: formData.tambahan,
        akhir: formData.akhir,
        berikutnya: formData.berikutnya,
        keterangan: formData.keterangan,
        petugas: formData.petugas,
      };

      const response = await recordService.create(newRecord);
      if (!response.data) throw new Error("Failed to save record");

      await fetchRecords();
      setShowAddRecord(false);
      setFormData({
        tanggal: "",
        deskripsi: "",
        awal: "",
        tindakan: "",
        tambahan: "",
        akhir: "",
        berikutnya: "",
        keterangan: "",
        petugas: "",
      });
      showSuccess("Record berhasil ditambahkan");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Gagal menyimpan record. Silakan coba lagi.");
    }
  }

  function handleDeleteRecord(recordId: number) {
    if (window.confirm("Apakah Anda yakin ingin menghapus record ini?")) {
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      showSuccess("Record berhasil dihapus");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Detail Alat: {equipment.nama}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama
                  </label>
                  <p className="text-gray-900">{equipment.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lokasi
                  </label>
                  <p className="text-gray-900">{equipment.lokasi}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jenis
                  </label>
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                    {equipment.jenis}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      equipment.status === "Garansi"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {equipment.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instalasi
                  </label>
                  <p className="text-gray-900">{equipment.instalasi}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Garansi
                  </label>
                  <p className="text-gray-900">{equipment.garansi}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Device
                  </label>
                  <p className="text-gray-900">{equipment.device}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sensor
                  </label>
                  <p className="text-gray-900">{equipment.sensor}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar
                </label>
                <div className="relative w-full h-64">
                  {equipment.i_alat ? (
                    <ImageDisplay
                      src={equipment.i_alat}
                      alt={`${equipment.nama} Image`}
                      className="w-full h-full rounded-lg border shadow-sm"
                      onError={() =>
                        console.log(`Image failed: ${equipment.i_alat}`)
                      }
                      onLoad={() =>
                        console.log(`Image loaded: ${equipment.i_alat}`)
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                      <svg
                        className="w-16 h-16 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">
                        No Image Available
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Image will appear here
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Section */}
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold">Status Maintenance</h3>
            <div className="space-y-4">
              <MaintenanceStatus equipment={equipment} showDetails={true} />
              <MaintenanceActions
                equipment={equipment}
                onUpdate={() => {
                  onUpdate?.(); // Refresh the parent equipment list
                  window.location.reload(); // Refresh the current detail view
                }}
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Related Records</h3>
              <button
                onClick={handleAddRecord}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                <span>Tambah Record</span>
              </button>
            </div>

            {showAddRecord && (
              <div className="p-4 mb-4 rounded-lg bg-gray-50">
                <form onSubmit={handleSaveRecord} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tanggal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) =>
                          setFormData({ ...formData, tanggal: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Deskripsi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.deskripsi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deskripsi: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Keterangan
                      </label>
                      <input
                        type="text"
                        value={formData.keterangan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keterangan: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Petugas <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.petugas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            petugas: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Pilih Petugas</option>
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.nama}>
                            {staff.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Kondisi Awal <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.awal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            awal: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kondisi alat sebelum maintenance..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tindakan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.tindakan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tindakan: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tindakan yang dilakukan..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tambahan
                      </label>
                      <textarea
                        value={formData.tambahan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tambahan: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tindakan tambahan..."
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Kondisi Akhir <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.akhir}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            akhir: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kondisi setelah maintenance..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Rencana Berikutnya
                      </label>
                      <textarea
                        value={formData.berikutnya}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            berikutnya: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Rencana maintenance berikutnya..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRecord(false)}
                      className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-hidden bg-white border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Kondisi Awal
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Tindakan
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Keterangan
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.tanggal}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.deskripsi}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.awal}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.tindakan}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.keterangan}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-1">
                          <button className="p-1 text-white bg-blue-600 rounded hover:bg-blue-700">
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1 text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
