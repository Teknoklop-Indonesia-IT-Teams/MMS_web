import React, {
    useState, useMemo, useEffect, useCallback, useRef,
} from "react";
import {
    useReactTable, getCoreRowModel, getFilteredRowModel,
    getSortedRowModel, getPaginationRowModel, ColumnDef, flexRender,
} from "@tanstack/react-table";
import {
    Plus, Search, Trash2, Eye, FileText, Pencil,
    Wrench, ChevronDown, History, Cpu,
} from "lucide-react";
import toast from "react-hot-toast";
import { Equipment } from "../../../types";
import { alatPlcService } from "../../../services/api";
import {
    showSuccessToast, showErrorToast,
    showLoadingToast, showConfirmationToast,
} from "../../../utils/toast";
import PlcForm from "../../Record/Plc/RecordFormPlc";
import PlcPreventiveDetail from "./EquipmentPreventiveDetailPlc";
import PlcCorrectiveDetail from "./EquipmentCorrectiveDetailPlc";
import PlcDescriptionModal from "./EquipmentDescriptionModalPlc";
import MaintenanceStatus from "../../Equipment/MaintenanceStatus";
import { useAuth } from "../../../hooks/useAuthSimple";
import { PERMISSIONS } from "../../../constants/roles";
import { SimpleImageDisplay } from "../../Common/ImageDisplay";

const PlcTable: React.FC = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [showDetail, setShowDetail] = useState<Equipment | null>(null);
    const [showCorrectiveDetail, setShowCorrectiveDetail] = useState<Equipment | null>(null);
    const [showDescription, setShowDescription] = useState<Equipment | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownEquipment, setDropdownEquipment] = useState<{
        equipment: Equipment;
        position: { top: number; left: number };
    } | null>(null);

    const { hasAnyRole } = useAuth();
    const canEdit = hasAnyRole([...PERMISSIONS.DASHBOARD_FULL_ACCESS]);
    const canDelete = hasAnyRole([...PERMISSIONS.DASHBOARD_FULL_ACCESS]);

    const fetchEquipment = useCallback(async () => {
        try {
            const response = await alatPlcService.getAll();
            if (response.data) {
                setEquipment(response.data);
            } else {
                showErrorToast("Tidak ada data alat PLC", "Response kosong dari server");
            }
        } catch (error) {
            showErrorToast("Gagal memuat data alat PLC", "Terjadi kesalahan saat mengambil data");
            console.error("Error fetching PLC equipment:", error);
        }
    }, []);

    useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (dropdownEquipment && !target.closest(".dropdown-menu-container")) {
                setDropdownEquipment(null);
            }
        };
        if (dropdownEquipment !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownEquipment]);

    const handleDelete = useCallback(async (id: number) => {
        const item = equipment.find((e) => e.id === id);
        const name = item ? item.nama : `ID ${id}`;
        showConfirmationToast(`Hapus alat PLC ${name}?`, async () => {
            const loadingToastId = showLoadingToast("Menghapus alat PLC...");
            try {
                await alatPlcService.delete(id.toString());
                await fetchEquipment();
                showSuccessToast("Alat PLC berhasil dihapus!", `${name} telah dihapus`);
            } catch (error) {
                showErrorToast("Gagal menghapus alat PLC", "Terjadi kesalahan");
            } finally {
                toast.dismiss(loadingToastId);
            }
        }, () => { }, "Tindakan ini tidak dapat dibatalkan");
    }, [equipment, fetchEquipment]);

    const columns = useMemo<ColumnDef<Equipment>[]>(() => [
        {
            header: "No", id: "rowNumber", size: 70,
            cell: ({ row, table }) => {
                const { pageIndex, pageSize } = table.getState().pagination;
                return pageIndex * pageSize + row.index + 1;
            },
        },
        { header: "Nama", accessorKey: "nama", size: 250 },
        { header: "Lokasi", accessorKey: "lokasi", size: 150 },
        {
            header: "Jenis PLC", accessorKey: "jenis", size: 140,
            cell: ({ getValue }) => (
                <span className="px-2 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded dark:bg-purple-900 dark:text-purple-200">
                    {getValue<string>()}
                </span>
            ),
        },
        {
            header: "Remote", accessorKey: "remot", size: 80,
            cell: ({ getValue }) => (
                <span className={`px-2 py-1 text-sm font-medium rounded ${getValue<boolean>() ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                    {getValue<boolean>() ? "On" : "Off"}
                </span>
            ),
        },
        {
            header: "Status", accessorKey: "status", size: 100,
            cell: ({ getValue }) => {
                const original = getValue<string>() || "";
                const s = original.toLowerCase().trim();
                const map: Record<string, string> = {
                    garansi: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
                    habis: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
                    maintenance: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
                    rusak: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
                };
                return (
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${map[s] || "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700"}`}>
                        {original}
                    </span>
                );
            },
        },
        { header: "Device", accessorKey: "device", size: 120 },
        { header: "PIC", accessorKey: "pic", size: 130 },
        {
            header: "Gambar", accessorKey: "i_alat", size: 100,
            cell: ({ row }) => (
                <div className="w-12 h-12">
                    <SimpleImageDisplay
                        src={row.original.i_alat || ""}
                        alt={`PLC ${row.original.nama}`}
                        className="w-full h-full border rounded-md"
                    />
                </div>
            ),
        },
        {
            header: "Maintenance", accessorKey: "maintenanceStatus", size: 140,
            cell: ({ row }) => <MaintenanceStatus equipment={row.original} />,
        },
        {
            header: "Actions", id: "actions", size: 280,
            cell: ({ row }) => {
                const buttonRef = useRef<HTMLButtonElement>(null);

                const handleDropdownClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (buttonRef.current) {
                        const rect = buttonRef.current.getBoundingClientRect();
                        setDropdownEquipment({
                            equipment: row.original,
                            position: { top: rect.bottom + 4, left: rect.left },
                        });
                    }
                };

                return (
                    <div className="flex space-x-1">
                        <button onClick={() => setShowDescription(row.original)}
                            className="p-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                            title="Lihat Detail Info Alat">
                            <Eye size={16} />
                        </button>
                        <button ref={buttonRef} onClick={handleDropdownClick}
                            className="p-2 text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700"
                            title="Lihat Record Maintenance">
                            <FileText size={16} />
                        </button>
                        {canEdit && (
                            <button onClick={() => { setSelectedEquipment(row.original); setIsFormOpen(true); }}
                                className="p-2 text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
                                title="Edit Alat PLC">
                                <Pencil size={16} />
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => handleDelete(row.original.id)}
                                className="p-2 text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
                                title="Hapus Alat PLC">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ], [handleDelete, canEdit, canDelete]);

    const filteredData = useMemo(() =>
        equipment.filter((item) => !typeFilter || item.jenis === typeFilter),
        [equipment, typeFilter]);

    const table = useReactTable({
        data: filteredData, columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { globalFilter },
        globalFilterFn: "includesString",
        onGlobalFilterChange: setGlobalFilter,
        initialState: { pagination: { pageSize: 10 } },
    });

    const handleSave = async (data: FormData | Omit<Equipment, "id">) => {
        const isEdit = !!selectedEquipment;
        const loadingToastId = showLoadingToast(isEdit ? "Memperbarui alat PLC..." : "Menambahkan alat PLC...");
        try {
            if (selectedEquipment) {
                await alatPlcService.update(selectedEquipment.id.toString(), data);
                showSuccessToast("Alat PLC berhasil diperbarui!");
            } else {
                await alatPlcService.create(data);
                showSuccessToast("Alat PLC berhasil ditambahkan!");
            }
            await fetchEquipment();
            setIsFormOpen(false);
            setSelectedEquipment(null);
        } catch (error) {
            showErrorToast(isEdit ? "Gagal memperbarui alat PLC" : "Gagal menambahkan alat PLC", "Terjadi kesalahan");
        } finally {
            toast.dismiss(loadingToastId);
        }
    };

    const uniqueTypes = Array.from(new Set(equipment.map((item) => item.jenis)));

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="flex items-center text-2xl font-bold text-gray-800 dark:text-gray-200">
                    <Cpu className="mr-2" />
                    Data Alat PLC
                </h1>
                {canEdit && (
                    <button onClick={() => { setSelectedEquipment(null); setIsFormOpen(true); }}
                        className="flex items-center px-4 py-2 space-x-2 text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                        <Plus size={20} />
                        <span>Tambah Alat PLC</span>
                    </button>
                )}
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">List Alat PLC</h3>
                        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
                                <input value={globalFilter ?? ""}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Cari alat PLC..."
                                    className="w-full px-3 py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            {/* Filter jenis */}
                            <div className="relative">
                                <button type="button"
                                    onClick={() => setShowDropdown((prev) => !prev)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <span>{typeFilter === "" ? "Semua Jenis" : typeFilter}</span>
                                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                                </button>
                                {showDropdown && (
                                    <div className="absolute left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full dark:bg-gray-700 dark:border-gray-600">
                                        <button type="button"
                                            onClick={() => { setTypeFilter(""); setShowDropdown(false); }}
                                            className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100 first:rounded-t-lg">
                                            Semua Jenis
                                        </button>
                                        {uniqueTypes.map((type) => (
                                            <button key={type} type="button"
                                                onClick={() => { setTypeFilter(type); setShowDropdown(false); }}
                                                className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-100">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto max-h-[70vh]">
                    <table className="w-full text-base">
                        <thead className="sticky top-0 shadow-sm bg-gray-50 dark:bg-gray-700">
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id}>
                                    {hg.headers.map((h) => (
                                        <th key={h.id}
                                            className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            onClick={h.column.getToggleSortingHandler()}>
                                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                                onChange={(e) => table.setPageSize(Number(e.target.value))}>
                                {[10, 20, 30, 50].map((s) => (
                                    <option key={s} value={s} className="bg-white dark:bg-gray-800">{s}/page</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
                            <div className="flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 min-w-[60px] justify-center">
                                <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
                                <span className="mx-1 text-gray-400 dark:text-gray-500">/</span>
                                <span>{table.getPageCount()}</span>
                            </div>
                            <button
                                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dropdown record menu */}
            {dropdownEquipment && (
                <div
                    className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg w-52 dark:bg-gray-700 dark:border-gray-600 dropdown-menu-container"
                    style={{ top: `${dropdownEquipment.position.top}px`, left: `${dropdownEquipment.position.left}px` }}>
                    <button
                        onClick={() => { setShowDetail(dropdownEquipment.equipment); setDropdownEquipment(null); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 first:rounded-t-md">
                        <History size={14} className="mr-2" />
                        Preventive Maintenance
                    </button>
                    <button
                        onClick={() => { setShowCorrectiveDetail(dropdownEquipment.equipment); setDropdownEquipment(null); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 last:rounded-b-md">
                        <Wrench size={14} className="mr-2" />
                        Corrective Maintenance
                    </button>
                </div>
            )}

            {isFormOpen && (
                <PlcForm equipment={selectedEquipment} onSave={handleSave}
                    onCancel={() => { setIsFormOpen(false); setSelectedEquipment(null); }} />
            )}
            {showDetail && <PlcPreventiveDetail equipment={showDetail} onClose={() => setShowDetail(null)} />}
            {showCorrectiveDetail && <PlcCorrectiveDetail equipment={showCorrectiveDetail} onClose={() => setShowCorrectiveDetail(null)} />}
            {showDescription && <PlcDescriptionModal equipment={showDescription} onClose={() => setShowDescription(null)} />}
        </div>
    );
};

export default PlcTable;