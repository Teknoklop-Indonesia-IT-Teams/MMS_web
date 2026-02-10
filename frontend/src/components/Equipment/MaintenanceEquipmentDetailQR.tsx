import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, MapPin, QrCode, BookOpen, Plus } from "lucide-react";
import { Equipment, MaintenanceRecord } from "../../types";
import { recordService, staffService } from "../../services/api";
import { alatService } from "../../services/apiSimple";

interface StaffMember {
  id: number;
  nama: string;
}

interface StaffResponse {
  id: number;
  nama?: string;
  petugas?: string;
}

const MaintenanceEquipmentDetailQR: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
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

  const handleAddRecord = () => {
    setShowAddRecord(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipment || !equipment.id) {
      alert("Data alat tidak valid. Silakan refresh halaman.");
      return;
    }

    if (!formData.tanggal || !formData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi");
      return;
    }
    try {
      const newRecord = {
        id_m_alat: equipment.id,
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

      if (response.data) {
        await fetchRecords();

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

        setShowAddRecord(false);

        alert("Record berhasil ditambahkan!");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Gagal menyimpan record. Silakan coba lagi.");
    }
  };

  const fetchEquipment = useCallback(async () => {
    if (!id) {
      setError("ID alat tidak valid");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await alatService.getAlatById(id);
      setEquipment(response.data.data);
    } catch (err: any) {
      console.error("❌ Public QR: Error fetching equipment:", err);

      if (err.response?.status === 404) {
        setError("Alat tidak ditemukan");
      } else {
        setError("Gagal memuat data alat");
      }
      setEquipment(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await staffService.getAll();
      if (response && response.data) {
        const staffData = Array.isArray(response.data) ? response.data : [];
        const mappedStaff = (staffData as unknown as StaffResponse[]).map(
          (staff: StaffResponse) => ({
            id: staff.id,
            nama: staff.nama || staff.petugas || "",
          }),
        );
        setStaffList(mappedStaff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!equipment || !equipment.id) {
      return;
    }

    try {
      setRecordsLoading(true);
      const response = await recordService.getByEquipmentId(equipment.id);
      setRecords(response.data);
    } catch (err: any) {
      console.error("❌ Public QR: Error fetching records:", err);
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [equipment]);

  useEffect(() => {
    fetchStaff();
    fetchEquipment();
  }, [fetchStaff, fetchEquipment]);

  useEffect(() => {
    if (equipment && equipment.id) {
      fetchRecords();
    }
  }, [equipment, fetchRecords]);

  const toggleRecordDetail = (recordId: number) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Belum pernah";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data tidak valid";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "text-gray-600 bg-gray-100";

    switch (status.toLowerCase()) {
      case "normal":
      case "garansi":
        return "text-green-600 bg-green-100";
      case "habis":
        return "text-red-600 bg-red-100";
      case "maintenance":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getGaransiStatus = (garansiDate: string | null | undefined) => {
    if (!garansiDate)
      return { status: "Tidak diketahui", color: "bg-gray-100 text-gray-800" };

    const today = new Date();
    const garansi = new Date(garansiDate);

    if (isNaN(garansi.getTime())) {
      return { status: "Tidak valid", color: "bg-gray-100 text-gray-800" };
    }

    if (garansi > today) {
      return { status: "Garansi", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Habis", color: "bg-red-100 text-red-800" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Memuat data alat dari QR Code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-gray-600 text-sm">
              <QrCode size={16} />
              <span>Akses melalui QR Code</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={24} className="flex-shrink-0" />
              <h1 className="text-xl font-bold">Error</h1>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="text-sm text-gray-500">
              <p>Pastikan:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>QR Code masih valid</li>
                <li>Koneksi internet stabil</li>
                <li>Alat masih terdaftar di sistem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 text-gray-600 mb-4">
              <QrCode size={24} />
              <h1 className="text-xl font-bold">Data Tidak Tersedia</h1>
            </div>
            <p className="text-gray-700">Data alat tidak dapat ditampilkan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <QrCode size={16} />
              <span>Diakses melalui QR Code</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleString("id-ID")}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Detail Record Maintenance Alat - {equipment.nama}
          </h1>
          <p className="text-gray-600">
            Informasi lengkap alat dari sistem maintenance
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Status Saat Ini
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  equipment.status,
                )}`}
              >
                {equipment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informasi Alat
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nama Alat
                  </label>
                  <p className="text-gray-900 font-medium">{equipment.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Kode Alat
                  </label>
                  <p className="text-gray-900 font-mono">
                    {equipment.device || "N/A"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Lokasi
                    </label>
                    <p className="text-gray-900">{equipment.lokasi}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Jenis
                  </label>
                  <p className="text-gray-900">{equipment.jenis}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Device
                  </label>
                  <p className="text-gray-900">{equipment.device || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Garansi
                  </label>
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        getGaransiStatus(equipment.garansi).color
                      }`}
                    >
                      {getGaransiStatus(equipment.garansi).status}
                    </span>
                    {equipment.garansi && (
                      <p className="text-xs text-gray-500">
                        Berakhir: {formatDate(equipment.garansi)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    PIC (Person In Charge)
                  </label>
                  <p className="text-gray-900 font-medium">
                    {equipment.pic || "Belum ditentukan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informasi Maintenance
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Maintenance Terakhir
                </label>
                <p className="text-gray-900">
                  {formatDate(equipment.maintenanceDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Maintenance Selanjutnya
                </label>
                <p className="text-gray-900">
                  {formatDate(equipment.nextMaintenanceDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                History Maintenance
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  {recordsLoading ? (
                    <span className="text-blue-500">Memuat records...</span>
                  ) : (
                    `${records.length} record ditemukan`
                  )}
                </div>
                {/* Tombol Tambah Record - Opsional untuk public */}
                <button
                  onClick={handleAddRecord}
                  className="flex items-center px-3 py-1 space-x-1 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                  title="Tambah Record Maintenance"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Form Tambah Record */}
            {showAddRecord && (
              <div className="p-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="mb-3 font-medium text-gray-700">
                  Tambah Record Maintenance
                </h3>
                <form onSubmit={handleSaveRecord} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        placeholder="Deskripsi maintenance"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        {/* Atau dari staffList jika ada */}
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.nama}>
                            {staff.nama}
                          </option>
                        ))}
                      </select>
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
                        placeholder="Keterangan tambahan"
                      />
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
                        rows={2}
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
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tindakan yang dilakukan..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Simpan Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRecord(false)}
                      className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {recordsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 mx-auto mb-3 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500">Memuat history maintenance...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Belum ada history maintenance untuk alat ini
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-lg">
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
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records.map((record) => (
                      <React.Fragment key={record.id}>
                        <tr>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.tanggal}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.deskripsi}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.awal?.substring(0, 50)}
                            {record.awal && record.awal.length > 50 && "..."}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.tindakan?.substring(0, 50)}
                            {record.tindakan &&
                              record.tindakan.length > 50 &&
                              "..."}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.keterangan || "-"}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleRecordDetail(record.id)}
                              className={`p-2 rounded transition-colors ${
                                expandedRecordId === record.id
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <BookOpen size={16} />
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Detail Row */}
                        {expandedRecordId === record.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                    Tambahan
                                  </label>
                                  <p className="text-sm text-gray-900 whitespace-pre-line">
                                    {record.tambahan || "-"}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                    Kondisi Akhir
                                  </label>
                                  <p className="text-sm text-gray-900 whitespace-pre-line">
                                    {record.akhir || "-"}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                    Rencana Berikutnya
                                  </label>
                                  <p className="text-sm text-gray-900 whitespace-pre-line">
                                    {record.berikutnya || "-"}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                    Petugas
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {record.petugas || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <p>
                Note: Fitur ini hanya untuk melihat history maintenance. Untuk
                menambah atau mengedit data, silakan login ke sistem.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Maintenance Management System</p>
          <p>{equipment.nama}</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceEquipmentDetailQR;
