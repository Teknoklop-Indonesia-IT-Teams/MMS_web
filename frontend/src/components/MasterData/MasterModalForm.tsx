import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { perusahaanService } from "../../services/api";
import SearchableSelect from "../Common/SearchableSelect";

export type TableType = "telemetry" | "client";

export const TABLE_CONFIG = {
    telemetry: {
        label: "Telemetry",
        placeholder: "Contoh: ARR, AWLR, WQMS...",
    },
    client: {
        label: "Client",
        placeholder: "Contoh: PJT I, JTE...",
    },
} as const;

interface MasterModalFormProps {
    tableType: TableType;
    mode?: "add" | "edit";
    initialValue?: string;
    initialPerusahaanId?: number | null;
    onSave: (value: string, id_perusahaan: number | null) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
}

const MasterModalForm: React.FC<MasterModalFormProps> = ({
    tableType,
    mode = "add",
    initialValue = "",
    initialPerusahaanId = null,
    onSave,
    onCancel,
    saving,
}) => {
    const [value, setValue] = useState(initialValue);
    const [perusahaanId, setPerusahaanId] = useState(
        initialPerusahaanId != null ? String(initialPerusahaanId) : "",
    );
    const [perusahaanOptions, setPerusahaanOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [loadingPerusahaan, setLoadingPerusahaan] = useState(false);
    const config = TABLE_CONFIG[tableType];
    const isEdit = mode === "edit";

    useEffect(() => {
        if (tableType !== "client") return;
        const fetchPerusahaan = async () => {
            try {
                setLoadingPerusahaan(true);
                const data = await perusahaanService.getAll();
                setPerusahaanOptions(
                    data.map((d) => ({ value: d.id.toString(), label: d.name })),
                );
            } catch (error) {
                console.error("❌ Error fetching perusahaan:", error);
                setPerusahaanOptions([]);
            } finally {
                setLoadingPerusahaan(false);
            }
        };
        fetchPerusahaan();
    }, [tableType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        const idPerusahaan =
            tableType === "client" && perusahaanId ? Number(perusahaanId) : null;
        onSave(value.trim(), idPerusahaan);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isEdit ? "Edit" : "Tambah"} Jenis {config.label}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nama Jenis <span className="text-red-500">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        />
                    </div>

                    {tableType === "client" && (
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Perusahaan
                            </label>
                            <SearchableSelect
                                options={perusahaanOptions}
                                value={perusahaanId}
                                onChange={setPerusahaanId}
                                placeholder="Pilih perusahaan (opsional)"
                                disabled={saving || loadingPerusahaan}
                            />
                        </div>
                    )}

                    <div className="flex pt-2 space-x-3">
                        <button
                            type="submit"
                            disabled={saving || !value.trim()}
                            className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            {isEdit ? "Simpan Perubahan" : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                            className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterModalForm;
