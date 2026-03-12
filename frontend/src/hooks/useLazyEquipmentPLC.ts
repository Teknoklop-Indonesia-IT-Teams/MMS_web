import { useEffect, useContext } from "react";
import { EquipmentContext } from "../contexts/EquipmentContext";
import { EquipmentPLC } from "../types";

/**
 * Hook untuk menggunakan EquipmentContextPLC dengan error handling
 */
const useEquipmentPLC = () => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error("useEquipmentPLC must be used within an EquipmentProvider");
  }
  return context;
};

/**
 * Hook untuk lazy loading equipment data hanya ketika halaman yang membutuhkan data tersebut dibuka
 * Menghindari race condition dengan hanya fetch data ketika diperlukan
 */
export const useLazyEquipmentPLC = (shouldLoad: boolean = true) => {
  const { equipment, loading, isDataLoaded, fetchEquipmentPLC, clearData } =
    useEquipmentPLC();

  useEffect(() => {
    // Hanya fetch jika:
    // 1. shouldLoad = true (halaman membutuhkan data)
    // 2. Data belum pernah dimuat
    // 3. Tidak sedang loading
    if (shouldLoad && !isDataLoaded && !loading) {
      fetchEquipmentPLC();
    }
  }, [shouldLoad, isDataLoaded, loading, fetchEquipmentPLC]);

  return {
    equipment,
    loading,
    isDataLoaded,
    refresh: () => fetchEquipmentPLC(true),
    clear: clearData,
  };
};

/**
 * Hook untuk komponen yang tidak membutuhkan equipment data
 * Menghindari fetching data yang tidak diperlukan
 */
export const useNoEquipmentData = () => {
  const { clearData } = useEquipmentPLC();

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
export const useDashboardDataPLC = () => {
  const { equipmentPLC, loading, isDataLoaded, fetchEquipmentPLC } =
    useEquipmentPLC();

  useEffect(() => {
    if (!isDataLoaded && !loading) {
      fetchEquipmentPLC();
    }
  }, [isDataLoaded, loading, fetchEquipmentPLC]);

  // Calculate dashboard stats
  const dashboardStats = {
    totalEquipment: equipmentPLC.length,
    maintenanceActive: equipmentPLC.filter(
      (eq: EquipmentPLC) => eq.isMaintenanceActive,
    ).length,
    alertCounts: {
      red: equipmentPLC.filter(
        (eq: EquipmentPLC) => eq.maintenanceAlertLevel === "red",
      ).length,
      yellow: equipmentPLC.filter(
        (eq: EquipmentPLC) => eq.maintenanceAlertLevel === "yellow",
      ).length,
      green: equipmentPLC.filter(
        (eq: EquipmentPLC) => eq.maintenanceAlertLevel === "green",
      ).length,
      blue: equipmentPLC.filter(
        (eq: EquipmentPLC) => eq.maintenanceAlertLevel === "blue",
      ).length,
    },
  };

  return {
    loading,
    isDataLoaded,
    stats: dashboardStats,
    equipmentPLC: equipmentPLC,
    refresh: () => fetchEquipmentPLC(true), // Menyediakan refresh function
  };
};
