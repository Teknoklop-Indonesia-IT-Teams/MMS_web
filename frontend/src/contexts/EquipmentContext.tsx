import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Equipment } from "../types";
import { alatService } from "../services/enhancedServices";
import { extendLogoutProtection } from "../services/apiSimple";
import { AppStateManager } from "../utils/appState";

interface EquipmentContextType {
  equipment: Equipment[];
  loading: boolean;
  lastUpdated: Date | null;
  isDataLoaded: boolean;
  fetchEquipment: (forceRefresh?: boolean) => Promise<void>;
  refreshEquipment: () => Promise<void>;
  clearData: () => void;
}

export const EquipmentContext = createContext<EquipmentContextType | undefined>(
  undefined
);

interface EquipmentProviderProps {
  children: React.ReactNode;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({
  children,
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
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
        console.log(
          "🚫 Equipment fetch already in progress, blocking duplicate request"
        );
        return;
      }

      // Rate limiting - max 1 request per second unless forced
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;
      if (timeSinceLastRequest < 1000 && !forceRefresh) {
        console.log("🚫 Rate limiting: Too many requests, waiting...");
        return;
      }

      try {
        requestCountRef.current++;
        console.log(
          `🔄 EquipmentContext: Fetching equipment (#${requestCountRef.current}, forceRefresh: ${forceRefresh})`
        );

        isRequestingRef.current = true;
        lastRequestTimeRef.current = now;
        setLoading(true);

        // Mark as critical operation to prevent logout during fetch
        AppStateManager.startCriticalOperation("EquipmentContext fetch");

        const response = await alatService.getAll();

        if (response.data && Array.isArray(response.data)) {
          console.log(
            "✅ EquipmentContext: Equipment data updated",
            response.data.length,
            "items"
          );

          // Enhanced debug for problem equipment - FOKUS PADA URUTAN DAN DUPLIKASI
          const maintenanceDebugData = response.data
            .filter(
              (eq) =>
                eq.nama === "acafaaf" ||
                eq.nama === "scsC" ||
                eq.nama === "WQMS Sungai Progo Magelang"
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

          console.log(
            "🔍 EquipmentContext: Enhanced maintenance debug data:",
            maintenanceDebugData
          );

          // TOTAL EQUIPMENT ANALYSIS
          const allEquipment = response.data || [];
          console.log("📊 CONTEXT TOTAL ANALYSIS:", {
            totalEquipment: allEquipment.length,
            maintenanceActiveCount: allEquipment.filter((eq) =>
              Boolean(eq.isMaintenanceActive)
            ).length,
            alertLevelDistribution: {
              red: allEquipment.filter(
                (eq) => eq.maintenanceAlertLevel === "red"
              ).length,
              yellow: allEquipment.filter(
                (eq) => eq.maintenanceAlertLevel === "yellow"
              ).length,
              green: allEquipment.filter(
                (eq) => eq.maintenanceAlertLevel === "green"
              ).length,
              blue: allEquipment.filter(
                (eq) => eq.maintenanceAlertLevel === "blue"
              ).length,
              other: allEquipment.filter(
                (eq) =>
                  !["red", "yellow", "green", "blue"].includes(
                    eq.maintenanceAlertLevel || ""
                  )
              ).length,
            },
          });

          // Check for duplicate names
          const duplicateNames = maintenanceDebugData.reduce((acc, item) => {
            acc[item.nama] = (acc[item.nama] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          console.log("🚨 FRONTEND DUPLICATE ANALYSIS:", duplicateNames);

          // Show which equipment has duplicates
          Object.entries(duplicateNames).forEach(([name, count]) => {
            if (count > 1) {
              console.log(
                `⚠️ FRONTEND DUPLICATE: "${name}" appears ${count} times`
              );
              const duplicates = maintenanceDebugData.filter(
                (item) => item.nama === name
              );
              duplicates.forEach((dup, idx) => {
                console.log(
                  `  ${idx + 1}. ID:${dup.id} AlertLevel:${
                    dup.maintenanceAlertLevel
                  } Days:${dup.maintenanceDaysLeft}`
                );
              });
            }
          });

          setEquipment(response.data);
          setLastUpdated(new Date());
          setIsDataLoaded(true);
        } else {
          console.warn("⚠️ EquipmentContext: Invalid equipment data received");
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
    [equipment.length]
  ); // Fixed dependency

  const refreshEquipment = useCallback(async () => {
    await fetchEquipment(true);
  }, [fetchEquipment]);

  const clearData = useCallback(() => {
    console.log("🧹 Clearing equipment data");
    setEquipment([]);
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
      loading,
      lastUpdated,
      isDataLoaded,
      fetchEquipment,
      refreshEquipment,
      clearData,
    }),
    [
      equipment,
      loading,
      lastUpdated,
      isDataLoaded,
      fetchEquipment,
      refreshEquipment,
      clearData,
    ]
  );

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
};
