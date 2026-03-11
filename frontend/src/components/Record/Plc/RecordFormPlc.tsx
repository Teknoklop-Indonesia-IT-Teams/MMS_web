import React, { useState, useEffect, memo } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { Equipment } from "../../../types";
import { staffService } from "../../../services/api";
import {
  autoConvertHeic,
  getUploadFile,
  cleanupPreviewUrl,
  ConversionResult,
} from "../../../utils/autoHeicConverter";
import SearchableSelect from "../../Common/SearchableSelect";

interface PlcFormProps {
  equipment: Equipment | null;
  onSave: (
    data: FormData | Omit<Equipment, "id" | "created_at" | "updated_at">,
  ) => void;
  onCancel: () => void;
}

interface StaffMember {
  id: number;
  nama: string;
}
interface StaffApiResponse {
  id: number;
  nama?: string;
  petugas?: string;
  name?: string;
}
interface JenisPlc {
  id: number;
  jenis_plc: string;
}

const PlcForm: React.FC<PlcFormProps> = ({ equipment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nama: "",
    lokasi: "",
    jenisId: "" as string,
    instalasi: "",
    garansi: "",
    remot: false,
    status: "Garansi" as Equipment["status"],
    device: "",
    sensor: "",
    pelanggan: "",
    pic: "",
    maintenanceDate: "",
    maintenanceInterval: 90,
    isMaintenanceActive: false,
    i_alat: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [isHeicFile, setIsHeicFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [jenisList, setJenisList] = useState<JenisPlc[]>([]);
  const [loadingJenis, setLoadingJenis] = useState(false);

  // Fetch jenis PLC dari API
  useEffect(() => {
    const fetchJenis = async () => {
      try {
        setLoadingJenis(true);
        const res = await fetch(`${import.meta.env.VITE_URL}/api/plc`);
        const data: JenisPlc[] = await res.json();
        setJenisList(data);
        if (!equipment && data.length > 0) {
          setFormData((prev) => ({ ...prev, jenisId: String(data[0].id) }));
        }
      } catch (err) {
        console.error("❌ Error fetching jenis PLC:", err);
      } finally {
        setLoadingJenis(false);
      }
    };
    fetchJenis();
  }, []);

  useEffect(() => {
    if (formData.instalasi && !equipment) {
      setFormData((prev) => ({ ...prev, maintenanceDate: formData.instalasi }));
    }
  }, [formData.instalasi, equipment]);

  useEffect(() => {
    if (equipment) {
      setFormData({
        nama: equipment.nama,
        lokasi: equipment.lokasi,
        jenisId: String((equipment as any).jenisId || ""),
        instalasi: equipment.instalasi?.split("T")[0] || "",
        garansi: equipment.garansi?.split("T")[0] || "",
        remot: equipment.remot === "on",
        status: equipment.status,
        device: equipment.device,
        sensor: equipment.sensor,
        pelanggan: equipment.pelanggan,
        pic: equipment.pic,
        maintenanceDate: equipment.maintenanceDate?.split("T")[0] || "",
        maintenanceInterval: equipment.maintenanceInterval || 90,
        isMaintenanceActive: Boolean(equipment.isMaintenanceActive),
        i_alat: equipment.i_alat || "",
      });
      if (equipment.i_alat) {
        setImagePreview(
          `${import.meta.env.VITE_URL}/uploads/${equipment.i_alat}`,
        );
      }
      setSelectedFile(null);
      setIsHeicFile(false);
      setShouldRemoveImage(false);
    } else {
      setFormData({
        nama: "",
        lokasi: "",
        jenisId: "",
        instalasi: "",
        garansi: "",
        remot: false,
        status: "Garansi",
        device: "",
        sensor: "",
        pelanggan: "",
        pic: "",
        maintenanceDate: "",
        maintenanceInterval: 90,
        isMaintenanceActive: false,
        i_alat: "",
      });
      setImagePreview("");
      setSelectedFile(null);
      setIsHeicFile(false);
      setConversionResult(null);
      setShouldRemoveImage(false);
    }
  }, [equipment]);

  useEffect(() => {
    return () => {
      if (conversionResult?.previewUrl)
        cleanupPreviewUrl(conversionResult.previewUrl);
    };
  }, [conversionResult]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await staffService.getAll();
        const staffData = Array.isArray(response)
          ? response
          : response?.data || [];
        setStaffList(
          (staffData as StaffApiResponse[]).map((s) => ({
            id: s.id,
            nama: s.nama || s.petugas || s.name || "",
          })),
        );
      } catch (err) {
        console.error("❌ Error fetching staff:", err);
        setStaffList([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.lokasi.trim()) newErrors.lokasi = "Lokasi wajib diisi";
    if (!formData.jenisId) newErrors.jenisId = "Jenis wajib dipilih";
    if (!formData.instalasi.trim())
      newErrors.instalasi = "Tanggal instalasi wajib diisi";
    if (!formData.garansi.trim())
      newErrors.garansi = "Tanggal garansi wajib diisi";
    if (!formData.device.trim()) newErrors.device = "Device wajib diisi";
    if (!formData.sensor.trim()) newErrors.sensor = "Sensor wajib diisi";
    if (!formData.pelanggan.trim())
      newErrors.pelanggan = "Pelanggan wajib diisi";
    if (!formData.pic.trim()) newErrors.pic = "PIC wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fd = new FormData();
    fd.append("nama", formData.nama);
    fd.append("lokasi", formData.lokasi);
    fd.append("jenis", formData.jenisId);
    fd.append("instalasi", formData.instalasi);
    fd.append("garansi", formData.garansi);
    fd.append("remot", formData.remot ? "on" : "off");
    fd.append("status", formData.status);
    fd.append("device", formData.device);
    fd.append("sensor", formData.sensor);
    fd.append("pelanggan", formData.pelanggan);
    fd.append("pic", formData.pic);
    fd.append("maintenanceDate", formData.maintenanceDate || "");
    fd.append("maintenanceInterval", formData.maintenanceInterval.toString());
    fd.append("isMaintenanceActive", formData.isMaintenanceActive.toString());

    if (selectedFile) {
      fd.append("i_alat", selectedFile);
    } else if (shouldRemoveImage && equipment?.i_alat) {
      fd.append("removeImage", "true");
    }

    onSave(fd);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    setShouldRemoveImage(false);
    try {
      const result = await autoConvertHeic(file);
      setConversionResult(result);
      setIsHeicFile(result.isConverted);
      setSelectedFile(getUploadFile(result));
      setImagePreview(result.previewUrl);
    } catch (err) {
      console.error("❌ Error processing image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setIsHeicFile(false);
    setShouldRemoveImage(true);
    setConversionResult(null);
    const input = document.getElementById(
      "plc-image-upload",
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? "border-red-500" : "border-gray-300"}`;

  // Options untuk SearchableSelect
  const jenisOptions = jenisList.map((j) => ({
    value: String(j.id),
    label: j.jenis_plc,
  }));
  const picOptions = staffList.map((s) => ({ value: s.nama, label: s.nama }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            {equipment ? "Edit Alat PLC" : "Tambah Alat PLC"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nama */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                placeholder="PLC Bendungan X"
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className={inputClass("nama")}
              />
              {errors.nama && (
                <p className="mt-1 text-xs text-red-500">{errors.nama}</p>
              )}
            </div>

            {/* Lokasi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lokasi}
                placeholder="Bendungan Selorejo"
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
                className={inputClass("lokasi")}
              />
              {errors.lokasi && (
                <p className="mt-1 text-xs text-red-500">{errors.lokasi}</p>
              )}
            </div>

            {/* Jenis PLC — SearchableSelect */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Jenis PLC <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={jenisOptions}
                value={formData.jenisId}
                onChange={(val) => setFormData({ ...formData, jenisId: val })}
                placeholder="Pilih Jenis PLC"
                disabled={loadingJenis}
                hasError={!!errors.jenisId}
              />
              {errors.jenisId && (
                <p className="mt-1 text-xs text-red-500">{errors.jenisId}</p>
              )}
            </div>

            {/* Instalasi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tanggal Instalasi (BAST) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.instalasi}
                onChange={(e) =>
                  setFormData({ ...formData, instalasi: e.target.value })
                }
                className={inputClass("instalasi")}
              />
              {errors.instalasi && (
                <p className="mt-1 text-xs text-red-500">{errors.instalasi}</p>
              )}
            </div>

            {/* Garansi */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Garansi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.garansi}
                onChange={(e) =>
                  setFormData({ ...formData, garansi: e.target.value })
                }
                className={inputClass("garansi")}
              />
              {errors.garansi && (
                <p className="mt-1 text-xs text-red-500">{errors.garansi}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="flex pt-2 space-x-4">
                {["Garansi", "Habis"].map((s) => (
                  <label
                    key={s}
                    className="flex items-center text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="radio"
                      value={s}
                      checked={formData.status === s}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Equipment["status"],
                        })
                      }
                      className="mr-2"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Remote checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remot}
              onChange={(e) =>
                setFormData({ ...formData, remot: e.target.checked })
              }
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Remote
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Device */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Device <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.device}
                placeholder="Siemens S7-1200"
                onChange={(e) =>
                  setFormData({ ...formData, device: e.target.value })
                }
                className={inputClass("device")}
              />
              {errors.device && (
                <p className="mt-1 text-xs text-red-500">{errors.device}</p>
              )}
            </div>

            {/* Sensor */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sensor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sensor}
                placeholder="Sensor X"
                onChange={(e) =>
                  setFormData({ ...formData, sensor: e.target.value })
                }
                className={inputClass("sensor")}
              />
              {errors.sensor && (
                <p className="mt-1 text-xs text-red-500">{errors.sensor}</p>
              )}
            </div>

            {/* Pelanggan */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pelanggan}
                placeholder="PJTI"
                onChange={(e) =>
                  setFormData({ ...formData, pelanggan: e.target.value })
                }
                className={inputClass("pelanggan")}
              />
              {errors.pelanggan && (
                <p className="mt-1 text-xs text-red-500">{errors.pelanggan}</p>
              )}
            </div>

            {/* PIC — SearchableSelect */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                PIC <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={picOptions}
                value={formData.pic}
                onChange={(val) => setFormData({ ...formData, pic: val })}
                placeholder="Pilih PIC"
                disabled={loadingStaff}
                hasError={!!errors.pic}
              />
              {errors.pic && (
                <p className="mt-1 text-xs text-red-500">{errors.pic}</p>
              )}
            </div>
          </div>

          {/* Gambar */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Gambar
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="plc-image-upload"
                />
                <label
                  htmlFor="plc-image-upload"
                  className="flex items-center px-4 py-2 space-x-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                >
                  <Upload size={16} />
                  <span>
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </span>
                </label>
                {imagePreview && !imageLoading && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center px-3 py-2 space-x-1 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                    <span className="text-sm">Remove</span>
                  </button>
                )}
              </div>

              {imageLoading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm">
                    {isHeicFile ? "Processing HEIC..." : "Loading preview..."}
                  </span>
                </div>
              )}

              {imagePreview && !imageLoading && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-32 h-32 border-2 border-gray-300 rounded-lg"
                  />
                  {isHeicFile && (
                    <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      HEIC
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Settings (hanya saat tambah baru) */}
          {!equipment && (
            <div className="pt-6 border-t dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Pengaturan Maintenance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="plcMaintenanceActive"
                    checked={formData.isMaintenanceActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isMaintenanceActive: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="plcMaintenanceActive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Aktifkan Maintenance
                  </label>
                </div>
                {formData.isMaintenanceActive && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Interval Maintenance (hari)
                    </label>
                    <input
                      type="number"
                      value={formData.maintenanceInterval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenanceInterval: parseInt(e.target.value) || 90,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="90"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex pt-6 space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(PlcForm);
