import React, { useState, useEffect, memo } from "react";
import { X, Upload } from "lucide-react";
import { Equipment } from "../../types";
import { staffService } from "../../services/api";
import {
  autoConvertHeic,
  getUploadFile,
  cleanupPreviewUrl,
  ConversionResult,
} from "../../utils/autoHeicConverter";
import { log } from "console";
import axios from "axios";

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

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    lokasi: "",
    jenis: "ARR" as Equipment["jenis"],
    instalasi: "",
    garansi: "",
    remot: false,
    status: "Garansi" as Equipment["status"],
    device: "",
    sensor: "",
    pelanggan: "",
    pic: "",
    // Maintenance fields
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

  useEffect(() => {
    if (equipment) {
      setFormData({
        nama: equipment.nama,
        lokasi: equipment.lokasi,
        jenis: equipment.jenis,
        instalasi: equipment.instalasi,
        garansi: equipment.garansi,
        remot: equipment.remot === "on",
        status: equipment.status,
        device: equipment.device,
        sensor: equipment.sensor,
        pelanggan: equipment.pelanggan,
        pic: equipment.pic,
        // Maintenance fields
        maintenanceDate: equipment.maintenanceDate
          ? equipment.maintenanceDate.split("T")[0]
          : "",
        maintenanceInterval: equipment.maintenanceInterval || 90,
        isMaintenanceActive: Boolean(equipment.isMaintenanceActive) || false,
        i_alat: equipment.i_alat || "",
      });
      if (equipment.i_alat) {
        setImagePreview(
          `${import.meta.env.VITE_URL}/uploads/${equipment.i_alat}`,
        );
      }
      // Reset file state saat editing
      setSelectedFile(null);
      setIsHeicFile(false);
    } else {
      // Reset semua state saat tambah baru
      setImagePreview("");
      setSelectedFile(null);
      setIsHeicFile(false);
      setConversionResult(null);
    }
  }, [equipment]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (conversionResult?.previewUrl) {
        cleanupPreviewUrl(conversionResult.previewUrl);
      }
    };
  }, [conversionResult]);

  // Fetch staff data for PIC dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await staffService.getAll();

        // Handle direct array response from staff API
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

    const formDataToSubmit = new FormData();
    if (validateForm()) {
      try {
        // Append all text fields
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

        // ========== IMAGE HANDLING LOGIC ==========
        if (selectedFile) {
          // Ada file baru yang dipilih
          formDataToSubmit.append("i_alat", selectedFile);
        } else {
          // Tidak ada file baru
          if (equipment) {
            // Mode EDIT
            if (!imagePreview && equipment.i_alat) {
              // User menghapus gambar yang ada
              formDataToSubmit.append("i_alat", ""); // Kirim string kosong
              formDataToSubmit.append("removeImage", "true");
            }
          }
        }
        onSave(formDataToSubmit);
      } catch (error) {
        console.error("❌ Error preparing form data:", error);
      }
    } else {
      console.log("❌ Form validation failed:", errors);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageLoading(true);

      try {
        // Auto-convert HEIC if needed
        const result = await autoConvertHeic(file);
        setConversionResult(result);

        // Set states based on conversion result
        setIsHeicFile(result.isConverted);
        const uploadFile = getUploadFile(result);
        setSelectedFile(uploadFile); // Use converted file if available
        setImagePreview(result.previewUrl);
      } catch (error) {
        console.error("❌ Error processing image:", error);
        // Fallback error handling
        setImagePreview(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkVGMkY0IiBzdHJva2U9IiNGQ0E1QTUiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI0MCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjRjU5RTBCIj5QcmV2aWV3IEVycm9yPC90ZXh0Pgo8dGV4dCB4PSI0MCIgeT0iNDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiBmaWxsPSIjNzM3Mzc0Ij5GaWxlIFVwbG9hZGVkPC90ZXh0Pgo8dGV4dCB4PSI0MCIgeT0iNTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiBmaWxsPSIjNzM3Mzc0Ij5CdXQgUmVhZHk8L3RleHQ+Cjwvc3ZnPgo=",
        );
      } finally {
        setImageLoading(false);
      }
    } else {
      console.log("⚠️ No file selected");
    }
  };

  const deviceTypes: Equipment["jenis"][] = [
    "ARR",
    "AWLR",
    "WQMS",
    "Flow Meter",
    "Rembesan",
    "GWL",
    "Weather Station",
    "CCTV",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {equipment ? "Edit Alat" : "Tambah Alat"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nama ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nama && (
                <p className="mt-1 text-xs text-red-500">{errors.nama}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lokasi ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lokasi && (
                <p className="mt-1 text-xs text-red-500">{errors.lokasi}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Jenis <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenis: e.target.value as Equipment["jenis"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Instalasi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.instalasi}
                onChange={(e) =>
                  setFormData({ ...formData, instalasi: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.instalasi ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.instalasi && (
                <p className="mt-1 text-xs text-red-500">{errors.instalasi}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Garansi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.garansi}
                onChange={(e) =>
                  setFormData({ ...formData, garansi: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.garansi ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.garansi && (
                <p className="mt-1 text-xs text-red-500">{errors.garansi}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex pt-2 space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Garansi"
                    checked={formData.status === "Garansi"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Equipment["status"],
                      })
                    }
                    className="mr-2"
                  />
                  Garansi
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Habis"
                    checked={formData.status === "Habis"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Equipment["status"],
                      })
                    }
                    className="mr-2"
                  />
                  Habis
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.remot}
              onChange={(e) =>
                setFormData({ ...formData, remot: e.target.checked })
              }
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Remot</label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Device <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.device}
                onChange={(e) =>
                  setFormData({ ...formData, device: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.device ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.device && (
                <p className="mt-1 text-xs text-red-500">{errors.device}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Sensor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sensor}
                onChange={(e) =>
                  setFormData({ ...formData, sensor: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sensor ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.sensor && (
                <p className="mt-1 text-xs text-red-500">{errors.sensor}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pelanggan}
                onChange={(e) =>
                  setFormData({ ...formData, pelanggan: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pelanggan ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pelanggan && (
                <p className="mt-1 text-xs text-red-500">{errors.pelanggan}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                PIC <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.pic}
                onChange={(e) =>
                  setFormData({ ...formData, pic: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pic ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingStaff}
              >
                <option value="">
                  {loadingStaff ? "Memuat data petugas..." : "Pilih PIC"}
                </option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.nama}>
                    {equipment?.pic === staff.nama
                      ? `${staff.nama} (Current)`
                      : staff.nama}
                  </option>
                ))}
              </select>
              {errors.pic && (
                <p className="mt-1 text-xs text-red-500">{errors.pic}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Gambar
            </label>
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
                className="flex items-center px-4 py-2 space-x-2 transition-colors bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
              >
                <Upload size={16} />
                <span>{selectedFile ? selectedFile.name : "Choose File"}</span>
              </label>
              {imageLoading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm">
                    {isHeicFile
                      ? "Processing HEIC file..."
                      : "Loading preview..."}
                  </span>
                </div>
              )}
              {imagePreview && !imageLoading && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-20 h-20 border rounded-md"
                      onError={(e) => {
                        console.log("Image failed to load, showing fallback");
                        // Show a generic image placeholder if image fails to load
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+PHBhdGggZD0iTTI1IDMwaDMwdjIwSDI1VjMweiIgZmlsbD0iIzlDQTNBRiIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzciIHI9IjMiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJtMzggNDMgNS01IDcgN1Y1MEgyNXYtN2w3LTciIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4K";
                      }}
                    />
                    {isHeicFile && (
                      <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-green-500 text-white text-xs rounded-full">
                        HEIC
                      </div>
                    )}
                  </div>
                  {selectedFile && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 truncate max-w-20">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      {isHeicFile && (
                        <p className="text-xs text-green-600">
                          HEIC file ready
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Settings Section */}
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Pengaturan Maintenance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceActive"
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
                  htmlFor="maintenanceActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Aktifkan Maintenance
                </label>
              </div>

              {formData.isMaintenanceActive && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Tanggal Terakhir Maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.maintenanceDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maintenanceDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
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
                </div>
              )}
            </div>
          </div>

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
