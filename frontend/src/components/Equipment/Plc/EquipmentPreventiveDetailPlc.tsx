import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Upload,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { Equipment, PreRecord } from "../../../types";
import {
  alatPlcService,
  recordPlcService,
  staffService,
} from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import MaintenanceStatus from "../../Equipment/MaintenanceStatus";
import MaintenanceActions from "../../Equipment/MaintenanceActions";
import ImageDisplay from "../../Common/ImageDisplay";
import { useAuth } from "../../../hooks/useAuth";
import SearchableSelect from "../../Common/SearchableSelect";

interface Props {
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
  role?: string;
}

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <button
        className="absolute p-2 text-white bg-gray-700 rounded-full top-4 right-4 hover:bg-gray-600"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div
        className="relative max-w-4xl max-h-[90vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Record Image"}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        {alt && (
          <p className="mt-2 text-sm text-center text-white opacity-75">
            {alt}
          </p>
        )}
      </div>
    </div>
  );
}

function ImageThumbnail({ src, alt }: { src: string; alt?: string }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const getFullUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_URL || "http://localhost:3001";
    return `${base}${path}`;
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
          className="object-cover transition-opacity border border-gray-200 rounded-md shadow-sm dark:border-gray-600 w-14 h-14 group-hover:opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 rounded-md group-hover:bg-opacity-30">
          <ZoomIn
            size={16}
            className="text-white opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>
      {showLightbox && (
        <Lightbox
          src={fullSrc}
          alt={alt}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

export default function PlcPreventiveDetail({
  equipment,
  onClose,
  onUpdate,
}: Props) {
  const [records, setRecords] = useState<PreRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [equipmentWithStatus, setEquipmentWithStatus] =
    useState<Equipment>(equipment);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { showSuccess } = useToast();

  const isMaintenanceActive = (() => {
    const v = Boolean(equipmentWithStatus.isMaintenanceActive);
    return (
      v === true || String(v).toLowerCase() === "true" || String(v) === "1"
    );
  })();

  const fetchRecords = useCallback(async () => {
    try {
      const r = await recordPlcService.getByEquipmentId(equipment.id);
      setRecords(r.data);
    } catch (e) {
      console.error(e);
    }
  }, [equipment.id]);

  const fetchEquipmentStatus = useCallback(async () => {
    try {
      const r = await alatPlcService.getWithMaintenanceStatus(equipment.id);
      setEquipmentWithStatus(r.data);
    } catch (e) {
      console.error("Error fetching PLC equipment status:", e);
    }
  }, [equipment.id]);

  const fetchStaff = useCallback(async () => {
    try {
      const r = await staffService.getAll();
      if (r?.data) {
        const data = Array.isArray(r.data) ? r.data : [];
        setStaffList(
          (data as unknown as StaffResponse[]).map((s) => ({
            id: s.id,
            nama: s.nama || s.petugas || "",
          })),
        );
      }
    } catch (e) {
      console.error(e);
      setStaffList([]);
    }
  }, []);

  useEffect(() => {
    void fetchRecords();
    void fetchStaff();
    void fetchEquipmentStatus();
  }, [fetchRecords, fetchStaff, fetchEquipmentStatus]);

  const formatDate = (dt: string) => (dt ? dt.split("T")[0] : "");
  const toggleExpand = (id: number) =>
    setExpandedRecordId((prev) => (prev === id ? null : id));

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validFiles = files.filter((f) => {
      if (!validTypes.includes(f.type)) {
        alert(`${f.name}: Format tidak didukung.`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert(`${f.name}: Maks 5MB.`);
        return false;
      }
      return true;
    });
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  }

  function handleRemoveImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function resetForm() {
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
    setImageFiles([]);
    setImagePreviews([]);
  }

  async function handleSaveRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.tanggal || !formData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi");
      return;
    }

    try {
      let payload: Parameters<typeof recordPlcService.create>[0];
      if (imageFiles.length > 0) {
        const fd = new FormData();
        fd.append("id_m_alat", String(equipment.id));
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        imageFiles.forEach((f) => fd.append("i_alat", f));
        payload = fd;
      } else {
        payload = { id_m_alat: equipment.id, ...formData, i_alat: null };
      }
      const response = await recordPlcService.create(payload);
      if (!response.data) throw new Error("Failed to save record");
      await fetchRecords();
      await fetchEquipmentStatus();
      setShowAddRecord(false);
      resetForm();
      showSuccess("Record PLC berhasil ditambahkan");
    } catch (error) {
      console.error("Error saving PLC record:", error);
      alert("Gagal menyimpan record. Silakan coba lagi.");
    }
  }

  async function handleDeleteRecord(recordId: number) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus record ini?"))
      return;
    try {
      await recordPlcService.delete(recordId);
      await fetchRecords();
      showSuccess("Record PLC berhasil dihapus");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus record.");
    }
  }

  const petugasOptions = staffList.map((s) => ({
    value: s.nama,
    label: s.nama,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            Detail Record Preventive PLC — {equipment.nama}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Nama", equipment.nama],
                ["Lokasi", equipment.lokasi],
                ["Device", equipment.device],
                ["Sensor", equipment.sensor],
                ["Instalasi", formatDate(equipment.instalasi)],
                ["Garansi", formatDate(equipment.garansi)],
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {value || "-"}
                  </p>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jenis PLC
                </label>
                <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-200">
                  {equipment.jenis}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${equipment.status === "Garansi" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                >
                  {equipment.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Gambar
              </label>
              <div className="relative w-full h-64">
                {equipment.i_alat ? (
                  <ImageDisplay
                    src={equipment.i_alat}
                    alt={`${equipment.nama} Image`}
                    className="w-full h-full border rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <ImageIcon size={40} className="mb-2 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold dark:text-gray-200">
              Status Maintenance
            </h3>
            <div className="space-y-4">
              <MaintenanceStatus
                equipment={equipmentWithStatus}
                showDetails={true}
              />
              {isAdmin && (
                <MaintenanceActions
                  equipment={equipmentWithStatus}
                  onUpdate={() => {
                    void fetchEquipmentStatus();
                    void fetchRecords();
                    onUpdate?.();
                  }}
                />
              )}
            </div>
          </div>

          <div className="pt-6 border-t dark:border-gray-700">
            {isMaintenanceActive ? (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-gray-200">
                  Related Records
                </h3>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Tambah Record</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-gray-200">
                    Related Records
                  </h3>
                </div>
                <div className="p-4 mb-4 text-sm text-blue-800 bg-blue-100 rounded-lg dark:bg-blue-900 dark:text-blue-200">
                  <p className="font-medium">ℹ️ Maintenance telah selesai</p>
                  <p className="mt-1">
                    Aktifkan kembali maintenance melalui "Pengaturan" jika
                    diperlukan.
                  </p>
                </div>
              </>
            )}

            {showAddRecord && (
              <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <form onSubmit={handleSaveRecord} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tanggal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) =>
                          setFormData({ ...formData, tanggal: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>

                    {/* Petugas — SearchableSelect */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Petugas <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={petugasOptions}
                        value={formData.petugas}
                        onChange={(val) =>
                          setFormData({ ...formData, petugas: val })
                        }
                        placeholder="Pilih Petugas"
                        disabled={staffList.length === 0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      {
                        label: "Kondisi Awal",
                        key: "awal",
                        required: true,
                        placeholder: "Kondisi alat sebelum maintenance...",
                      },
                      {
                        label: "Tindakan",
                        key: "tindakan",
                        required: true,
                        placeholder: "Tindakan yang dilakukan...",
                      },
                      {
                        label: "Spareparts",
                        key: "tambahan",
                        required: false,
                        placeholder:
                          "Sparepart yang diganti (isi - jika tidak ada)...",
                      },
                      {
                        label: "Kondisi Akhir",
                        key: "akhir",
                        required: true,
                        placeholder: "Kondisi setelah maintenance...",
                      },
                      {
                        label: "Rencana Berikutnya",
                        key: "berikutnya",
                        required: false,
                        placeholder: "Rencana maintenance berikutnya...",
                      },
                    ].map(({ label, key, required, placeholder }) => (
                      <div key={key}>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}{" "}
                          {required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          value={(formData as any)[key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder={placeholder}
                          required={required}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload Gambar
                      </label>
                      {imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative w-20 h-20 group">
                              <img
                                src={src}
                                className="object-cover w-full h-full border border-gray-300 rounded-md dark:border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label
                        htmlFor="plc-record-image"
                        className="flex flex-col items-center justify-center w-full h-20 transition-colors border-2 border-gray-300 border-dashed rounded-md cursor-pointer dark:border-gray-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600"
                      >
                        <Upload size={20} className="mb-1 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {imagePreviews.length > 0
                            ? "Tambah gambar lagi"
                            : "Klik untuk upload gambar"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          JPG, PNG, GIF, WEBP — Maks. 5MB
                        </span>
                        <input
                          id="plc-record-image"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRecord(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-hidden bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {[
                      "Tanggal",
                      "Deskripsi",
                      "Kondisi Awal",
                      "Tindakan",
                      "Keterangan",
                      "Gambar",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-sm text-center text-gray-400 dark:text-gray-500"
                      >
                        Belum ada record preventive PLC.
                      </td>
                    </tr>
                  )}
                  {records.map((record) => (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(record.tanggal)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {record.deskripsi}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {record.awal}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {record.tindakan}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {record.keterangan}
                        </td>
                        <td className="px-4 py-4">
                          {record.i_alat && record.i_alat.length > 0 ? (
                            <div
                              className="relative inline-block cursor-pointer"
                              onClick={() => toggleExpand(record.id)}
                              title={
                                record.i_alat.length > 1
                                  ? `Klik untuk lihat semua ${record.i_alat.length} gambar`
                                  : "Klik untuk detail"
                              }
                            >
                              <ImageThumbnail
                                src={record.i_alat[0]}
                                alt={`${record.deskripsi} (1)`}
                              />
                              {record.i_alat.length > 1 && (
                                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full shadow -top-1 -right-1">
                                  +{record.i_alat.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md w-14 h-14 dark:bg-gray-700 dark:border-gray-600">
                              <ImageIcon size={18} className="text-gray-300 dark:text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleExpand(record.id)}
                              className={`p-1 text-white rounded ${expandedRecordId === record.id ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                              <BookOpen size={12} />
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

                      {expandedRecordId === record.id && (
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              {[
                                ["Tambahan", record.tambahan],
                                ["Kondisi Akhir", record.akhir],
                                ["Rencana Berikutnya", record.berikutnya],
                                ["Petugas", record.petugas],
                              ].map(([label, value]) => (
                                <div key={label}>
                                  <label className="block text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                    {label}
                                  </label>
                                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                    {value || "-"}
                                  </p>
                                </div>
                              ))}
                              {record.i_alat && record.i_alat.length > 0 && (
                                <div className="md:col-span-3">
                                  <label className="block mb-2 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                    Gambar Record ({record.i_alat.length} foto)
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {record.i_alat.map(
                                      (src: string, idx: number) => (
                                        <ImageThumbnail
                                          key={idx}
                                          src={src}
                                          alt={`${record.deskripsi} - ${idx + 1}`}
                                        />
                                      ),
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    Klik gambar untuk memperbesar
                                  </p>
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