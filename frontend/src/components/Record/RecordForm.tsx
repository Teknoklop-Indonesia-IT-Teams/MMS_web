import React, { useState, useEffect } from "react";
import { X, Calendar, FileText, User, Wrench } from "lucide-react";
import { Record } from "../../types";
import { staffService, alatService } from "../../services/api";

interface RecordFormProps {
  record: Record | null;
  onSave: (recordData: Omit<Record, "id">) => void;
  onCancel: () => void;
}

interface StaffMember {
  id: number;
  nama: string;
}

interface Equipment {
  id: number;
  nama: string;
}

const RecordForm: React.FC<RecordFormProps> = ({
  record,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    deskripsi: "",
    awal: "",
    tindakan: "",
    tambahan: "",
    akhir: "",
    berikutnya: "",
    keterangan: "",
    petugas: "",
    id_m_alat: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        deskripsi: record.deskripsi || "",
        awal: record.awal || "",
        tindakan: record.tindakan || "",
        tambahan: record.tambahan || "",
        akhir: record.akhir || "",
        berikutnya: record.berikutnya || "",
        keterangan: record.keterangan || "",
        petugas: record.petugas || "",
        id_m_alat: record.id_m_alat || "",
        tanggal: record.tanggal || new Date().toISOString().split("T")[0],
      });
    }
  }, [record]);

  // Fetch staff data for petugas dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await staffService.getAll();
        if (response && response.data) {
          const staffData = Array.isArray(response.data) ? response.data : [];
          const mappedStaff = staffData.map(
            (staff: { id: number; nama?: string; petugas?: string }) => ({
              id: staff.id,
              nama: staff.nama || staff.petugas || "",
            })
          );
          setStaffList(mappedStaff);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        setStaffList([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  // Fetch equipment data for id_m_alat dropdown
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoadingEquipment(true);
        const response = await alatService.getAll();
        if (response && response.data) {
          const equipmentData = Array.isArray(response.data)
            ? response.data
            : [];
          const mappedEquipment = equipmentData.map(
            (equipment: { id: number; nama: string }) => ({
              id: equipment.id,
              nama: equipment.nama,
            })
          );
          setEquipmentList(mappedEquipment);
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setEquipmentList([]);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.deskripsi.trim())
      newErrors.deskripsi = "Deskripsi wajib diisi";
    if (!formData.awal.trim()) newErrors.awal = "Kondisi awal wajib diisi";
    if (!formData.tindakan.trim()) newErrors.tindakan = "Tindakan wajib diisi";
    if (!formData.akhir.trim()) newErrors.akhir = "Kondisi akhir wajib diisi";
    if (!formData.petugas.trim()) newErrors.petugas = "Petugas wajib diisi";
    if (!formData.id_m_alat.trim()) newErrors.id_m_alat = "Alat wajib dipilih";
    if (!formData.tanggal.trim()) newErrors.tanggal = "Tanggal wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {record ? "Edit Record Maintenance" : "Tambah Record Maintenance"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.tanggal
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.tanggal && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.tanggal}
                </p>
              )}
            </div>

            {/* Alat */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Wrench className="h-4 w-4 mr-2 text-blue-500" />
                Alat <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.id_m_alat}
                onChange={(e) =>
                  setFormData({ ...formData, id_m_alat: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.id_m_alat
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loadingEquipment}
              >
                <option value="">
                  {loadingEquipment ? "Memuat data alat..." : "Pilih Alat"}
                </option>
                {equipmentList.map((equipment) => (
                  <option key={equipment.id} value={equipment.id.toString()}>
                    {equipment.nama}
                  </option>
                ))}
              </select>
              {errors.id_m_alat && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.id_m_alat}
                </p>
              )}
            </div>

            {/* Petugas */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                Petugas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.petugas}
                onChange={(e) =>
                  setFormData({ ...formData, petugas: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.petugas
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={loadingStaff}
              >
                <option value="">
                  {loadingStaff ? "Memuat data petugas..." : "Pilih Petugas"}
                </option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.nama}>
                    {staff.nama}
                  </option>
                ))}
              </select>
              {errors.petugas && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.petugas}
                </p>
              )}
            </div>
          </div>

          {/* Text Areas */}
          <div className="mt-6 space-y-6">
            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Kegiatan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.deskripsi
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Deskripsi kegiatan maintenance yang dilakukan..."
              />
              {errors.deskripsi && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.deskripsi}
                </p>
              )}
            </div>

            {/* Kondisi Awal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kondisi Awal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.awal}
                onChange={(e) =>
                  setFormData({ ...formData, awal: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.awal ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Kondisi alat sebelum dilakukan maintenance..."
              />
              {errors.awal && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.awal}
                </p>
              )}
            </div>

            {/* Tindakan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tindakan yang Dilakukan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.tindakan}
                onChange={(e) =>
                  setFormData({ ...formData, tindakan: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.tindakan
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Tindakan perbaikan/maintenance yang dilakukan..."
              />
              {errors.tindakan && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.tindakan}
                </p>
              )}
            </div>

            {/* Tindakan Tambahan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tindakan Tambahan
              </label>
              <textarea
                value={formData.tambahan}
                onChange={(e) =>
                  setFormData({ ...formData, tambahan: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Tindakan tambahan jika ada..."
              />
            </div>

            {/* Kondisi Akhir */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kondisi Akhir <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.akhir}
                onChange={(e) =>
                  setFormData({ ...formData, akhir: e.target.value })
                }
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.akhir ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Kondisi alat setelah dilakukan maintenance..."
              />
              {errors.akhir && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <span className="mr-1">⚠️</span>
                  {errors.akhir}
                </p>
              )}
            </div>

            {/* Rencana Berikutnya */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rencana Maintenance Berikutnya
              </label>
              <textarea
                value={formData.berikutnya}
                onChange={(e) =>
                  setFormData({ ...formData, berikutnya: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Rencana maintenance berikutnya..."
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keterangan Tambahan
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Keterangan tambahan..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              💾 {record ? "Update Record" : "Simpan Record"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              ❌ Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;
