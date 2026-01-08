import React, { useState } from "react";
import { Equipment } from "../../types";
import { alatService } from "../../services/enhancedServices";
import { CheckCircle, Settings, StopCircle } from "lucide-react";
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
    console.log("🔧 Complete Maintenance clicked for equipment:", equipment);

    if (!equipment.isMaintenanceActive) {
      console.warn("❌ Maintenance tidak aktif untuk peralatan ini");
      toast.error("Maintenance tidak aktif untuk peralatan ini");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`🚀 Calling API completeMaintenance for ID: ${equipment.id}`);

      const response = await alatService.completeMaintenance(
        equipment.id.toString()
      );
      console.log("✅ Complete maintenance response:", response);

      toast.success("Maintenance berhasil diselesaikan!");

      // Refresh equipment context to sync all components
      console.log("🔄 Refreshing equipment context...");
      await refreshEquipment();
      console.log("✅ Equipment context refreshed");

      // Call onUpdate if provided
      if (onUpdate) {
        console.log("📞 Calling onUpdate callback...");
        onUpdate();
      }
    } catch (error) {
      console.error("❌ Error completing maintenance:", error);
      toast.error("Gagal menyelesaikan maintenance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMaintenance = async () => {
    // Prevent double-click
    if (isLoading) {
      console.log(
        "Stop maintenance already in progress, ignoring double-click"
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛑 Stopping maintenance for equipment:", equipment.id);

      await alatService.stopMaintenance(equipment.id.toString());
      toast.success("Maintenance dihentikan!");

      // Refresh equipment context to sync all components
      await refreshEquipment();
      onUpdate?.();

      console.log("✅ Stop maintenance completed successfully");
    } catch (error) {
      console.error("❌ Error stopping maintenance:", error);

      // Check if it's a 401 error (token expiry)
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        console.log(
          "🔒 Stop maintenance failed due to authentication - token may have expired"
        );
        toast.error("Sesi berakhir, silakan login ulang");
      } else {
        toast.error("Gagal menghentikan maintenance");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setIsLoading(true);
      await alatService.updateMaintenanceSettings(
        equipment.id.toString(),
        settings
      );
      toast.success("Pengaturan maintenance berhasil diupdate!");
      setShowSettings(false);

      // Refresh equipment context to sync all components
      console.log(
        "🔄 Maintenance settings updated - refreshing all components"
      );
      await refreshEquipment();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating maintenance settings:", error);
      toast.error("Gagal mengupdate pengaturan maintenance");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSettings) {
    return (
      <div className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-lg border">
        <h4 className="text-lg font-semibold mb-4">Pengaturan Maintenance</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
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
            />
            <label htmlFor="maintenanceActive" className="text-sm font-medium">
              Maintenance Aktif
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 dark:text-white dark:hover:text-gray-600"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleUpdateSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle size={16} />
          <span>Selesai Maintenance</span>
        </button>
      )}

      <button
        onClick={() => setShowSettings(true)}
        disabled={isLoading}
        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        <Settings size={16} />
        <span>Pengaturan</span>
      </button>

      {Boolean(equipment.isMaintenanceActive) && (
        <button
          onClick={handleStopMaintenance}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          <StopCircle size={16} />
          <span>Stop Maintenance</span>
        </button>
      )}
    </div>
  );
};

export default MaintenanceActions;
