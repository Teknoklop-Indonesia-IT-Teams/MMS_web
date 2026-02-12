import React, { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2, BookOpen, Upload, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Equipment, PreRecord } from "../../types";
import { alatService, recordService, staffService } from "../../services/api";
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

function Lightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <button
        className="absolute p-2 text-white transition-colors bg-gray-700 rounded-full top-4 right-4 hover:bg-gray-600"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={alt || "Record Image"}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        {alt && <p className="mt-2 text-sm text-center text-white opacity-75">{alt}</p>}
      </div>
    </div>
  );
}

function ImageThumbnail({ src, alt }: { src: string; alt?: string }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const getFullUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_URL || 
                    import.meta.env.VITE_API_URL?.replace("/api", "") || 
                    "http://localhost:3001";
    return `${baseUrl}${path}`;
  };

  const fullSrc = getFullUrl(src);

  return (
    <>
      <div
        className="relative cursor-pointer w-14 h-14 group"
        onClick={() => setShowLightbox(true)}
      >
        <img
          src={fullSrc}
          alt={alt || "Record Image"}
          className="object-cover transition-opacity border border-gray-200 rounded-md shadow-sm w-14 h-14 group-hover:opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 rounded-md group-hover:bg-opacity-30">
          <ZoomIn size={16} className="text-white transition-opacity opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      {showLightbox && (
        <Lightbox src={fullSrc} alt={alt} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}

export default function EquipmentDetail({ equipment, onClose, onUpdate }: EquipmentDetailProps) {
  const [records, setRecords] = useState<PreRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [equipmentWithStatus, setEquipmentWithStatus] = useState<Equipment>(equipment);

  const [formData, setFormData] = useState({
    tanggal: "", deskripsi: "", awal: "", tindakan: "",
    tambahan: "", akhir: "", berikutnya: "", keterangan: "", petugas: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { showSuccess } = useToast();

  const isMaintenanceActive = (() => {
    // const v = equipmentWithStatus.isMaintenanceActive;
    const v = Boolean(equipmentWithStatus.isMaintenanceActive);
    if (v === false || String(v).toLowerCase() === "false" || String(v) === "0") return false;
    if (v === true || String(v).toLowerCase() === "true" || String(v) === "1") return true;
    return false;
  })();

  const fetchRecords = useCallback(async () => {
    try { const r = await recordService.getByEquipmentId(equipment.id); setRecords(r.data); }
    catch (e) { console.error(e); }
  }, [equipment.id]);

  const fetchEquipmentStatus = useCallback(async () => {
    try {
      const r = await alatService.getWithMaintenanceStatus(equipment.id);
      console.log("API Maintenance Response:", r.data);
      setEquipmentWithStatus(r.data);
    } catch (e) {
      console.error("Error fetching equipment status:", e);
    }
  }, [equipment.id]);


  const fetchStaff = useCallback(async () => {
    try {
      const r = await staffService.getAll();
      if (r?.data) {
        const data = Array.isArray(r.data) ? r.data : [];
        setStaffList((data as unknown as StaffResponse[]).map(s => ({
          id: s.id,
          nama: s.nama || s.petugas || "",
        })));
      }
    } catch (e) { console.error("Error fetching staff:", e); setStaffList([]); }
  }, []);

  useEffect(() => {
    void fetchRecords();
    void fetchStaff();
    void fetchEquipmentStatus();
  }, [fetchRecords, fetchStaff, fetchEquipmentStatus]);

  useEffect(() => {
    console.log("=== EQUIPMENT STATUS UPDATE ===");
    console.log("equipmentWithStatus:", equipmentWithStatus);
    console.log("isMaintenanceActive raw:", equipmentWithStatus.isMaintenanceActive);
  }, [equipmentWithStatus]);


  const formatDate = (dt: string) => dt ? dt.split("T")[0] : "";
  const toggleRecordDetail = (id: number) => setExpandedRecordId(prev => prev === id ? null : id);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("Format tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null); }
  }

  function resetForm() {
    setFormData({
      tanggal: "", deskripsi: "", awal: "", tindakan: "",
      tambahan: "", akhir: "", berikutnya: "", keterangan: "", petugas: "",
    });
    handleRemoveImage();
  }

  async function handleSaveRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.tanggal || !formData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi");
      return;
    }

    try {
      let payload: Parameters<typeof recordService.create>[0];

      if (imageFile) {
        const fd = new FormData();
        fd.append("id_m_alat", String(equipment.id));
        fd.append("tanggal", formData.tanggal);
        fd.append("deskripsi", formData.deskripsi);
        fd.append("awal", formData.awal);
        fd.append("tindakan", formData.tindakan);
        fd.append("tambahan", formData.tambahan);
        fd.append("akhir", formData.akhir);
        fd.append("berikutnya", formData.berikutnya);
        fd.append("keterangan", formData.keterangan);
        fd.append("petugas", formData.petugas);
        fd.append("i_alat", imageFile);
        payload = fd;
      } else {
        payload = {
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
          i_alat: null,
        };
      }

      console.log("=== SUBMIT DEBUG ===");
      console.log("imageFile:", imageFile);
      console.log("payload instanceof FormData:", payload instanceof FormData);

      if (payload instanceof FormData) {
        for (const pair of payload.entries()) {
          console.log("FD:", pair[0], pair[1]);
        }
      }


      const response = await recordService.create(payload);
      if (!response.data) throw new Error("Failed to save record");

      await fetchRecords();
      await fetchEquipmentStatus();
      setShowAddRecord(false);
      resetForm();
      showSuccess("Record berhasil ditambahkan");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Gagal menyimpan record. Silakan coba lagi.");
    }
  }

  async function handleDeleteRecord(recordId: number) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus record ini?")) return;
    try {
      await recordService.delete(recordId);
      await fetchRecords();
      showSuccess("Record berhasil dihapus");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Gagal menghapus record. Silakan coba lagi.");
    }
  }

  console.log("=== FINAL CHECK ===");
  console.log("equipmentWithStatus.isMaintenanceActive:", equipmentWithStatus.isMaintenanceActive);
  console.log("Computed isMaintenanceActive:", isMaintenanceActive);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Detail Record Maintenance {equipment.nama}
          </h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">

          {/* Equipment Info */}
          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Nama</label><p className="text-gray-900">{equipment.nama}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Lokasi</label><p className="text-gray-900">{equipment.lokasi}</p></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis</label>
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{equipment.jenis}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${equipment.status === "Garansi" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {equipment.status}
                  </span>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Instalasi</label><p className="text-gray-900">{formatDate(equipment.instalasi)}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Garansi</label><p className="text-gray-900">{formatDate(equipment.garansi)}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Device</label><p className="text-gray-900">{equipment.device}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Sensor</label><p className="text-gray-900">{equipment.sensor}</p></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Gambar</label>
                <div className="relative w-full h-64">
                  {equipment.i_alat ? (
                    <ImageDisplay
                      src={equipment.i_alat}
                      alt={`${equipment.nama} Image`}
                      className="w-full h-full border rounded-lg shadow-sm"
                      onError={() => console.log(`Image failed: ${equipment.i_alat}`)}
                      onLoad={() => console.log(`Image loaded: ${equipment.i_alat}`)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
                      <svg className="w-16 h-16 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">No Image Available</span>
                      <span className="mt-1 text-xs text-gray-400">Image will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold">Status Maintenance</h3>
            <div className="space-y-4">
              <MaintenanceStatus equipment={equipmentWithStatus} showDetails={true} />
              <MaintenanceActions
                equipment={equipmentWithStatus}
                onUpdate={() => { void fetchEquipmentStatus(); void fetchRecords(); onUpdate?.(); }}
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            {isMaintenanceActive ? (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Related Records</h3>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} /><span>Tambah Record</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Related Records</h3>
                </div>
                <div className="p-4 mb-4 text-sm text-blue-800 bg-blue-100 rounded-lg">
                  <p className="font-medium">ℹ️ Maintenance telah selesai</p>
                  <p className="mt-1">
                    Record tidak dapat ditambahkan karena maintenance untuk peralatan ini sudah diselesaikan.
                    Aktifkan kembali maintenance melalui "Pengaturan" jika diperlukan.
                  </p>
                </div>
              </>
            )}

            {showAddRecord && (
              <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50">
                <form onSubmit={handleSaveRecord} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tanggal <span className="text-red-500">*</span>
                      </label>
                      <input type="date" value={formData.tanggal}
                        onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Deskripsi <span className="text-red-500">*</span>
                      </label>
                      <input type="text" value={formData.deskripsi}
                        onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Keterangan</label>
                      <input type="text" value={formData.keterangan}
                        onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Petugas <span className="text-red-500">*</span>
                      </label>
                      <select value={formData.petugas}
                        onChange={e => setFormData({ ...formData, petugas: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="">Pilih Petugas</option>
                        {staffList.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Kondisi Awal <span className="text-red-500">*</span>
                      </label>
                      <textarea value={formData.awal}
                        onChange={e => setFormData({ ...formData, awal: e.target.value })}
                        rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kondisi alat sebelum maintenance..." required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tindakan <span className="text-red-500">*</span>
                      </label>
                      <textarea value={formData.tindakan}
                        onChange={e => setFormData({ ...formData, tindakan: e.target.value })}
                        rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tindakan yang dilakukan..." required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Tambahan</label>
                      <textarea value={formData.tambahan}
                        onChange={e => setFormData({ ...formData, tambahan: e.target.value })}
                        rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tindakan tambahan..." />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Kondisi Akhir <span className="text-red-500">*</span>
                      </label>
                      <textarea value={formData.akhir}
                        onChange={e => setFormData({ ...formData, akhir: e.target.value })}
                        rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kondisi setelah maintenance..." required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Rencana Berikutnya</label>
                      <textarea value={formData.berikutnya}
                        onChange={e => setFormData({ ...formData, berikutnya: e.target.value })}
                        rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Rencana maintenance berikutnya..." />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Upload Gambar</label>
                      {imagePreview ? (
                        // Preview setelah file dipilih
                        <div className="relative w-full h-32 overflow-hidden border border-gray-300 rounded-md group">
                          <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                          <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 group-hover:bg-opacity-40">
                            <button type="button" onClick={handleRemoveImage}
                              className="flex items-center px-3 py-1.5 space-x-1 text-xs text-white bg-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                              <X size={12} /><span>Hapus</span>
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 truncate">
                              {imageFile?.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="record-image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 transition-colors border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                          <Upload size={24} className="mb-2 text-gray-400" />
                          <span className="text-sm text-gray-500">Klik untuk upload gambar</span>
                          <span className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, WEBP — Maks. 5MB</span>
                          <input
                            id="record-image-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit"
                      className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700">
                      Simpan
                    </button>
                    <button type="button"
                      onClick={() => { setShowAddRecord(false); resetForm(); }}
                      className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700">
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
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Kondisi Awal</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tindakan</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Keterangan</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Gambar</th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-sm text-center text-gray-400">
                        Belum ada record maintenance.
                      </td>
                    </tr>
                  )}
                  {records.map(record => (
                    console.log("record.i_alat:", record.i_alat),
                    <React.Fragment key={record.id}>
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-900">{formatDate(record.tanggal)}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.deskripsi}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.awal}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.tindakan}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{record.keterangan}</td>

                        <td className="px-4 py-4">
                          {record.i_alat ? (
                            <ImageThumbnail
                              src={record.i_alat}
                              alt={`${record.deskripsi} - ${formatDate(record.tanggal)}`}
                            />
                          ) : (
                            <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md w-14 h-14">
                              <ImageIcon size={18} className="text-gray-300" />
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleRecordDetail(record.id)}
                              className={`p-1 text-white rounded transition-colors ${expandedRecordId === record.id ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                              <BookOpen size={12} />
                            </button>
                            <button onClick={() => handleDeleteRecord(record.id)}
                              className="p-1 text-white bg-red-600 rounded hover:bg-red-700">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expandable Detail Row ── */}
                      {expandedRecordId === record.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Tambahan</label>
                                <p className="mt-1 text-sm text-gray-900">{record.tambahan || "-"}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Kondisi Akhir</label>
                                <p className="mt-1 text-sm text-gray-900">{record.akhir || "-"}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Rencana Berikutnya</label>
                                <p className="mt-1 text-sm text-gray-900">{record.berikutnya || "-"}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Petugas</label>
                                <p className="mt-1 text-sm text-gray-900">{record.petugas || "-"}</p>
                              </div>
                              {/* ── Gambar di expanded detail ── */}
                              {record.i_alat && (
                                <div>
                                  <label className="block mb-2 text-xs font-medium text-gray-500 uppercase">Gambar Record</label>
                                  <ImageThumbnail src={record.i_alat} alt={`${record.deskripsi} - Detail`} />
                                  <p className="mt-1 text-xs text-gray-400">Klik gambar untuk memperbesar</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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