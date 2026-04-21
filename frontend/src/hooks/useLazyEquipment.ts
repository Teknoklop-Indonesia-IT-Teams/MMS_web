import { useEffect, useContext } from "react";
import { EquipmentContext } from "../contexts/EquipmentContext";
import { Equipment } from "../types";


const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error("useEquipment must be used within an EquipmentProvider");
  }
  return context;
};


export const useLazyEquipment = (shouldLoad: boolean = true) => {
  const { equipment, loading, isDataLoaded, fetchEquipment, clearData } =
    useEquipment();

  useEffect(() => {
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

export const useNoEquipmentData = () => {
  const { clearData } = useEquipment();

  useEffect(() => {
    
  }, [clearData]);

  return { clearData };
};


export const useDashboardData = () => {
  const { equipment, loading, isDataLoaded, fetchEquipment } = useEquipment();

  useEffect(() => {
    if (!isDataLoaded && !loading) {
      fetchEquipment();
    }
  }, [isDataLoaded, loading, fetchEquipment]);

  const dashboardStats = {
    totalEquipment: equipment.length,
    maintenanceActive: equipment.filter(
      (eq: Equipment) => eq.isMaintenanceActive,
    ).length,
    alertCounts: {
      red: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "red",
      ).length,
      yellow: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "yellow",
      ).length,
      green: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "green",
      ).length,
      blue: equipment.filter(
        (eq: Equipment) => eq.maintenanceAlertLevel === "blue",
      ).length,
    },
  };

  return {
    loading,
    isDataLoaded,
    stats: dashboardStats,
    equipment: equipment,
    refresh: () => fetchEquipment(true),
  };
};
