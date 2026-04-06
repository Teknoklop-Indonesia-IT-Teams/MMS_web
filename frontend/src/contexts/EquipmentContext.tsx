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
  undefined,
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

  const isRequestingRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const requestCountRef = useRef(0);

  const fetchEquipment = useCallback(
    async (forceRefresh = false) => {
      extendLogoutProtection(5000);

      if (isRequestingRef.current && !forceRefresh) {
        return;
      }

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

        AppStateManager.startCriticalOperation("EquipmentContext fetch");

        const response = await alatService.getAll();

        if (response.data && Array.isArray(response.data)) {
          setEquipment(response.data);
          setLastUpdated(new Date());
          setIsDataLoaded(true);
        } else {
          setEquipment([]);
        }
      } catch (error) {
        console.error("❌ EquipmentContext: Error fetching equipment:", error);
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
  );

  const refreshEquipment = useCallback(async () => {
    await fetchEquipment(true);
  }, [fetchEquipment]);

  const clearData = useCallback(() => {
    setEquipment([]);
    setIsDataLoaded(false);
    setLastUpdated(null);
    isRequestingRef.current = false;
    lastRequestTimeRef.current = 0;
    requestCountRef.current = 0;
  }, []);

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
    ],
  );

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
};
