import React, { useState, useEffect, memo } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { Equipment } from "../../types";
import { staffService } from "../../services/api";
import {
  autoConvertHeic,
  getUploadFile,
  cleanupPreviewUrl,
  ConversionResult,
} from "../../utils/autoHeicConverter";
import SearchableSelect from "../Common/SearchableSelect";

interface EquipmentFormProps {
  equipment: Equipment | null;
  onSave: (
    equipmentData:
      | FormData
      | Omit<Equipment, "id" | "created_at" | "updated_at">,
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

interface JenisTelemetry {
  id: number;
  jenis_telemetry: string;
}

interface ClientItem {
  id: number;
  nama_client: string;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    lokasi: "",
    jenis: "" as Equipment["jenis"],
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
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [isHeicFile, setIsHeicFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);

  const [jenisList, setJenisList] = useState<JenisTelemetry[]>([]);
  const [loadingJenis, setLoadingJenis] = useState(false);
  const [clientList, setClientList] = useState<ClientItem[]>([]);
  const [loadingClient, setLoadingClient] = useState(false);

  // Fetch jenis telemetry dari API
  useEffect(() => {
    const fetchJenis = async () => {
      try {
        setLoadingJenis(true);
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/telemetry`,
        );
        const data: JenisTelemetry[] = await response.json();
        setJenisList(data);

        if (!equipment && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            jenis: data[0].jenis_telemetry as Equipment["jenis"],
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching jenis telemetry:", error);
        setJenisList([]);
      } finally {
        setLoadingJenis(false);
      }
    };
    fetchJenis();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoadingClient(true);
        const response = await fetch(`${import.meta.env.VITE_URL}/api/client`);
        const data: ClientItem[] = await response.json();
        setClientList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Error fetching client:", error);
        setClientList([]);
      } finally {
        setLoadingClient(false);
      }
    };
    fetchClient();
  }, []);

  useEffect(() => {
    if (formData.instalasi && !equipment) {
      setFormData((prev) => ({
        ...prev,
        maintenanceDate: formData.instalasi,
      }));
    }
  }, [formData.instalasi, equipment]);

  useEffect(() => {
    if (equipment) {
      setFormData({
        nama: equipment.nama,
        lokasi: equipment.lokasi,
        jenis: equipment.jenis,
        instalasi: equipment.instalasi?.split("T")[0] || "",
        garansi: equipment.garansi?.split("T")[0] || "",
        remot: equipment.remot === "on",
        status: equipment.status,
        device: equipment.device,
        sensor: equipment.sensor,
        pelanggan: equipment.pelanggan ? equipment.pelanggan.toString() : "",
        pic: equipment.pic,
        maintenanceDate: equipment.maintenanceDate?.split("T")[0] || "",
        maintenanceInterval: equipment.maintenanceInterval || 90,
        isMaintenanceActive: Boolean(equipment.isMaintenanceActive) || false,
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
        jenis: "" as Equipment["jenis"],
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
      setImagePreview("");
      setSelectedFile(null);
      setIsHeicFile(false);
      setConversionResult(null);
      setShouldRemoveImage(false);
    }
  }, [equipment]);

  useEffect(() => {
    return () => {
      if (conversionResult?.previewUrl) {
        cleanupPreviewUrl(conversionResult.previewUrl);
      }
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
        const mappedStaff = (staffData as StaffApiResponse[]).map((staff) => ({
          id: staff.id,
          nama: staff.nama || staff.petugas || staff.name || "",
        }));
        setStaffList(mappedStaff);
      } catch (error) {
        console.error("❌ Error fetching staff:", error);
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

    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors);
      return;
    }

    try {
      const formDataToSubmit = new FormData();

      formDataToSubmit.append("nama", formData.nama);
      formDataToSubmit.append("lokasi", formData.lokasi);
      formDataToSubmit.append("jenis", formData.jenis);
      formDataToSubmit.append("instalasi", formData.instalasi);
      formDataToSubmit.append("garansi", formData.garansi);
      formDataToSubmit.append("remot", formData.remot ? "on" : "off");
      formDataToSubmit.append("status", formData.status);
      formDataToSubmit.append("device", formData.device);
      formDataToSubmit.append("sensor", formData.sensor);
      formDataToSubmit.append("pelanggan", formData.pelanggan);
      formDataToSubmit.append("pic", formData.pic);
      formDataToSubmit.append(
        "maintenanceDate",
        formData.maintenanceDate || "",
      );
      formDataToSubmit.append(
        "maintenanceInterval",
        formData.maintenanceInterval.toString(),
      );
      formDataToSubmit.append(
        "isMaintenanceActive",
        formData.isMaintenanceActive.toString(),
      );

      if (selectedFile) {
        console.log("📤 Uploading new file:", selectedFile.name);
        formDataToSubmit.append("i_alat", selectedFile);
      } else if (shouldRemoveImage && equipment?.i_alat) {
        console.log("🗑️ Removing image");
        formDataToSubmit.append("removeImage", "true");
      }

      onSave(formDataToSubmit);
    } catch (error) {
      console.error("❌ Error preparing form data:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("⚠️ No file selected");
      return;
    }

    setImageLoading(true);
    setShouldRemoveImage(false);

    try {
      const result = await autoConvertHeic(file);
      setConversionResult(result);
      setIsHeicFile(result.isConverted);

      const uploadFile = getUploadFile(result);
      setSelectedFile(uploadFile);
      setImagePreview(result.previewUrl);

      console.log("✅ Image processed:", uploadFile.name);
    } catch (error) {
      console.error("❌ Error processing image:", error);
      setImagePreview(
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkVGMkY0IiBzdHJva2U9IiNGQ0E1QTUiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI0MCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjRjU5RTBCIj5QcmV2aWV3IEVycm9yPC90ZXh0Pgo8L3N2Zz4=",
      );
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

    const fileInput = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    console.log("🗑️ Image marked for removal");
  };

  // Reusable class strings
  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
     bg-white dark:bg-gray-700
     text-gray-900 dark:text-gray-100
     placeholder-gray-400 dark:placeholder-gray-500
     ${hasError ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`;

  const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300";

  const jenisOptions = jenisList.map((j) => ({
    value: j.jenis_telemetry,
    label: j.jenis_telemetry,
  }));

  const picOptions = staffList.map((s) => ({
    value: s.nama,
    label: s.nama,
  }));

  const clientOptions = clientList.map((c) => ({
    value: c.id.toString(),
    label: c.nama_client,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {equipment ? "Edit Alat" : "Tambah Alat"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 transition-colors dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Nama */}
            <div>
              <label className={labelClass}>
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                placeholder="ARR"
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className={inputClass(!!errors.nama)}
              />
              {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Lokasi */}
            <div>
              <label className={labelClass}>
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lokasi}
                placeholder="Bendungan Selorejo"
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className={inputClass(!!errors.lokasi)}
              />
              {errors.lokasi && <p className="mt-1 text-xs text-red-500">{errors.lokasi}</p>}
            </div>

            {/* Jenis — SearchableSelect */}
            <div>
              <label className={labelClass}>
                Jenis <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={jenisOptions}
                value={formData.jenis}
                onChange={(val) =>
                  setFormData({ ...formData, jenis: val as Equipment["jenis"] })
                }
                placeholder={loadingJenis ? "Memuat data jenis..." : "Pilih Jenis"}
                disabled={loadingJenis}
              />
              {loadingJenis && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Memuat...</p>
              )}
            </div>

            {/* Tanggal Instalasi */}
            <div>
              <label className={labelClass}>
                Tanggal Instalasi (BAST) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.instalasi}
                onChange={(e) => setFormData({ ...formData, instalasi: e.target.value })}
                className={inputClass(!!errors.instalasi)}
              />
              {errors.instalasi && <p className="mt-1 text-xs text-red-500">{errors.instalasi}</p>}
            </div>

            {/* Garansi */}
            <div>
              <label className={labelClass}>
                Garansi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.garansi}
                onChange={(e) => setFormData({ ...formData, garansi: e.target.value })}
                className={inputClass(!!errors.garansi)}
              />
              {errors.garansi && <p className="mt-1 text-xs text-red-500">{errors.garansi}</p>}
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <div className="flex pt-2 space-x-4">
                {(["Garansi", "Habis"] as Equipment["status"][]).map((s) => (
                  <label key={s} className="flex items-center text-sm text-gray-700 cursor-pointer dark:text-gray-300">
                    <input
                      type="radio"
                      value={s}
                      checked={formData.status === s}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as Equipment["status"] })
                      }
                      className="mr-2 accent-blue-600"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Remote */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.remot}
              onChange={(e) => setFormData({ ...formData, remot: e.target.checked })}
              className="mr-2 accent-blue-600"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Remote</label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* Device */}
            <div>
              <label className={labelClass}>
                Device <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.device}
                placeholder="RTCU"
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                className={inputClass(!!errors.device)}
              />
              {errors.device && <p className="mt-1 text-xs text-red-500">{errors.device}</p>}
            </div>

            {/* Sensor */}
            <div>
              <label className={labelClass}>
                Sensor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sensor}
                placeholder="Vegapulse C23"
                onChange={(e) => setFormData({ ...formData, sensor: e.target.value })}
                className={inputClass(!!errors.sensor)}
              />
              {errors.sensor && <p className="mt-1 text-xs text-red-500">{errors.sensor}</p>}
            </div>

            {/* Pelanggan */}
            <div>
              <label className={labelClass}>
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={clientOptions}
                value={formData.pelanggan}
                onChange={(val) => setFormData({ ...formData, pelanggan: val })}
                placeholder={loadingClient ? "Memuat data client..." : "Pilih Pelanggan"}
                disabled={loadingClient}
                hasError={!!errors.pelanggan}
              />
              {errors.pelanggan && <p className="mt-1 text-xs text-red-500">{errors.pelanggan}</p>}
            </div>

            {/* PIC — SearchableSelect */}
            <div>
              <label className={labelClass}>
                PIC <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={picOptions}
                value={formData.pic}
                onChange={(val) => setFormData({ ...formData, pic: val })}
                placeholder={loadingStaff ? "Memuat data petugas..." : "Pilih PIC"}
                disabled={loadingStaff}
                hasError={!!errors.pic}
              />
              {errors.pic && <p className="mt-1 text-xs text-red-500">{errors.pic}</p>}
            </div>
          </div>

          {/* Gambar */}
          <div>
            <label className={labelClass}>Gambar</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-md cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Upload size={16} />
                  <span className="text-sm">
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </span>
                </label>

                {imagePreview && !imageLoading && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center px-3 py-2 space-x-1 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                    <span className="text-sm">Remove</span>
                  </button>
                )}
              </div>

              {imageLoading && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
                  <span className="text-sm">
                    {isHeicFile ? "Processing HEIC file..." : "Loading preview..."}
                  </span>
                </div>
              )}

              {imagePreview && !imageLoading && (
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-32 h-32 border-2 border-gray-300 rounded-lg dark:border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTI1IDMwaDMwdjIwSDI1VjMweiIgZmlsbD0iIzlDQTNBRiIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzciIHI9IjMiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJtMzggNDMgNS01IDcgN1Y1MEgyNXYtN2w3LTciIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4K";
                      }}
                    />
                    {isHeicFile && (
                      <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                        HEIC
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      {isHeicFile && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ✓ HEIC converted to JPEG
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pengaturan Maintenance — hanya saat tambah baru */}
          {!equipment && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Pengaturan Maintenance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceActive"
                    checked={formData.isMaintenanceActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isMaintenanceActive: e.target.checked })
                    }
                    className="mr-2 accent-blue-600"
                  />
                  <label
                    htmlFor="maintenanceActive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Aktifkan Maintenance
                  </label>
                </div>

                {formData.isMaintenanceActive && (
                  <div>
                    <label className={labelClass}>Interval Maintenance (hari)</label>
                    <input
                      type="number"
                      value={formData.maintenanceInterval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenanceInterval: parseInt(e.target.value) || 90,
                        })
                      }
                      className={inputClass()}
                      min="1"
                      placeholder="90"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex pt-6 space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(EquipmentForm);