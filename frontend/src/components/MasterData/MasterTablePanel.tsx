import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
} from "@tanstack/react-table";
import { Plus, Search, Trash2, Database, Users, Loader2, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { MasterItem } from "../../types";
import { telemetryService, clientService } from "../../services/api";
import {
    showSuccessToast,
    showErrorToast,
    showLoadingToast,
    showConfirmationToast,
} from "../../utils/toast";
import MasterModalForm, { TableType, TABLE_CONFIG } from "./MasterModalForm";
import ClientQRCodeModal from "./ClientQRCodeModal";

const ICONS = {
    telemetry: Database,
    client: Users,
} as const;

interface MasterTablePanelProps {
    tableType: TableType;
}

const MasterTablePanel: React.FC<MasterTablePanelProps> = ({ tableType }) => {
    const config = TABLE_CONFIG[tableType];
    const Icon = ICONS[tableType];
    const displayLabel = tableType === "client" ? `Nama ${config.label}` : `Jenis ${config.label}`;

    const [items, setItems] = useState<MasterItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [qrClient, setQrClient] = useState<string | null>(null);

    const service = tableType === "telemetry" ? telemetryService : clientService;

    // ── Fetch ──
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await service.getAll();
            setItems(data);
        } catch (err) {
            showErrorToast(
                "Gagal memuat data",
                `Tidak dapat mengambil data ${displayLabel}`,
            );
            console.error(`❌ fetch ${tableType}:`, err);
        } finally {
            setLoading(false);
        }
    }, [service, config.label, tableType]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ── Add ──
    const handleAdd = async (value: string) => {
        const loadingToastId = showLoadingToast(
            `Menambahkan ${displayLabel}...`,
        );
        try {
            setSaving(true);
            await service.create(value);
            showSuccessToast(
                `${displayLabel} ditambahkan!`,
                `"${value}" berhasil ditambahkan`,
            );
            setIsFormOpen(false);
            await fetchItems();
        } catch (err: any) {
            showErrorToast("Gagal menambahkan", err.message || "Terjadi kesalahan");
        } finally {
            setSaving(false);
            toast.dismiss(loadingToastId);
        }
    };

    // ── Delete ──
    const handleDelete = useCallback(
        (id: number, name: string) => {
            showConfirmationToast(
                `Hapus jenis "${name}"?`,
                async () => {
                    const loadingToastId = showLoadingToast("Menghapus...");
                    try {
                        await service.delete(id.toString());
                        showSuccessToast("Berhasil dihapus!", `"${name}" telah dihapus`);
                        await fetchItems();
                    } catch (err: any) {
                        showErrorToast(
                            "Gagal menghapus",
                            err.message || "Terjadi kesalahan",
                        );
                    } finally {
                        toast.dismiss(loadingToastId);
                    }
                },
                () => { },
                "Tindakan ini tidak dapat dibatalkan",
            );
        },
        [service, fetchItems],
    );

    // ── Columns ──
    const columns = useMemo<ColumnDef<MasterItem>[]>(
        () => [
            {
                header: "No",
                id: "rowNumber",
                size: 60,
                cell: ({ row, table }) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;
                    return pageIndex * pageSize + row.index + 1;
                },
            },
            {
                header: displayLabel,
                accessorKey: "name",
                cell: ({ getValue }) => (
                    <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-200">
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                header: "Aksi",
                id: "actions",
                size: tableType === "client" ? 120 : 80,
                cell: ({ row }) => (
                    <div className="flex items-center space-x-1">
                        {tableType === "client" && (
                            <button
                                onClick={() => setQrClient(row.original.name)}
                                className="p-2 text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                                title="QR Code Dashboard"
                            >
                                <QrCode size={14} />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(row.original.id, row.original.name)}
                            className="p-2 text-white transition-colors bg-red-600 rounded-md shadow-sm hover:bg-red-700"
                            title="Hapus"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ),
            },
        ],
        [config.label, handleDelete, tableType],
    );

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { globalFilter },
        globalFilterFn: "includesString",
        onGlobalFilterChange: setGlobalFilter,
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <>
            <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                            {displayLabel}
                            <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {table.getFilteredRowModel().rows.length} data
                            </span>
                        </h3>

                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                            <div className="relative">
                                <Search
                                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500"
                                    size={16}
                                />
                                <input
                                    value={globalFilter ?? ""}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder={`Cari ${displayLabel}...`}
                                    className="w-full py-2 pr-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg pl-9 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="flex items-center justify-center px-4 py-2 space-x-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 whitespace-nowrap"
                            >
                                <Plus size={16} />
                                <span>Tambah</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Memuat data...</span>
                        </div>
                    ) : (
                        <table className="w-full text-base">
                            <thead className="sticky top-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="py-12 text-sm text-center text-gray-400"
                                        >
                                            Belum ada data {displayLabel}
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {table.getFilteredRowModel().rows.length} total
                            </span>
                            <select
                                className="text-xs text-gray-500 bg-transparent border-none cursor-pointer dark:text-gray-400 focus:outline-none"
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                            >
                                {[10, 20, 50].map((size) => (
                                    <option
                                        key={size}
                                        value={size}
                                        className="bg-white dark:bg-gray-800"
                                    >
                                        {size}/page
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 transition-colors rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                ‹
                            </button>
                            <div className="flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 min-w-[60px] justify-center">
                                <span className="font-medium">
                                    {table.getState().pagination.pageIndex + 1}
                                </span>
                                <span className="mx-1 text-gray-400">/</span>
                                <span>{table.getPageCount() || 1}</span>
                            </div>
                            <button
                                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 transition-colors rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <MasterModalForm
                    tableType={tableType}
                    onSave={handleAdd}
                    onCancel={() => setIsFormOpen(false)}
                    saving={saving}
                />
            )}

            {qrClient && (
                <ClientQRCodeModal
                    clientName={qrClient}
                    onClose={() => setQrClient(null)}
                />
            )}
        </>
    );
};

export default MasterTablePanel;