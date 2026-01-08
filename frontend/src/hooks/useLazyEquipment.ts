import { useEffect, useContext } from "react";
import { EquipmentContext } from "../contexts/EquipmentContext";
import { Equipment } from "../types";

/**
 * Hook untuk menggunakan EquipmentContext dengan error handling
 */
const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error("useEquipment must be used within an EquipmentProvider");
  }
  return context;
};

/**
 * Hook untuk lazy loading equipment data hanya ketika halaman yang membutuhkan data tersebut dibuka
 * Menghindari race condition dengan hanya fetch data ketika diperlukan
 */
export const useLazyEquipment = (shouldLoad: boolean = true) => {
  const { equipment, loading, isDataLoaded, fetchEquipment, clearData } =
    useEquipment();

  useEffect(() => {
    // Hanya fetch jika:
    // 1. shouldLoad = true (halaman membutuhkan data)
    // 2. Data belum pernah dimuat
    // 3. Tidak sedang loading
    if (shouldLoad && !isDataLoaded && !loading) {
      fetchEquipment();
    }
  }, [shouldLoad, isDataLoaded, loading, fetchEquipment]);

  return {
    equipment,
    loading,
    isDataLoaded,
    refresh: () => fetchEquipment(true),
    clear: clearData,
  };
};

/**
 * Hook untuk komponen yang tidak membutuhkan equipment data
 * Menghindari fetching data yang tidak diperlukan
 */
export const useNoEquipmentData = () => {
  const { clearData } = useEquipment();

  useEffect(() => {
    // Optional: Clear data ketika masuk ke halaman yang tidak membutuhkan data
    // Uncomment jika ingin menghemat memory
    // clearData();
  }, [clearData]);

  return { clearData };
};

/**
 * Hook untuk dashboard yang hanya butuh stats
 * Fetch data ringan untuk dashboard saja
 */
export const useDashboardData = () => {
  const { equipment, loading, isDataLoaded, fetchEquipment } = useEquipment();

  useEffect(() => {
    if (!isDataLoaded && !loading) {
      fetchEquipment();
    }
  }, [isDataLoaded, loading, fetchEquipment]);

  // Calculate dashboard stats
  const dashboardStats = {
    totalEquipment: equipment.length,
    maintenanceActive: equipment.filter(
      (eq: Equipment) => eq.isMaintenanceActive
    ).length,
    alertCounts: {
      red: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "red"
      ).length,
      yellow: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "yellow"
      ).length,
      green: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "green"
      ).length,
      blue: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "blue"
      ).length,
    },
  };

  return {
    loading,
    isDataLoaded,
    stats: dashboardStats,
    equipment: equipment.slice(0, 10), // Hanya 10 item untuk preview dashboard
    refresh: () => fetchEquipment(true), // Menyediakan refresh function
  };
};
