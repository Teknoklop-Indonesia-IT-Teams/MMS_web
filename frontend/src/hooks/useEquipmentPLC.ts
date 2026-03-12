import { useContext } from "react";
import { EquipmentContext } from "../contexts/EquipmentContext";

export const useEquipmentPLC = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useEquipmentPLC must be used within an EquipmentProvider");
  }
  return context;
};
