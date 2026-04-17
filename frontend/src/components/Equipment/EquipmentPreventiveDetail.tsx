import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Pencil,
} from "lucide-react";
import { Equipment, PreRecord } from "../../types";
import { alatService, recordService, staffService } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { compressImage } from "../../utils/imageUtils";
import MaintenanceStatus from "./MaintenanceStatus";
import MaintenanceActions from "./MaintenanceActions";
import ImageDisplay from "../Common/ImageDisplay";
import { useAuth } from "../../hooks/useAuth";
import SearchableSelect from "../Common/SearchableSelect";

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
  role?: string;
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
const Lightbox = memo(function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <button
        className="absolute p-2 text-white transition-colors bg-gray-700 rounded-full top-4 right-4 hover:bg-gray-600"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt || "Record Image"} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        {alt && <p className="mt-2 text-sm text-center text-white opacity-75">{alt}</p>}
      </div>
    </div>,
    document.body,
  );
});

// ─── ImageThumbnail ───────────────────────────────────────────────────────────
const getFullUrl = (path: string): string => {
  if (path.startsWith("http")) return path;
  const baseUrl =
    import.meta.env.VITE_URL ||
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:3001";
  return `${baseUrl}${path}`;
};

const ImageThumbnail = memo(function ImageThumbnail({ src, alt }: { src: string; alt?: string }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const fullSrc = useMemo(() => getFullUrl(src), [src]);
  const open = useCallback(() => setShowLightbox(true), []);
  const close = useCallback(() => setShowLightbox(false), []);

  return (
    <>
      <div className="relative cursor-pointer w-14 h-14 group" onClick={open}>
        <img
          src={fullSrc}
          alt={alt || "Record Image"}
          className="object-cover transition-opacity border border-gray-200 rounded-md shadow-sm w-14 h-14 group-hover:opacity-80"
          loading="lazy"
          width={56}
          height={56}
        />
        <div className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 rounded-md group-hover:bg-opacity-30">
          <ZoomIn size={16} className="text-white transition-opacity opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      {showLightbox && <Lightbox src={fullSrc} alt={alt} onClose={close} />}
    </>
  );
});

// ─── RecordRow ────────────────────────────────────────────────────────────────
interface RecordRowProps {
  record: PreRecord;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onEdit: (record: PreRecord) => void;
  onDelete: (id: number) => void;
  formatDate: (dt: string) => string;
}

const RecordRow = memo(function RecordRow({
  record, isExpanded, onToggle, onEdit, onDelete, formatDate,
}: RecordRowProps) {
  const handleToggle = useCallback(() => onToggle(record.id), [onToggle, record.id]);
  const handleEdit = useCallback(() => onEdit(record), [onEdit, record]);
  const handleDelete = useCallback(() => onDelete(record.id), [onDelete, record.id]);

  return (
    <React.Fragment>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{formatDate(record.tanggal)}</td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.deskripsi}</td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.awal}</td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.tindakan}</td>
        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.keterangan}</td>
        <td className="px-4 py-4">
          {record.i_alat && record.i_alat.length > 0 ? (
            <div
              className="relative inline-block cursor-pointer"
              onClick={handleToggle}
              title={record.i_alat.length > 1 ? `Lihat semua ${record.i_alat.length} gambar` : "Detail"}
            >
              <ImageThumbnail src={record.i_alat[0]} alt={`${record.deskripsi} (1)`} />
              {record.i_alat.length > 1 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full shadow -top-1 -right-1">
                  +{record.i_alat.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:border-gray-600 w-14 h-14">
              <ImageIcon size={18} className="text-gray-300 dark:text-gray-500" />
            </div>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="flex space-x-1">
            <button
              onClick={handleToggle}
              className={`p-1 text-white rounded transition-colors ${isExpanded ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}`}
              title="Detail"
            >
              <BookOpen size={12} />
            </button>
            <button
              onClick={handleEdit}
              className="p-1 text-white bg-yellow-500 rounded hover:bg-yellow-600"
              title="Edit"
            >
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete} className="p-1 text-white bg-red-600 rounded hover:bg-red-700" title="Hapus">
              <Trash2 size={12} />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50 dark:bg-gray-700">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["Tambahan", record.tambahan],
                  ["Kondisi Akhir", record.akhir],
                  ["Rencana Berikutnya", record.berikutnya],
                  ["Petugas", record.petugas],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{label}</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || "-"}</p>
                </div>
              ))}
              {record.i_alat && record.i_alat.length > 0 && (
                <div className="md:col-span-3">
                  <label className="block mb-2 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Gambar Record ({record.i_alat.length} foto)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {record.i_alat.map((src, idx) => (
                      <ImageThumbnail key={idx} src={src} alt={`${record.deskripsi} - ${idx + 1}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Klik gambar untuk memperbesar</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
});

// ─── SensorList ───────────────────────────────────────────────────────────────
const SensorList = memo(function SensorList({ sensor }: { sensor: Equipment["sensor"] }) {
  const sensorArr: string[] = useMemo(() => {
    if (Array.isArray(sensor)) return sensor;
    if (!sensor) return [];
    try { return JSON.parse(sensor as string); } catch { return [sensor as string]; }
  }, [sensor]);

  if (!sensorArr.length) return <p className="text-sm text-gray-400">-</p>;

  return (
    <div className="overflow-y-auto max-h-32">
      <div className="grid grid-cols-2 gap-2">
        {sensorArr.map((item, idx) => {
          const [nama, id] = item.split(",").map((s) => s.trim());
          return (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full shrink-0">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{nama || "-"}</p>
                {id && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">ID: {id}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Form Fields config ───────────────────────────────────────────────────────
const TEXTAREA_FIELDS = [
  { label: "Kondisi Awal", key: "awal" as const, required: true, placeholder: "Kondisi alat sebelum maintenance..." },
  { label: "Tindakan", key: "tindakan" as const, required: true, placeholder: "Tindakan yang dilakukan..." },
  { label: "Spareparts", key: "tambahan" as const, required: false, placeholder: "Apakah ada sparepart yang diganti?\nJika tidak ada dapat diisi dengan tanda -" },
  { label: "Kondisi Akhir", key: "akhir" as const, required: true, placeholder: "Kondisi setelah maintenance..." },
  { label: "Rencana Berikutnya", key: "berikutnya" as const, required: false, placeholder: "Rencana maintenance berikutnya..." },
] as const;

type FormKey = "tanggal" | "deskripsi" | "awal" | "tindakan" | "tambahan" | "akhir" | "berikutnya" | "keterangan" | "petugas";

const emptyForm: Record<FormKey, string> = {
  tanggal: "", deskripsi: "", awal: "", tindakan: "",
  tambahan: "", akhir: "", berikutnya: "", keterangan: "", petugas: "",
};

// ─── RecordForm ───────────────────────────────────────────────────────────────
interface RecordFormProps {
  mode: "add" | "edit";
  formData: Record<FormKey, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<FormKey, string>>>;
  imagePreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNewImage: (idx: number) => void;
  keepImages?: string[];
  onRemoveExistingImage?: (path: string) => void;
  petugasOptions: { value: string; label: string }[];
  staffDisabled: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  uploadInputId: string;
  isSubmitting?: boolean;
}

const RecordForm = memo(function RecordForm({
  mode, formData, setFormData,
  imagePreviews, onImageChange, onRemoveNewImage,
  keepImages = [], onRemoveExistingImage,
  petugasOptions, staffDisabled,
  onSubmit, onCancel, uploadInputId,
  isSubmitting = false,
}: RecordFormProps) {
  const set = useCallback(
    (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
    [setFormData],
  );

  return (
    <div className="p-4 mb-4 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {mode === "add" ? "Tambah Record Baru" : "Edit Record"}
      </h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={set("tanggal")}
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
              onChange={set("deskripsi")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan</label>
            <input
              type="text"
              value={formData.keterangan}
              onChange={set("keterangan")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Petugas <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={petugasOptions}
              value={formData.petugas}
              onChange={(val) => setFormData((prev) => ({ ...prev, petugas: val }))}
              placeholder="Pilih Petugas"
              disabled={staffDisabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TEXTAREA_FIELDS.map(({ label, key, required, placeholder }) => (
            <div key={key}>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={formData[key]}
                onChange={set(key)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder={placeholder}
                required={required}
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "edit" ? "Gambar" : "Upload Gambar"}
            </label>

            {mode === "edit" && keepImages.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Gambar tersimpan (klik × untuk hapus):</p>
                <div className="flex flex-wrap gap-2">
                  {keepImages.map((src) => (
                    <div key={src} className="relative w-20 h-20 group">
                      <img
                        src={getFullUrl(src)}
                        className="object-cover w-full h-full border border-gray-300 rounded-md dark:border-gray-600"
                        width={80}
                        height={80}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveExistingImage?.(src)}
                        className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 group">
                    <img src={src} className="object-cover w-full h-full border border-gray-300 rounded-md dark:border-gray-600" width={80} height={80} />
                    <button
                      type="button"
                      onClick={() => onRemoveNewImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              htmlFor={uploadInputId}
              className="flex flex-col items-center justify-center w-full h-20 transition-colors border-2 border-gray-300 border-dashed rounded-md cursor-pointer dark:border-gray-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600"
            >
              <Upload size={20} className="mb-1 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {imagePreviews.length > 0 ? "Tambah gambar lagi" : "Klik untuk upload gambar"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, GIF, WEBP — Maks. 5MB</span>
              <input
                id={uploadInputId}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={onImageChange}
              />
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : mode === "add" ? "Simpan" : "Update"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EquipmentDetail({
  equipment,
  onClose,
  onUpdate,
}: EquipmentDetailProps) {
  const [records, setRecords] = useState<PreRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [equipmentWithStatus, setEquipmentWithStatus] = useState<Equipment>(equipment);
  const submittingRef = useRef(false);           // guard: tidak punya stale closure
  const [isSubmitting, setIsSubmitting] = useState(false); // hanya untuk UI (disabled/teks)
  const [showMainImageLightbox, setShowMainImageLightbox] = useState(false);

  // Add form state
  const [addFormData, setAddFormData] = useState<Record<FormKey, string>>(emptyForm);
  const [addImageFiles, setAddImageFiles] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);

  // Edit form state
  const [editingRecord, setEditingRecord] = useState<PreRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Record<FormKey, string>>(emptyForm);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editKeepImages, setEditKeepImages] = useState<string[]>([]);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { showSuccess } = useToast();

  const isMaintenanceActive = (() => {
    const v = Boolean(equipmentWithStatus.isMaintenanceActive);
    if (v === false || String(v).toLowerCase() === "false" || String(v) === "0") return false;
    if (v === true || String(v).toLowerCase() === "true" || String(v) === "1") return true;
    return false;
  })();

  const formatDate = useCallback((dt: string) => (dt ? dt.split("T")[0] : ""), []);

  const fetchRecords = useCallback(async () => {
    try {
      const r = await recordService.getByEquipmentId(equipment.id);
      setRecords(r.data);
    } catch (e) { console.error(e); }
  }, [equipment.id]);

  const fetchEquipmentStatus = useCallback(async () => {
    try {
      const r = await alatService.getWithMaintenanceStatus(equipment.id);
      setEquipmentWithStatus(r.data);
    } catch (e) { console.error("Error fetching equipment status:", e); }
  }, [equipment.id]);

  const fetchStaff = useCallback(async () => {
    try {
      const r = await staffService.getAll();
      if (r?.data) {
        const data = Array.isArray(r.data) ? r.data : [];
        setStaffList(
          (data as unknown as StaffResponse[]).map((s) => ({ id: s.id, nama: s.nama || s.petugas || "" })),
        );
      }
    } catch (e) { console.error(e); setStaffList([]); }
  }, []);

  useEffect(() => {
    void fetchRecords();
    void fetchStaff();
    void fetchEquipmentStatus();
  }, [fetchRecords, fetchStaff, fetchEquipmentStatus]);

  const petugasOptions = useMemo(
    () => staffList.map((s) => ({ value: s.nama, label: s.nama })),
    [staffList],
  );

  // ─── Image handlers ─────────────────────────────────────────────────────────
  const handleAddImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files || []).filter((f) => {
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(f.type)) { alert(`${f.name}: Format tidak didukung.`); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}: Ukuran terlalu besar (maks 5MB).`); return false; }
      return true;
    });
    if (!raw.length) return;
    const compressed = await Promise.all(raw.map((f) => compressImage(f)));
    setAddImageFiles((prev) => [...prev, ...compressed]);
    setAddImagePreviews((prev) => [...prev, ...compressed.map((f) => URL.createObjectURL(f))]);
  }, []);

  const handleEditImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files || []).filter((f) => {
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(f.type)) { alert(`${f.name}: Format tidak didukung.`); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}: Ukuran terlalu besar (maks 5MB).`); return false; }
      return true;
    });
    if (!raw.length) return;
    const compressed = await Promise.all(raw.map((f) => compressImage(f)));
    if (compressed.length > 0) {
      setEditImageFiles((prev) => [...prev, ...compressed]);
      setEditImagePreviews((prev) => [...prev, ...compressed.map((f) => URL.createObjectURL(f))]);
      // Gambar lama otomatis dihapus saat gambar baru diupload
      setEditKeepImages([]);
    }
  }, []);

  const handleRemoveAddImage = useCallback((idx: number) => {
    setAddImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setAddImagePreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
  }, []);

  const handleRemoveEditImage = useCallback((idx: number) => {
    setEditImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setEditImagePreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx); });
  }, []);

  const handleRemoveExistingImage = useCallback((path: string) => {
    setEditKeepImages((prev) => prev.filter((p) => p !== path));
  }, []);

  // ─── Add ────────────────────────────────────────────────────────────────────
  const resetAddForm = useCallback(() => {
    setAddFormData(emptyForm);
    setAddImagePreviews((prev) => { prev.forEach(URL.revokeObjectURL); return []; });
    setAddImageFiles([]);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingRecord(null);
    setShowAddRecord(true);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setShowAddRecord(false);
    resetAddForm();
  }, [resetAddForm]);

  const handleSaveRecord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;          // ref-guard: selalu current, tidak stale
    if (!addFormData.tanggal || !addFormData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi"); return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      let payload: Parameters<typeof recordService.create>[0];
      if (addImageFiles.length > 0) {
        const fd = new FormData();
        fd.append("id_m_alat", String(equipment.id));
        Object.entries(addFormData).forEach(([k, v]) => fd.append(k, v));
        addImageFiles.forEach((file) => fd.append("i_alat", file));
        payload = fd;
      } else {
        payload = { id_m_alat: equipment.id, ...addFormData, i_alat: null };
      }
      const response = await recordService.create(payload);
      if (!response.data) throw new Error("Failed to save record");
      await fetchRecords();
      await fetchEquipmentStatus();
      setShowAddRecord(false);
      resetAddForm();
      showSuccess("Record berhasil ditambahkan");
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Gagal menyimpan record. Silakan coba lagi.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [addFormData, addImageFiles, equipment.id, fetchRecords, fetchEquipmentStatus, resetAddForm, showSuccess]);

  // ─── Edit ───────────────────────────────────────────────────────────────────
  const handleEditRecord = useCallback((record: PreRecord) => {
    setShowAddRecord(false);
    setEditingRecord(record);
    setEditFormData({
      tanggal: formatDate(record.tanggal),
      deskripsi: record.deskripsi || "",
      awal: record.awal || "",
      tindakan: record.tindakan || "",
      tambahan: record.tambahan || "",
      akhir: record.akhir || "",
      berikutnya: record.berikutnya || "",
      keterangan: record.keterangan || "",
      petugas: record.petugas || "",
    });
    setEditKeepImages(record.i_alat || []);
    setEditImageFiles([]);
    setEditImagePreviews([]);
  }, [formatDate]);

  const resetEditForm = useCallback(() => {
    setEditingRecord(null);
    setEditFormData(emptyForm);
    setEditImagePreviews((prev) => { prev.forEach(URL.revokeObjectURL); return []; });
    setEditImageFiles([]);
    setEditKeepImages([]);
  }, []);

  const handleUpdateRecord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || !editingRecord) return;
    if (!editFormData.tanggal || !editFormData.deskripsi) {
      alert("Tanggal dan Deskripsi harus diisi"); return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("id_m_alat", String(equipment.id));
      Object.entries(editFormData).forEach(([k, v]) => fd.append(k, v));
      fd.append("keepImages", JSON.stringify(editKeepImages));
      editImageFiles.forEach((file) => fd.append("i_alat", file));
      await recordService.update(String(editingRecord.id), fd);
      await fetchRecords();
      resetEditForm();
      showSuccess("Record berhasil diupdate");
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate record. Silakan coba lagi.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [editingRecord, editFormData, editKeepImages, editImageFiles, equipment.id, fetchRecords, resetEditForm, showSuccess]);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteRecord = useCallback(async (recordId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus record ini?")) return;
    try {
      await recordService.delete(recordId);
      if (editingRecord?.id === recordId) resetEditForm();
      await fetchRecords();
      showSuccess("Record berhasil dihapus");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus record.");
    }
  }, [fetchRecords, showSuccess, editingRecord, resetEditForm]);

  const toggleRecordDetail = useCallback((id: number) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  }, []);

  const mainImageSrc = useMemo(() => {
    if (!equipment.i_alat) return "";
    const src = equipment.i_alat as string;
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    const base = import.meta.env.VITE_URL || window.location.origin;
    return src.startsWith("/") ? `${base}${src}` : `${base}/uploads/${src}`;
  }, [equipment.i_alat]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-lg shadow-xl dark:bg-gray-800 flex flex-col"
        style={{ height: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            Detail Record Maintenance {equipment.nama}
          </h2>
          <button onClick={onClose} className="text-gray-400 transition-colors dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Equipment info */}
          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["Nama", equipment.nama],
                    ["Lokasi", equipment.lokasi],
                    ["Instalasi", formatDate(equipment.instalasi)],
                    ["Garansi", formatDate(equipment.garansi)],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <p className="text-gray-900 dark:text-gray-100">{value || "-"}</p>
                  </div>
                ))}

                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device</label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {Array.isArray(equipment.device) ? (equipment.device.length > 0 ? equipment.device.join(", ") : "-") : (equipment.device || "-")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis</label>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{equipment.jenis}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${equipment.status === "Garansi" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {equipment.status}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Sensor</label>
                  <SensorList sensor={equipment.sensor} />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Gambar</label>
              <div className="relative w-full h-64 group">
                {equipment.i_alat ? (
                  <>
                    <ImageDisplay
                      src={equipment.i_alat}
                      alt={`${equipment.nama} Image`}
                      className="w-full h-full border rounded-lg shadow-sm"
                      onError={() => console.log(`Image failed: ${equipment.i_alat}`)}
                      onLoad={() => console.log(`Image loaded: ${equipment.i_alat}`)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMainImageLightbox(true)}
                      className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75"
                    >
                      <ZoomIn size={14} /> Fullscreen
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <ImageIcon size={40} className="mb-2 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>
              {showMainImageLightbox && equipment.i_alat && (
                <Lightbox src={mainImageSrc} alt={equipment.nama} onClose={() => setShowMainImageLightbox(false)} />
              )}
            </div>
          </div>

          {/* Maintenance Status */}
          <div className="pt-6 border-t">
            <h3 className="mb-4 text-lg font-semibold dark:text-gray-200">Status Maintenance</h3>
            <div className="space-y-4">
              <MaintenanceStatus equipment={equipmentWithStatus} showDetails={true} />
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

          {/* Records */}
          <div className="pt-6 border-t">
            {isMaintenanceActive ? (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-gray-200">Related Records</h3>
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Tambah Record</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold dark:text-gray-200">Related Records</h3>
                </div>
                <div className="p-4 mb-4 text-sm text-blue-800 bg-blue-100 rounded-lg">
                  <p className="font-medium">ℹ️ Maintenance telah selesai</p>
                  <p className="mt-1">Aktifkan kembali maintenance melalui "Pengaturan" jika diperlukan.</p>
                </div>
              </>
            )}

            {/* Add form */}
            {showAddRecord && (
              <RecordForm
                mode="add"
                formData={addFormData}
                setFormData={setAddFormData}
                imagePreviews={addImagePreviews}
                onImageChange={handleAddImageChange}
                onRemoveNewImage={handleRemoveAddImage}
                petugasOptions={petugasOptions}
                staffDisabled={staffList.length === 0}
                onSubmit={handleSaveRecord}
                onCancel={handleCancelAdd}
                uploadInputId="preventive-add-image-upload"
                isSubmitting={isSubmitting}
              />
            )}

            {/* Edit form */}
            {editingRecord && (
              <RecordForm
                mode="edit"
                formData={editFormData}
                setFormData={setEditFormData}
                imagePreviews={editImagePreviews}
                onImageChange={handleEditImageChange}
                onRemoveNewImage={handleRemoveEditImage}
                keepImages={editKeepImages}
                onRemoveExistingImage={handleRemoveExistingImage}
                petugasOptions={petugasOptions}
                staffDisabled={staffList.length === 0}
                onSubmit={handleUpdateRecord}
                onCancel={resetEditForm}
                uploadInputId="preventive-edit-image-upload"
                isSubmitting={isSubmitting}
              />
            )}

            {/* Table */}
            <div className="overflow-auto bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700" style={{ contain: "layout" }}>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {["Tanggal", "Deskripsi", "Kondisi Awal", "Tindakan", "Keterangan", "Gambar", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-sm text-center text-gray-400 dark:text-gray-500">
                        Belum ada record maintenance.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <RecordRow
                        key={record.id}
                        record={record}
                        isExpanded={expandedRecordId === record.id}
                        onToggle={toggleRecordDetail}
                        onEdit={handleEditRecord}
                        onDelete={handleDeleteRecord}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
