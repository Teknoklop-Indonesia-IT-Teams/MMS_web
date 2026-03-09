import React, { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2, BookOpen, Upload, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Equipment } from "../../../types";
import { recordPlcService, staffService } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../hooks/useAuth";
import SearchableSelect from "../../Common/SearchableSelect";
import ImageDisplay from "../../Common/ImageDisplay";

interface Props { equipment: Equipment; onClose: () => void; }
interface StaffMember { id: number; nama: string; }
interface StaffResponse { id: number; nama?: string; petugas?: string; }
interface CorrectiveRecord {
    id: number; tanggal: string; deskripsi: string; awal: string;
    tindakan: string; tambahan: string; akhir: string; berikutnya: string;
    keterangan: string; petugas: string; i_alat: string[] | null;
    i_panel?: string; i_sensor?: string;
}

function Lightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90" onClick={onClose}>
            <button className="absolute p-2 text-white bg-gray-700 rounded-full top-4 right-4" onClick={onClose}><X size={20} /></button>
            <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            </div>
        </div>
    );
}

function ImageThumbnail({ src, alt }: { src: string; alt?: string }) {
    const [showLightbox, setShowLightbox] = useState(false);
    const full = src.startsWith("http") ? src : `${import.meta.env.VITE_URL || "http://localhost:3001"}${src}`;
    return (
        <>
            <div className="relative cursor-pointer w-14 h-14 group" onClick={() => setShowLightbox(true)}>
                <img src={full} alt={alt} className="object-cover w-full h-full border border-gray-200 rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 rounded-md group-hover:bg-opacity-30">
                    <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100" />
                </div>
            </div>
            {showLightbox && <Lightbox src={full} alt={alt} onClose={() => setShowLightbox(false)} />}
        </>
    );
}

export default function PlcCorrectiveDetail({ equipment, onClose }: Props) {
    const [records, setRecords] = useState<CorrectiveRecord[]>([]);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const { showSuccess } = useToast();

    const [formData, setFormData] = useState({
        tanggal: "", deskripsi: "", awal: "", tindakan: "",
        tambahan: "", akhir: "", berikutnya: "", keterangan: "",
        petugas: "", i_panel: "", i_sensor: "",
    });

    const fetchRecords = useCallback(async () => {
        try {
            const r = await recordPlcService.getCorrectiveByEquipmentId(equipment.id);
            setRecords(r.data);
        } catch (e) { console.error(e); }
    }, [equipment.id]);

    const fetchStaff = useCallback(async () => {
        try {
            const r = await staffService.getAll();
            if (r?.data) {
                const data = Array.isArray(r.data) ? r.data : [];
                setStaffList((data as unknown as StaffResponse[]).map((s) => ({ id: s.id, nama: s.nama || s.petugas || "" })));
            }
        } catch (e) { setStaffList([]); }
    }, []);

    useEffect(() => { void fetchRecords(); void fetchStaff(); }, [fetchRecords, fetchStaff]);

    const formatDate = (dt: string) => (dt ? dt.split("T")[0] : "");
    const toggleExpand = (id: number) => setExpandedId((p) => (p === id ? null : id));

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const valid = Array.from(e.target.files || []).filter((f) =>
            ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024
        );
        setImageFiles((p) => [...p, ...valid]);
        setImagePreviews((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))]);
    }

    function handleRemoveImage(idx: number) {
        setImageFiles((p) => p.filter((_, i) => i !== idx));
        setImagePreviews((p) => { URL.revokeObjectURL(p[idx]); return p.filter((_, i) => i !== idx); });
    }

    function resetForm() {
        setFormData({ tanggal: "", deskripsi: "", awal: "", tindakan: "", tambahan: "", akhir: "", berikutnya: "", keterangan: "", petugas: "", i_panel: "", i_sensor: "" });
        setImageFiles([]); setImagePreviews([]);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.tanggal || !formData.deskripsi) { alert("Tanggal dan Deskripsi harus diisi"); return; }
        try {
            let payload: Parameters<typeof recordPlcService.createCorrective>[0];
            if (imageFiles.length > 0) {
                const fd = new FormData();
                fd.append("id_m_alat", String(equipment.id));
                Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
                imageFiles.forEach((f) => fd.append("i_alat", f));
                payload = fd;
            } else {
                payload = { id_m_alat: equipment.id, ...formData, i_alat: null };
            }
            await recordPlcService.createCorrective(payload);
            await fetchRecords();
            setShowAddRecord(false);
            resetForm();
            showSuccess("Record corrective PLC berhasil ditambahkan");
        } catch { alert("Gagal menyimpan record."); }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Hapus record ini?")) return;
        try {
            await recordPlcService.deleteCorrective(id);
            await fetchRecords();
            showSuccess("Record corrective PLC berhasil dihapus");
        } catch { alert("Gagal menghapus record."); }
    }

    const petugasOptions = staffList.map((s) => ({ value: s.nama, label: s.nama }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-6xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold dark:text-gray-100">Detail Record Corrective PLC — {equipment.nama}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="p-6">
                    {/* Detail alat — sama seperti preventive */}
                    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ["Nama", equipment.nama], ["Lokasi", equipment.lokasi],
                                ["Device", equipment.device], ["Sensor", equipment.sensor],
                                ["Instalasi", equipment.instalasi ? equipment.instalasi.split("T")[0] : "-"],
                                ["Garansi", equipment.garansi ? equipment.garansi.split("T")[0] : "-"],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                    <p className="text-gray-900 dark:text-gray-100">{value || "-"}</p>
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis PLC</label>
                                <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-200">
                                    {equipment.jenis}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${equipment.status === "Garansi" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {equipment.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Gambar</label>
                            <div className="relative w-full h-64">
                                {equipment.i_alat ? (
                                    <ImageDisplay src={equipment.i_alat} alt={`${equipment.nama} Image`} className="w-full h-full border rounded-lg shadow-sm" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                        <ImageIcon size={40} className="mb-2 text-gray-400" />
                                        <span className="text-sm text-gray-500">No Image Available</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold dark:text-gray-200">Record Corrective</h3>
                            {isAdmin && (
                                <button onClick={() => setShowAddRecord(true)}
                                    className="flex items-center px-4 py-2 space-x-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                                    <Plus size={16} /><span>Tambah Record</span>
                                </button>
                            )}
                        </div>

                        {showAddRecord && (
                            <div className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal *</label>
                                            <input type="date" value={formData.tanggal}
                                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi *</label>
                                            <input type="text" value={formData.deskripsi}
                                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                required />
                                        </div>
                                        {/* Petugas — SearchableSelect */}
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Petugas *</label>
                                            <SearchableSelect
                                                options={petugasOptions}
                                                value={formData.petugas}
                                                onChange={(val) => setFormData({ ...formData, petugas: val })}
                                                placeholder="Pilih Petugas"
                                                disabled={staffList.length === 0}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {[
                                            { label: "Kondisi Awal *", key: "awal", required: true },
                                            { label: "Tindakan *", key: "tindakan", required: true },
                                            { label: "Spareparts", key: "tambahan", required: false },
                                            { label: "Kondisi Akhir *", key: "akhir", required: true },
                                            { label: "Rencana Berikutnya", key: "berikutnya", required: false },
                                            { label: "Keterangan", key: "keterangan", required: false },
                                        ].map(({ label, key, required }) => (
                                            <div key={key}>
                                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                                <textarea value={(formData as any)[key]}
                                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                    required={required} />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Info Panel (i_panel)</label>
                                            <input type="text" value={formData.i_panel}
                                                onChange={(e) => setFormData({ ...formData, i_panel: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                placeholder="Info kondisi panel..." />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Info Sensor (i_sensor)</label>
                                            <input type="text" value={formData.i_sensor}
                                                onChange={(e) => setFormData({ ...formData, i_sensor: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                                placeholder="Info kondisi sensor..." />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Gambar Alat</label>
                                            {imagePreviews.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {imagePreviews.map((src, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 group">
                                                            <img src={src} className="object-cover w-full h-full border border-gray-300 rounded-md" />
                                                            <button type="button" onClick={() => handleRemoveImage(idx)}
                                                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <label htmlFor="plc-corrective-image"
                                                className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-gray-600">
                                                <Upload size={20} className="mb-1 text-gray-400" />
                                                <span className="text-sm text-gray-500">{imagePreviews.length > 0 ? "Tambah gambar lagi" : "Upload gambar alat"}</span>
                                                <input id="plc-corrective-image" type="file" accept="image/jpeg,image/png,image/gif,image/webp"
                                                    multiple className="hidden" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button type="submit" className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Simpan</button>
                                        <button type="button" onClick={() => { setShowAddRecord(false); resetForm(); }}
                                            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700">Batal</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="overflow-hidden bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {["Tanggal", "Deskripsi", "Kondisi Awal", "Tindakan", "Gambar", "Actions"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {records.length === 0 && (
                                        <tr><td colSpan={6} className="px-4 py-8 text-sm text-center text-gray-400">Belum ada record corrective PLC.</td></tr>
                                    )}
                                    {records.map((record) => (
                                        <React.Fragment key={record.id}>
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{formatDate(record.tanggal)}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.deskripsi}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.awal}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{record.tindakan}</td>
                                                {/* 1 gambar + badge */}
                                                <td className="px-4 py-4">
                                                    {record.i_alat && record.i_alat.length > 0 ? (
                                                        <div className="relative inline-block cursor-pointer"
                                                            onClick={() => toggleExpand(record.id)}
                                                            title={record.i_alat.length > 1 ? `Lihat semua ${record.i_alat.length} gambar` : "Detail"}>
                                                            <ImageThumbnail src={record.i_alat[0]} alt={`${record.deskripsi} (1)`} />
                                                            {record.i_alat.length > 1 && (
                                                                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full shadow -top-1 -right-1">
                                                                    +{record.i_alat.length - 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md w-14 h-14 dark:bg-gray-700">
                                                            <ImageIcon size={18} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex space-x-1">
                                                        <button onClick={() => toggleExpand(record.id)}
                                                            className={`p-1 text-white rounded ${expandedId === record.id ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                                                            <BookOpen size={12} />
                                                        </button>
                                                        {isAdmin && (
                                                            <button onClick={() => handleDelete(record.id)}
                                                                className="p-1 text-white bg-red-600 rounded hover:bg-red-700">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedId === record.id && (
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <td colSpan={6} className="px-4 py-4">
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            {[
                                                                ["Spareparts", record.tambahan],
                                                                ["Kondisi Akhir", record.akhir],
                                                                ["Rencana Berikutnya", record.berikutnya],
                                                                ["Petugas", record.petugas],
                                                                ["Info Panel", record.i_panel],
                                                                ["Info Sensor", record.i_sensor],
                                                            ].map(([label, value]) => (
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