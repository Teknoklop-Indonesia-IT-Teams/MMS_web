import { Equipment } from "../types";
import { staffService } from "./api";

const API_URL = import.meta.env.VITE_API_URL;

interface EquipmentStatusHistory {
  equipmentId: number;
  previousStatus: string;
  currentStatus: string;
  statusChangedAt: Date;
  lastWarningEmailSent?: Date;
  lastUrgentEmailSent?: Date;
  reminderEmailsSent: Date[];
  yellowEmailSent: boolean; // Flag to track if yellow email was sent
  redEmailSent: boolean; // Flag to track if red email was sent
}

class MaintenanceReminderService {
  private statusHistory = new Map<number, EquipmentStatusHistory>();
  private reminderIntervals = new Map<number, NodeJS.Timeout>();

  // Configuration for reminders
  private readonly REMINDER_CONFIGS = {
    red: {
      initialDelay: 0, // Send immediately when status changes to red
      reminderInterval: 14 * 24 * 60 * 60 * 1000, // Every 14 days (not used since maxReminders = 1)
      maxReminders: 1, // Maximum 1 email per red status
    },
    yellow: {
      initialDelay: 0, // Send immediately when status changes to yellow
      reminderInterval: 14 * 24 * 60 * 60 * 1000, // Every 14 days (not used since maxReminders = 1)
      maxReminders: 1, // Maximum 1 email per yellow status
    },
  };

  // Check for status changes and trigger emails
  async processEquipmentStatusChanges(
    equipmentList: Equipment[]
  ): Promise<void> {
    for (const equipment of equipmentList) {
      await this.checkStatusChange(equipment);
      await this.checkReminderNeeded(equipment);
    }
  }

  // Check if equipment status has changed
  private async checkStatusChange(equipment: Equipment): Promise<void> {
    const equipmentId = equipment.id;
    const currentStatus = equipment.maintenanceAlertLevel || "green";
    const existingHistory = this.statusHistory.get(equipmentId);
    // First time seeing this equipment or status changed
    if (!existingHistory || existingHistory.currentStatus !== currentStatus) {
      const previousStatus = existingHistory?.currentStatus || "unknown";

      // Update status history
      const newHistory: EquipmentStatusHistory = {
        equipmentId,
        previousStatus,
        currentStatus,
        statusChangedAt: new Date(),
        reminderEmailsSent: existingHistory?.reminderEmailsSent || [],
        yellowEmailSent: existingHistory?.yellowEmailSent || false,
        redEmailSent: existingHistory?.redEmailSent || false,
      };

      this.statusHistory.set(equipmentId, newHistory);

      // Send immediate notification for status change
      await this.handleStatusChange(equipment, previousStatus, currentStatus);

      // Setup reminder system for red/yellow status
      this.setupReminders(equipment);
    }
  }

  // Handle status change notifications
  private async handleStatusChange(
    equipment: Equipment,
    previousStatus: string,
    currentStatus: string
  ): Promise<void> {
    // Send email for yellow status (warning)
    if (currentStatus === "yellow" && previousStatus !== "yellow") {
      const history = this.statusHistory.get(equipment.id);

      // Check if warning email was already sent for this equipment
      if (!history?.yellowEmailSent) {
        await this.sendStatusChangeEmail(equipment, "warning");

        // Update flag to mark yellow email as sent
        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    // For equipment that's already yellow but was unknown/first time, also send email
    if (currentStatus === "yellow" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      // Check if warning email was already sent for this equipment
      if (!history?.yellowEmailSent) {
        await this.sendStatusChangeEmail(equipment, "warning");

        // Update flag to mark yellow email as sent
        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    // Send email for red status (urgent)
    if (currentStatus === "red" && previousStatus !== "red") {
      const history = this.statusHistory.get(equipment.id);

      // Check if urgent email was already sent for this equipment
      if (!history?.redEmailSent) {
        await this.sendStatusChangeEmail(equipment, "urgent");

        // Update flag to mark red email as sent
        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    // For equipment that's already red but was unknown/first time, also send email
    if (currentStatus === "red" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      // Check if urgent email was already sent for this equipment
      if (!history?.redEmailSent) {
        await this.sendStatusChangeEmail(equipment, "urgent");

        // Update flag to mark red email as sent
        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    // Send green status (resolved) notification
    if (
      currentStatus === "green" &&
      (previousStatus === "yellow" || previousStatus === "red")
    ) {
      await this.sendStatusChangeEmail(equipment, "resolved");

      // Clear reminders for this equipment
      this.clearReminders(equipment.id);

      // Reset email flags when status is resolved
      const history = this.statusHistory.get(equipment.id);
      if (history) {
        history.yellowEmailSent = false;
        history.redEmailSent = false;
        this.statusHistory.set(equipment.id, history);
      }
    }
  }

  // Setup automatic reminders based on status
  private setupReminders(equipment: Equipment): void {
    // Clear existing reminders first
    this.clearReminders(equipment.id);
  }

  // Check if reminder is needed based on time elapsed
  private async checkReminderNeeded(equipment: Equipment): Promise<void> {
    const history = this.statusHistory.get(equipment.id);
    if (!history) {
      return;
    }

    const currentStatus = equipment.maintenanceAlertLevel || "green";
    // Only send reminders for red/yellow status
    if (currentStatus !== "red" && currentStatus !== "yellow") {
      return;
    }

    const config =
      this.REMINDER_CONFIGS[
        currentStatus as keyof typeof this.REMINDER_CONFIGS
      ];
    const now = new Date();

    // Check if we've reached max reminders
    if (history.reminderEmailsSent.length >= config.maxReminders) {
      return;
    }

    // Check if enough time has passed since last reminder
    const lastReminder =
      history.reminderEmailsSent[history.reminderEmailsSent.length - 1];
    const timeSinceLastReminder = lastReminder
      ? now.getTime() - lastReminder.getTime()
      : Infinity;

    if (timeSinceLastReminder >= config.reminderInterval) {
      await this.sendReminderEmail(equipment, currentStatus);
    }
  }

  // Send reminder email
  private async sendReminderEmail(
    equipment: Equipment,
    status: string
  ): Promise<void> {
    const history = this.statusHistory.get(equipment.id);
    if (!history) return;

    const config =
      this.REMINDER_CONFIGS[status as keyof typeof this.REMINDER_CONFIGS];

    // Check if we haven't exceeded max reminders
    if (history.reminderEmailsSent.length >= config.maxReminders) {
      return;
    }

    let success = false;
    if (status === "yellow") {
      success = await this.sendWarningReminderEmail(
        equipment,
        history.reminderEmailsSent.length + 1
      );
    } else if (status === "red") {
      success = await this.sendUrgentReminderEmail(
        equipment,
        history.reminderEmailsSent.length + 1
      );
    }

    if (success) {
      // Update reminder history
      history.reminderEmailsSent.push(new Date());
      this.statusHistory.set(equipment.id, history);

      // Schedule next reminder if not at max
      if (history.reminderEmailsSent.length < config.maxReminders) {
        const nextReminderTimeout = setTimeout(() => {
          this.sendReminderEmail(equipment, status);
        }, config.reminderInterval);

        this.reminderIntervals.set(equipment.id, nextReminderTimeout);
      }
    }
  }

  // Send status change email
  private async sendStatusChangeEmail(
    equipment: Equipment,
    type: "warning" | "urgent" | "resolved"
  ): Promise<boolean> {
    try {
      return false;
    } catch (error) {
      console.error(
        `❌ Error sending ${type} email for ${equipment.nama}:`,
        error
      );
      return false;
    }
  }

  // Send warning reminder email
  private async sendWarningReminderEmail(
    equipment: Equipment,
    reminderNumber: number
  ): Promise<boolean> {
    try {
      const emailData = {
        recipientEmail: await this.getEmailFromEquipment(equipment),
        recipientName: this.getNameFromPIC(equipment.pic),
        equipmentName: equipment.nama,
        location: equipment.lokasi,
        daysLeft: equipment.maintenanceDaysLeft || 0,
        nextMaintenanceDate: equipment.nextMaintenanceDate || "Unknown",
        reminderNumber,
        totalReminders: this.REMINDER_CONFIGS.yellow.maxReminders,
      };

      const response = await fetch(
        `${API_URL}/email/maintenance-warning-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("❌ Error sending warning reminder email:", error);
      return false;
    }
  }

  // Send urgent reminder email
  private async sendUrgentReminderEmail(
    equipment: Equipment,
    reminderNumber: number
  ): Promise<boolean> {
    try {
      const emailData = {
        recipientEmail: await this.getEmailFromEquipment(equipment),
        recipientName: this.getNameFromPIC(equipment.pic),
        equipmentName: equipment.nama,
        location: equipment.lokasi,
        daysLeft: equipment.maintenanceDaysLeft || 0,
        nextMaintenanceDate: equipment.nextMaintenanceDate || "Unknown",
        reminderNumber,
        totalReminders: this.REMINDER_CONFIGS.red.maxReminders,
      };

      const response = await fetch(
        `${API_URL}/email/maintenance-urgent-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("❌ Error sending urgent reminder email:", error);
      return false;
    }
  }

  // Clear reminders for equipment
  private clearReminders(equipmentId: number): void {
    const existingTimeout = this.reminderIntervals.get(equipmentId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.reminderIntervals.delete(equipmentId);
    }
  }

  // Get email from equipment using staff data
  private async getEmailFromEquipment(equipment: Equipment): Promise<string> {
    // First check if equipment has direct email
    if (equipment.email && equipment.email.trim()) {
      return equipment.email.trim();
    }
    // Try to get email from staff data based on PIC name or ID
    try {
      const response = await staffService.getAll();

      // Handle direct array response from staff API
      const staffData = Array.isArray(response)
        ? response
        : response?.data || [];

      // Find staff member by name, petugas, or ID
      const staffMember = staffData.find(
        (staff: {
          id?: number;
          name?: string;
          nama?: string;
          petugas?: string;
          email?: string;
        }) => {
          // Check if PIC is numeric (ID) or string (name)
          const picAsNumber = parseInt(equipment.pic);
          const isNumericPIC =
            !isNaN(picAsNumber) && equipment.pic === picAsNumber.toString();

          if (isNumericPIC) {
            // Match by ID
            return staff.id === picAsNumber;
          } else {
            // Match by name
            return (
              staff.name === equipment.pic ||
              staff.nama === equipment.pic ||
              staff.petugas === equipment.pic
            );
          }
        }
      );

      if (staffMember && staffMember.email && staffMember.email.trim()) {
        return staffMember.email.trim();
      } else {
        console.log(`❌ No email found for PIC: "${equipment.pic}"`);
      }
    } catch (error) {
      console.error("❌ Error fetching staff data for email:", error);
    }
    return "admin@company.com";
  }

  // Get name from PIC (same as emailService)
  private getNameFromPIC(pic: string): string {
    return pic || "Admin";
  }

  // Get status history for debugging
  getStatusHistory(): Map<number, EquipmentStatusHistory> {
    return this.statusHistory;
  }

  // Get reminder intervals for debugging
  getReminderIntervals(): Map<number, NodeJS.Timeout> {
    return this.reminderIntervals;
  }

  // Reset all tracking (for testing)
  resetTracking(): void {
    // Clear all timeouts
    this.reminderIntervals.forEach((timeout) => clearTimeout(timeout));
    this.reminderIntervals.clear();
    this.statusHistory.clear();
  }
}

export const maintenanceReminderService = new MaintenanceReminderService();
