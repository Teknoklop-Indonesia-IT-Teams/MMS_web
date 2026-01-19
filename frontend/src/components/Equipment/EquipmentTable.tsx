import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  QrCode,
  FileText,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { Equipment } from "../../types";
import { alatService } from "../../services/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  showConfirmationToast,
} from "../../utils/toast";
import EquipmentForm from "./EquipmentForm";
import EquipmentDetail from "./EquipmentDetail";
import EquipmentDescriptionModal from "./EquipmentDescriptionModal";
import QRCodeModal from "../Common/QRCodeModal";
import MaintenanceStatus from "./MaintenanceStatus";
import MaintenanceEmailService from "../../services/maintenanceEmailService";
import { maintenanceReminderService } from "../../services/maintenanceReminderService";
import { useAuth } from "../../hooks/useAuthSimple";
import { PERMISSIONS } from "../../constants/roles";
import ImageDisplay, { SimpleImageDisplay } from "../Common/ImageDisplay";

const EquipmentTable: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [showDetail, setShowDetail] = useState<Equipment | null>(null);
  const [showDescription, setShowDescription] = useState<Equipment | null>(
    null,
  );
  const [showQR, setShowQR] = useState<Equipment | null>(null);
  const [emailCheckDone, setEmailCheckDone] = useState(false); // Track apakah email check sudah dilakukan

  // Get user permissions
  const { hasAnyRole } = useAuth();
  const canEditEquipment = hasAnyRole([...PERMISSIONS.DASHBOARD_FULL_ACCESS]);
  const canDeleteEquipment = hasAnyRole([...PERMISSIONS.DASHBOARD_FULL_ACCESS]);

  // Initialize Maintenance Email service
  // const initializeEmailService = useCallback(() => {
  //   MaintenanceEmailService.init();
  // }, []);

  // useEffect(() => {
  //   initializeEmailService();
  // }, [initializeEmailService]);

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await alatService.getAll();
      if (response.data) {
        setEquipment(response.data);
        await maintenanceReminderService.processEquipmentStatusChanges(
          response.data,
        );
      } else {
        showErrorToast("Tidak ada data alat", "Response kosong dari server");
        console.error("No data in response");
      }
    } catch (error: unknown) {
      showErrorToast(
        "Gagal memuat data alat",
        "Terjadi kesalahan saat mengambil data",
      );
      console.error("Error fetching equipment:", error);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();

    // Cleanup session pada unmount untuk mencegah spam lintas halaman
    // return () => {
    //   MaintenanceEmailService.clearSessionProcessed();
    // };
  }, [fetchEquipment]);

  // TERPISAH: Email checking hanya dilakukan SEKALI setelah equipment di-load
  // useEffect(() => {
  //   if (equipment.length > 0 && !emailCheckDone) {
  //     const checkEmailsOnce = async () => {
  //       await MaintenanceEmailService.processMaintenanceNotifications(
  //         equipment,
  //       );
  //       setEmailCheckDone(true);
  //     };

  //     // Delay untuk memastikan tidak bentrok dengan proses lain
  //     const emailTimeout = setTimeout(checkEmailsOnce, 1000);

  //     return () => clearTimeout(emailTimeout);
  //   }
  // }, [equipment, emailCheckDone]); // Depends on equipment dan emailCheckDone

  const handleDeleteEquipment = useCallback(
    async (id: number) => {
      const equipmentItem = equipment.find((e: Equipment) => e.id === id);
      const equipmentName = equipmentItem ? equipmentItem.nama : `ID ${id}`;

      showConfirmationToast(
        `Hapus alat ${equipmentName}?`,
        async () => {
          const loadingToastId = showLoadingToast("Menghapus alat...");
          try {
            await alatService.delete(id.toString());
            await fetchEquipment();
            showSuccessToast(
              "Alat berhasil dihapus!",
              `${equipmentName} telah dihapus dari sistem`,
            );
          } catch (error) {
            console.error("Error deleting equipment:", error);
            showErrorToast(
              "Gagal menghapus alat",
              "Terjadi kesalahan saat menghapus data alat",
            );
          } finally {
            toast.dismiss(loadingToastId);
          }
        },
        () => {
          // User cancelled - no action needed
        },
        "Tindakan ini tidak dapat dibatalkan",
      );
    },
    [equipment, fetchEquipment],
  );

  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        size: 70,
      },
      {
        header: "Nama",
        accessorKey: "nama",
        size: 250,
      },
      {
        header: "Lokasi",
        accessorKey: "lokasi",
        size: 150,
      },
      {
        header: "Jenis",
        accessorKey: "jenis",
        size: 120,
        cell: ({ getValue }) => (
          <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: "Remot",
        accessorKey: "remot",
        size: 80,
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-1 text-sm font-medium rounded ${
              getValue<boolean>()
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {getValue<boolean>() ? "On" : "Off"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        size: 100,
        cell: ({ getValue }) => {
          const originalStatus = getValue<string>() || "";
          const status = originalStatus.toLowerCase().trim();

          // Use a map untuk memastikan semua kemungkinan status tercakup
          const statusColorMap: { [key: string]: string } = {
            garansi: "bg-green-100 text-green-800 border border-green-200",
            operasional: "bg-blue-100 text-blue-800 border border-blue-200",
            normal: "bg-blue-100 text-blue-800 border border-blue-200",
            aktif: "bg-blue-100 text-blue-800 border border-blue-200",
            maintenance:
              "bg-yellow-100 text-yellow-800 border border-yellow-200",
            perbaikan: "bg-yellow-100 text-yellow-800 border border-yellow-200",
            pemeliharaan:
              "bg-yellow-100 text-yellow-800 border border-yellow-200",
            rusak: "bg-red-100 text-red-800 border border-red-200",
            error: "bg-red-100 text-red-800 border border-red-200",
            bermasalah: "bg-red-100 text-red-800 border border-red-200",
            habis: "bg-gray-100 text-gray-800 border border-gray-200",
            "non-aktif": "bg-gray-100 text-gray-800 border border-gray-200",
            "tidak aktif": "bg-gray-100 text-gray-800 border border-gray-200",
            off: "bg-gray-100 text-gray-800 border border-gray-200",
          };

          const colorClasses =
            statusColorMap[status] ||
            "bg-orange-100 text-orange-800 border border-orange-200";

          return (
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
              title={`Status: ${originalStatus}`}
            >
              {originalStatus}
            </span>
          );
        },
      },
      {
        header: "Device",
        accessorKey: "device",
        size: 120,
      },
      {
        header: "PIC",
        accessorKey: "pic",
        size: 130,
      },
      // Di kolom gambar, perbaiki menjadi:
      {
        header: "Gambar",
        accessorKey: "i_alat",
        size: 100,
        cell: ({ row }) => {
          const equipment = row.original;
          const imageFilename = equipment.i_alat;
          // Gunakan SimpleImageDisplay untuk table (lebih ringan)
          return (
            <div className="w-12 h-12">
              <SimpleImageDisplay
                src={imageFilename || ""}
                alt={`Equipment ${equipment.nama}`}
                className="w-full h-full rounded-md border"
              />
            </div>
          );
        },
      },
      {
        header: "Maintenance",
        accessorKey: "maintenanceStatus",
        size: 140,
        cell: ({ row }) => <MaintenanceStatus equipment={row.original} />,
      },
      {
        header: "Actions",
        id: "actions",
        size: 340,
        cell: ({ row }) => (
          <div className="flex space-x-1">
            <button
              onClick={() => handleViewDetail(row.original)}
              className="p-2 text-white transition-colors bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
              title="Lihat Detail Info Alat"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setShowDetail(row.original)}
              className="p-2 text-white transition-colors bg-purple-600 rounded-md shadow-sm hover:bg-purple-700"
              title="Lihat Record Maintenance"
            >
              <FileText size={16} />
            </button>
            {canEditEquipment && (
              <button
                onClick={() => handleEditEquipment(row.original)}
                className="p-2 text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700"
                title="Edit Alat"
              >
                <Pencil size={16} />
              </button>
            )}
            {canDeleteEquipment && (
              <button
                onClick={() => handleDeleteEquipment(row.original.id)}
                className="p-2 text-white transition-colors bg-red-600 rounded-md shadow-sm hover:bg-red-700"
                title="Hapus Alat"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setShowQR(row.original)}
              className="p-2 text-white transition-colors bg-gray-600 rounded-md shadow-sm hover:bg-gray-700"
              title="QR Code"
            >
              <QrCode size={16} />
            </button>
          </div>
        ),
      },
    ],
    [handleDeleteEquipment, canEditEquipment, canDeleteEquipment],
  );

  const filteredData = useMemo(() => {
    const temp = equipment.filter((item) => {
      const matchesType = !typeFilter || item.jenis === typeFilter;
      return matchesType;
    });
    console.log("Filtered data count:", temp);
    return temp;
  }, [equipment, typeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setIsFormOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsFormOpen(true);
  };

  const handleViewDetail = (equipment: Equipment) => {
    setShowDescription(equipment);
  };

  const handleSaveEquipment = async (
    equipmentData: FormData | Omit<Equipment, "id">,
  ) => {
    const isEdit = !!selectedEquipment;
    const action = isEdit ? "memperbarui" : "menambahkan";
    const loadingToastId = showLoadingToast(`Sedang ${action} alat...`);
    try {
      if (selectedEquipment) {
        await alatService.update(
          selectedEquipment.id.toString(),
          equipmentData,
        );
        showSuccessToast(
          "Alat berhasil diperbarui!",
          `Data alat telah diperbarui`,
        );
      } else {
        await alatService.create(equipmentData);
        showSuccessToast(
          "Alat berhasil ditambahkan!",
          `Alat baru telah ditambahkan ke sistem`,
        );
      }
      await fetchEquipment();
      setIsFormOpen(false);
      setSelectedEquipment(null);
    } catch (error) {
      console.error("Error saving equipment:", error);
      showErrorToast(
        `Gagal ${action} alat`,
        "Terjadi kesalahan saat menyimpan data alat",
      );
    } finally {
      toast.dismiss(loadingToastId);
    }
  };

  const uniqueTypes = Array.from(new Set(equipment.map((item) => item.jenis)));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-gray-800 dark:text-gray-200">
            <span className="mr-2">🔧</span>
            Data Alat
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {canEditEquipment && (
            <button
              onClick={handleAddEquipment}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-green-600 rounded-lg dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800"
            >
              <Plus size={20} />
              <span>Tambah Alat</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden transition-colors duration-200 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              List Alat
            </h3>

            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search
                  className="absolute text-gray-400 transform -translate-y-1/2 dark:text-gray-500 left-3 top-1/2"
                  size={20}
                />
                <input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Cari alat..."
                  className="py-2 pl-10 pr-4 text-gray-900 transition-colors duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-gray-900 transition-colors duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Semua Jenis</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-base">
            <thead className="sticky top-0 transition-colors duration-200 shadow-sm bg-gray-50 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-sm font-medium tracking-wider text-left text-gray-500 uppercase transition-colors duration-200 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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
            <tbody className="transition-colors duration-200 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">
                  {table.getFilteredRowModel().rows.length} total
                </span>
                <span className="sm:hidden">
                  {table.getFilteredRowModel().rows.length}
                </span>
              </div>
              <select
                className="text-xs text-gray-500 bg-transparent border-none cursor-pointer dark:text-gray-400 focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                title="Items per page"
              >
                {[10, 20, 30, 50].map((pageSize) => (
                  <option
                    key={pageSize}
                    value={pageSize}
                    className="bg-white dark:bg-gray-800"
                  >
                    {pageSize}/page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 transition-colors rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Previous page"
              >
                ‹
              </button>

              <div className="flex items-center px-3 py-1 text-sm text-gray-700 dark:text-gray-300 min-w-[60px] justify-center">
                <span className="font-medium">
                  {table.getState().pagination.pageIndex + 1}
                </span>
                <span className="mx-1 text-gray-400">/</span>
                <span>{table.getPageCount()}</span>
              </div>

              <button
                className="flex items-center justify-center w-8 h-8 text-lg text-gray-500 transition-colors rounded hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <EquipmentForm
          equipment={selectedEquipment}
          onSave={handleSaveEquipment}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {showDetail && (
        <EquipmentDetail
          equipment={showDetail}
          onClose={() => setShowDetail(null)}
        />
      )}

      {showDescription && (
        <EquipmentDescriptionModal
          equipment={showDescription}
          onClose={() => setShowDescription(null)}
        />
      )}

      {showQR && (
        <QRCodeModal equipment={showQR} onClose={() => setShowQR(null)} />
      )}
    </div>
  );
};

export default EquipmentTable;
