import { Equipment } from "../types";
import { enhancedEquipmentService, enhancedStaffService } from "./apiSimple";

// Re-export enhanced services untuk backward compatibility
export const alatService = {
  getAll: async () => {
    try {
      console.log("🔄 Equipment Service: Fetching all equipment...");
      const response = await enhancedEquipmentService.getAll();
      console.log(
        "✅ Equipment Service: Success!",
        response.data?.length || 0,
        "items"
      );
      return response;
    } catch (error) {
      console.error("❌ Equipment Service: Error fetching equipment:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`🔄 Equipment Service: Fetching equipment ${id}...`);
      const response = await enhancedEquipmentService.getById(id);
      console.log("✅ Equipment Service: Successfully fetched equipment");
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
      console.log("🔄 Equipment Service: Creating equipment...");
      const response = await enhancedEquipmentService.create(data);
      console.log("✅ Equipment Service: Successfully created equipment");
      return response;
    } catch (error) {
      console.error("❌ Equipment Service: Error creating equipment:", error);
      throw error;
    }
  },

  update: async (id: string, data: FormData | Partial<Equipment>) => {
    try {
      console.log(`🔄 Equipment Service: Updating equipment ${id}...`);
      const response = await enhancedEquipmentService.update(id, data);
      console.log("✅ Equipment Service: Successfully updated equipment");
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
      console.log(`🔄 Equipment Service: Deleting equipment ${id}...`);
      await enhancedEquipmentService.delete(id);
      console.log("✅ Equipment Service: Successfully deleted equipment");
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
      console.log(`🛑 Equipment Service: Stopping maintenance for ${id}...`);
      const response = await enhancedEquipmentService.stopMaintenance(id);
      console.log("✅ Equipment Service: Successfully stopped maintenance");
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
      console.log(`✅ Equipment Service: Completing maintenance for ${id}...`);
      const response = await enhancedEquipmentService.completeMaintenance(id);
      console.log("✅ Equipment Service: Successfully completed maintenance");
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
      console.log(
        `🔧 Equipment Service: Updating maintenance settings for ${id}...`
      );
      const response = await enhancedEquipmentService.updateMaintenanceSettings(
        id,
        data
      );
      console.log("✅ Equipment Service: Successfully updated maintenance");
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
      console.log("🔄 Staff Service: Fetching all staff...");
      const response = await enhancedStaffService.getAll();
      console.log(
        "✅ Staff Service: Success!",
        response.data?.length || 0,
        "staff members"
      );
      return response;
    } catch (error) {
      console.error("❌ Staff Service: Error fetching staff:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`🔄 Staff Service: Fetching staff ${id}...`);
      const response = await enhancedStaffService.getById(id);
      console.log("✅ Staff Service: Successfully fetched staff");
      return response;
    } catch (error) {
      console.error(`❌ Staff Service: Error fetching staff ${id}:`, error);
      throw error;
    }
  },

  create: async (data: { nama: string; email?: string }) => {
    try {
      console.log("🔄 Staff Service: Creating staff...", data);
      const response = await enhancedStaffService.create(data);
      console.log("✅ Staff Service: Successfully created staff");
      return response;
    } catch (error) {
      console.error("❌ Staff Service: Error creating staff:", error);
      throw error;
    }
  },

  update: async (id: string, data: { nama: string; email?: string }) => {
    try {
      console.log(`🔄 Staff Service: Updating staff ${id}...`, data);
      const response = await enhancedStaffService.update(id, data);
      console.log("✅ Staff Service: Successfully updated staff");
      return response;
    } catch (error) {
      console.error(`❌ Staff Service: Error updating staff ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      console.log(`🔄 Staff Service: Deleting staff ${id}...`);
      await enhancedStaffService.delete(id);
      console.log("✅ Staff Service: Successfully deleted staff");
      return { success: true };
    } catch (error) {
      console.error(`❌ Staff Service: Error deleting staff ${id}:`, error);
      throw error;
    }
  },
};

export default { alatService, staffService };
