import React, { useState } from "react";
import { Equipment } from "../../types";
import { alatService } from "../../services/api";
import { CheckCircle, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { useEquipment } from "../../hooks/useEquipment";

interface MaintenanceActionsProps {
  equipment: Equipment;
  onUpdate?: () => void;
}

export const MaintenanceActions: React.FC<MaintenanceActionsProps> = ({
  equipment,
  onUpdate,
}) => {
  const { refreshEquipment } = useEquipment();
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceDate: equipment.maintenanceDate
      ? equipment.maintenanceDate.split("T")[0]
      : "",
    maintenanceInterval: equipment.maintenanceInterval || 90,
    isMaintenanceActive: Boolean(equipment.isMaintenanceActive) || false,
  });

  const handleCompleteMaintenance = async () => {
    if (!equipment.isMaintenanceActive) {
      toast.error("Maintenance tidak aktif untuk peralatan ini");
      return;
    }

    if (isLoading) return; // Prevent double-click

    try {
      setIsLoading(true);

      const response = await alatService.completeMaintenance(
        equipment.id.toString()
      );

      toast.success(
        response?.data?.message || "Maintenance berhasil diselesaikan!"
      );

      // Refresh equipment context to sync all components
      await refreshEquipment();

      // Call onUpdate if provided
      onUpdate?.();
    } catch (error: any) {
      console.error("❌ Error completing maintenance:", error);

      // Handle different error cases
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 401) {
        toast.error("Sesi berakhir, silakan login ulang");
      } else if (status === 404) {
        toast.error("Peralatan tidak ditemukan");
      } else if (status === 409) {
        // Conflict - operation already in progress (from optimisticLockManager)
        toast.error("Operasi sedang berjalan, mohon tunggu");
      } else {
        toast.error(message || "Gagal menyelesaikan maintenance");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (isLoading) return; // Prevent double-click

    try {
      setIsLoading(true);

      const response = await alatService.updateMaintenanceSettings(
        equipment.id.toString(),
        settings
      );

      toast.success(
        response?.data?.message || "Pengaturan maintenance berhasil diupdate!"
      );
      setShowSettings(false);

      await refreshEquipment();
      onUpdate?.();
    } catch (error: any) {
      console.error("❌ Error updating maintenance settings:", error);

      // Handle different error cases
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 401) {
        toast.error("Sesi berakhir, silakan login ulang");
      } else if (status === 404) {
        toast.error("Peralatan tidak ditemukan");
      } else if (status === 409) {
        toast.error("Operasi sedang berjalan, mohon tunggu");
      } else {
        toast.error(message || "Gagal mengupdate pengaturan maintenance");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showSettings) {
    return (
      <div className="p-4 bg-white border rounded-lg dark:bg-gray-800 dark:text-white">
        <h4 className="mb-4 text-lg font-semibold">Pengaturan Maintenance</h4>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Tanggal Terakhir Maintenance
            </label>
            <input
              type="date"
              value={settings.maintenanceDate}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maintenanceDate: e.target.value,
                }))
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Interval Maintenance (hari)
            </label>
            <input
              type="number"
              value={settings.maintenanceInterval}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maintenanceInterval: parseInt(e.target.value) || 90,
                }))
              }
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              min="1"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceActive"
              checked={settings.isMaintenanceActive}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  isMaintenanceActive: e.target.checked,
                }))
              }
              className="mr-2"
              disabled={isLoading}
            />
            <label htmlFor="maintenanceActive" className="text-sm font-medium">
              Maintenance Aktif
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 text-gray-600 transition-colors border rounded-md hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleUpdateSettings}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Boolean(equipment.isMaintenanceActive) && (
        <button
          onClick={handleCompleteMaintenance}
          disabled={isLoading}
          className="flex items-center px-3 py-2 space-x-1 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle size={16} />
          <span>{isLoading ? "Memproses..." : "Selesai Maintenance"}</span>
        </button>
      )}

      <button
        onClick={() => setShowSettings(true)}
        disabled={isLoading}
        className="flex items-center px-3 py-2 space-x-1 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Settings size={16} />
        <span>Pengaturan</span>
      </button>
    </div>
  );
};

export default MaintenanceActions;