import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Equipment, EquipmentPLC } from "../types";
import { alatService } from "../services/enhancedServices";
import { extendLogoutProtection } from "../services/apiSimple";
import { AppStateManager } from "../utils/appState";
import { alatPlcService } from "../services/api";

interface EquipmentContextType {
  equipment: Equipment[];
  equipmentPLC: EquipmentPLC[];
  loading: boolean;
  lastUpdated: Date | null;
  isDataLoaded: boolean;
  fetchEquipment: (forceRefresh?: boolean) => Promise<void>;
  fetchEquipmentPLC: (forceRefresh?: boolean) => Promise<void>;
  refreshEquipment: () => Promise<void>;
  clearData: () => void;
}

export const EquipmentContext = createContext<EquipmentContextType | undefined>(
  undefined,
);

interface EquipmentProviderProps {
  children: React.ReactNode;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({
  children,
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentPLC, setEquipmentPLC] = useState<EquipmentPLC[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Use refs to track request state without causing re-renders
  const isRequestingRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const requestCountRef = useRef(0);

  const fetchEquipment = useCallback(
    async (forceRefresh = false) => {
      // CRITICAL: Extend logout protection before API call
      extendLogoutProtection(5000);

      // Enhanced concurrency control using refs
      if (isRequestingRef.current && !forceRefresh) {
        return;
      }

      // Rate limiting - max 1 request per second unless forced
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;
      if (timeSinceLastRequest < 1000 && !forceRefresh) {
        return;
      }

      try {
        requestCountRef.current++;
        isRequestingRef.current = true;
        lastRequestTimeRef.current = now;
        setLoading(true);

        // Mark as critical operation to prevent logout during fetch
        AppStateManager.startCriticalOperation("EquipmentContext fetch");

        const response = await alatService.getAll();

        if (response.data && Array.isArray(response.data)) {
          // Enhanced debug for problem equipment - FOKUS PADA URUTAN DAN DUPLIKASI
          const maintenanceDebugData = response.data
            .filter(
              (eq) =>
                eq.nama === "acafaaf" ||
                eq.nama === "scsC" ||
                eq.nama === "WQMS Sungai Progo Magelang",
            )
            .map((eq, index) => ({
              index: index,
              nama: eq.nama,
              id: eq.id,
              maintenanceAlertLevel: eq.maintenanceAlertLevel,
              maintenanceDaysLeft: eq.maintenanceDaysLeft,
              isMaintenanceActive: eq.isMaintenanceActive,
              maintenanceStatus: eq.maintenanceStatus,
              maintenanceDate: eq.maintenanceDate,
              maintenanceInterval: eq.maintenanceInterval,
            }));

          // Check for duplicate names
          const duplicateNames = maintenanceDebugData.reduce(
            (acc, item) => {
              acc[item.nama] = (acc[item.nama] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          // Show which equipment has duplicates
          Object.entries(duplicateNames).forEach(([name, count]) => {
            if (count > 1) {
              const duplicates = maintenanceDebugData.filter(
                (item) => item.nama === name,
              );
            }
          });

          setEquipment(response.data);
          setLastUpdated(new Date());
          setIsDataLoaded(true);
        } else {
          setEquipment([]);
        }
      } catch (error) {
        console.error("❌ EquipmentContext: Error fetching equipment:", error);
        // Don't clear equipment on error, keep existing data
        if (equipment.length === 0) {
          setEquipment([]);
        }
      } finally {
        setLoading(false);
        isRequestingRef.current = false;
        AppStateManager.endCriticalOperation();
      }
    },
    [equipment.length],
  ); // Fixed dependency

  const fetchEquipmentPLC = useCallback(
    async (forceRefresh = false) => {
      // CRITICAL: Extend logout protection before API call
      extendLogoutProtection(5000);

      // Enhanced concurrency control using refs
      if (isRequestingRef.current && !forceRefresh) {
        return;
      }

      // Rate limiting - max 1 request per second unless forced
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;
      if (timeSinceLastRequest < 1000 && !forceRefresh) {
        return;
      }

      try {
        requestCountRef.current++;
        isRequestingRef.current = true;
        lastRequestTimeRef.current = now;
        setLoading(true);

        // Mark as critical operation to prevent logout during fetch
        AppStateManager.startCriticalOperation("EquipmentContext fetch");

        const response = await alatPlcService.getAll();

        if (response.data && Array.isArray(response.data)) {
          // Enhanced debug for problem equipment - FOKUS PADA URUTAN DAN DUPLIKASI
          const maintenanceDebugData = response.data
            .filter(
              (eq) =>
                eq.nama === "acafaaf" ||
                eq.nama === "scsC" ||
                eq.nama === "WQMS Sungai Progo Magelang",
            )
            .map((eq, index) => ({
              index: index,
              nama: eq.nama,
              id: eq.id,
              maintenanceAlertLevel: eq.maintenanceAlertLevel,
              maintenanceDaysLeft: eq.maintenanceDaysLeft,
              isMaintenanceActive: eq.isMaintenanceActive,
              maintenanceStatus: eq.maintenanceStatus,
              maintenanceDate: eq.maintenanceDate,
              maintenanceInterval: eq.maintenanceInterval,
            }));

          // Check for duplicate names
          const duplicateNames = maintenanceDebugData.reduce(
            (acc, item) => {
              acc[item.nama] = (acc[item.nama] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          // Show which equipment has duplicates
          Object.entries(duplicateNames).forEach(([name, count]) => {
            if (count > 1) {
              const duplicates = maintenanceDebugData.filter(
                (item) => item.nama === name,
              );
            }
          });

          setEquipmentPLC(response.data);
          setLastUpdated(new Date());
          setIsDataLoaded(true);
        } else {
          setEquipmentPLC([]);
        }
      } catch (error) {
        console.error("❌ EquipmentContext: Error fetching equipment:", error);
        // Don't clear equipment on error, keep existing data
        if (equipmentPLC.length === 0) {
          setEquipmentPLC([]);
        }
      } finally {
        setLoading(false);
        isRequestingRef.current = false;
        AppStateManager.endCriticalOperation();
      }
    },
    [equipmentPLC.length],
  );

  const refreshEquipment = useCallback(async () => {
    await fetchEquipment(true);
  }, [fetchEquipment]);

  const refreshEquipmentPLC = useCallback(async () => {
    await fetchEquipmentPLC(true);
  }, [fetchEquipmentPLC]);

  const clearData = useCallback(() => {
    setEquipment([]);
    setEquipmentPLC([]);
    setIsDataLoaded(false);
    setLastUpdated(null);
    isRequestingRef.current = false;
    lastRequestTimeRef.current = 0;
    requestCountRef.current = 0;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value: EquipmentContextType = useMemo(
    () => ({
      equipment,
      equipmentPLC,
      loading,
      lastUpdated,
      isDataLoaded,
      fetchEquipment,
      fetchEquipmentPLC,
      refreshEquipment,
      refreshEquipmentPLC,
      clearData,
    }),
    [
      equipment,
      equipmentPLC,
      loading,
      lastUpdated,
      isDataLoaded,
      fetchEquipment,
      fetchEquipmentPLC,
      refreshEquipment,
      refreshEquipmentPLC,
      clearData,
    ],
  );

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
};
