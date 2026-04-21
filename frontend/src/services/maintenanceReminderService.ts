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
  yellowEmailSent: boolean; 
  redEmailSent: boolean; 
}

class MaintenanceReminderService {
  private statusHistory = new Map<number, EquipmentStatusHistory>();
  private reminderIntervals = new Map<number, NodeJS.Timeout>();

  private readonly REMINDER_CONFIGS = {
    red: {
      initialDelay: 0, 
      reminderInterval: 14 * 24 * 60 * 60 * 1000, 
      maxReminders: 1,
    },
    yellow: {
      initialDelay: 0, 
      reminderInterval: 14 * 24 * 60 * 60 * 1000, 
      maxReminders: 1,
    },
  };

  async processEquipmentStatusChanges(
    equipmentList: Equipment[]
  ): Promise<void> {
    for (const equipment of equipmentList) {
      await this.checkStatusChange(equipment);
      await this.checkReminderNeeded(equipment);
    }
  }

  private async checkStatusChange(equipment: Equipment): Promise<void> {
    const equipmentId = equipment.id;
    const currentStatus = equipment.maintenanceAlertLevel || "green";
    const existingHistory = this.statusHistory.get(equipmentId);
    if (!existingHistory || existingHistory.currentStatus !== currentStatus) {
      const previousStatus = existingHistory?.currentStatus || "unknown";

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

      await this.handleStatusChange(equipment, previousStatus, currentStatus);

      this.setupReminders(equipment);
    }
  }

  private async handleStatusChange(
    equipment: Equipment,
    previousStatus: string,
    currentStatus: string
  ): Promise<void> {
    if (currentStatus === "yellow" && previousStatus !== "yellow") {
      const history = this.statusHistory.get(equipment.id);

      if (!history?.yellowEmailSent) {
        await this.sendStatusChangeEmail(equipment, "warning");

        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    if (currentStatus === "yellow" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      if (!history?.yellowEmailSent) {
        await this.sendStatusChangeEmail(equipment, "warning");

        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    if (currentStatus === "red" && previousStatus !== "red") {
      const history = this.statusHistory.get(equipment.id);

      if (!history?.redEmailSent) {
        await this.sendStatusChangeEmail(equipment, "urgent");

        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    if (currentStatus === "red" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      if (!history?.redEmailSent) {
        await this.sendStatusChangeEmail(equipment, "urgent");

        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      }
    }

    if (
      currentStatus === "green" &&
      (previousStatus === "yellow" || previousStatus === "red")
    ) {
      await this.sendStatusChangeEmail(equipment, "resolved");

      this.clearReminders(equipment.id);

      const history = this.statusHistory.get(equipment.id);
      if (history) {
        history.yellowEmailSent = false;
        history.redEmailSent = false;
        this.statusHistory.set(equipment.id, history);
      }
    }
  }

  private setupReminders(equipment: Equipment): void {
    this.clearReminders(equipment.id);
  }

  private async checkReminderNeeded(equipment: Equipment): Promise<void> {
    const history = this.statusHistory.get(equipment.id);
    if (!history) {
      return;
    }

    const currentStatus = equipment.maintenanceAlertLevel || "green";
    if (currentStatus !== "red" && currentStatus !== "yellow") {
      return;
    }

    const config =
      this.REMINDER_CONFIGS[
        currentStatus as keyof typeof this.REMINDER_CONFIGS
      ];
    const now = new Date();

    if (history.reminderEmailsSent.length >= config.maxReminders) {
      return;
    }

    const lastReminder =
      history.reminderEmailsSent[history.reminderEmailsSent.length - 1];
    const timeSinceLastReminder = lastReminder
      ? now.getTime() - lastReminder.getTime()
      : Infinity;

    if (timeSinceLastReminder >= config.reminderInterval) {
      await this.sendReminderEmail(equipment, currentStatus);
    }
  }

  private async sendReminderEmail(
    equipment: Equipment,
    status: string
  ): Promise<void> {
    const history = this.statusHistory.get(equipment.id);
    if (!history) return;

    const config =
      this.REMINDER_CONFIGS[status as keyof typeof this.REMINDER_CONFIGS];

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
      history.reminderEmailsSent.push(new Date());
      this.statusHistory.set(equipment.id, history);

      if (history.reminderEmailsSent.length < config.maxReminders) {
        const nextReminderTimeout = setTimeout(() => {
          this.sendReminderEmail(equipment, status);
        }, config.reminderInterval);

        this.reminderIntervals.set(equipment.id, nextReminderTimeout);
      }
    }
  }

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

  private clearReminders(equipmentId: number): void {
    const existingTimeout = this.reminderIntervals.get(equipmentId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.reminderIntervals.delete(equipmentId);
    }
  }

  private async getEmailFromEquipment(equipment: Equipment): Promise<string> {

    if (equipment.email && equipment.email.trim()) {
      return equipment.email.trim();
    }
    try {
      const response = await staffService.getAll();

      const staffData = Array.isArray(response)
        ? response
        : response?.data || [];

      const staffMember = staffData.find(
        (staff: {
          id?: number;
          name?: string;
          nama?: string;
          petugas?: string;
          email?: string;
        }) => {
          const picAsNumber = parseInt(equipment.pic);
          const isNumericPIC =
            !isNaN(picAsNumber) && equipment.pic === picAsNumber.toString();

          if (isNumericPIC) {
            return staff.id === picAsNumber;
          } else {
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

  private getNameFromPIC(pic: string): string {
    return pic || "Admin";
  }

  getStatusHistory(): Map<number, EquipmentStatusHistory> {
    return this.statusHistory;
  }

  getReminderIntervals(): Map<number, NodeJS.Timeout> {
    return this.reminderIntervals;
  }

  resetTracking(): void {
    this.reminderIntervals.forEach((timeout) => clearTimeout(timeout));
    this.reminderIntervals.clear();
    this.statusHistory.clear();
  }
}

export const maintenanceReminderService = new MaintenanceReminderService();
