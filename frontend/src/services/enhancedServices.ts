import { Equipment } from "../types";
import { enhancedEquipmentService, enhancedStaffService } from "./apiSimple";

// Re-export enhanced services untuk backward compatibility
export const alatService = {
  getAll: async () => {
    try {
      const response = await enhancedEquipmentService.getAll();
      return response;
    } catch (error) {
      console.error("❌ Equipment Service: Error fetching equipment:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await enhancedEquipmentService.getById(id);
      return response;
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error fetching equipment ${id}:`,
        error
      );
      throw error;
    }
  },

  create: async (data: FormData | Omit<Equipment, "id">) => {
    try {
      const response = await enhancedEquipmentService.create(data);
      return response;
    } catch (error) {
      console.error("❌ Equipment Service: Error creating equipment:", error);
      throw error;
    }
  },

  update: async (id: string, data: FormData | Partial<Equipment>) => {
    try {
      const response = await enhancedEquipmentService.update(id, data);
      return response;
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error updating equipment ${id}:`,
        error
      );
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await enhancedEquipmentService.delete(id);
      return { success: true };
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error deleting equipment ${id}:`,
        error
      );
      throw error;
    }
  },

  // Additional maintenance methods
  stopMaintenance: async (id: string) => {
    try {
      const response = await enhancedEquipmentService.stopMaintenance(id);
      return response;
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error stopping maintenance ${id}:`,
        error
      );
      throw error;
    }
  },

  completeMaintenance: async (id: string) => {
    try {
      const response = await enhancedEquipmentService.completeMaintenance(id);
      return response;
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error completing maintenance ${id}:`,
        error
      );
      throw error;
    }
  },

  updateMaintenanceSettings: async (
    id: string,
    data: {
      maintenanceDate?: string;
      maintenanceInterval?: number;
      isMaintenanceActive?: boolean;
    }
  ) => {
    try {
      const response = await enhancedEquipmentService.updateMaintenanceSettings(
        id,
        data
      );
      return response;
    } catch (error) {
      console.error(
        `❌ Equipment Service: Error updating maintenance ${id}:`,
        error
      );
      throw error;
    }
  },
};

export const staffService = {
  getAll: async () => {
    try {
      const response = await enhancedStaffService.getAll();
      return response;
    } catch (error) {
      console.error("❌ Staff Service: Error fetching staff:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await enhancedStaffService.getById(id);
      return response;
    } catch (error) {
      console.error(`❌ Staff Service: Error fetching staff ${id}:`, error);
      throw error;
    }
  },

  create: async (data: { nama: string; email?: string }) => {
    try {
      const response = await enhancedStaffService.create(data);
      return response;
    } catch (error) {
      console.error("❌ Staff Service: Error creating staff:", error);
      throw error;
    }
  },

  update: async (id: string, data: { nama: string; email?: string }) => {
    try {
      const response = await enhancedStaffService.update(id, data);
      return response;
    } catch (error) {
      console.error(`❌ Staff Service: Error updating staff ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await enhancedStaffService.delete(id);
      return { success: true };
    } catch (error) {
      console.error(`❌ Staff Service: Error deleting staff ${id}:`, error);
      throw error;
    }
  },
};

export default { alatService, staffService };
