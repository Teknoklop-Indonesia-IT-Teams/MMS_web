import { Equipment } from "../types";
import { staffService } from "./api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

    console.log(
      `🔄 Processing ${equipmentList.length} equipment for status changes...`
    );

    for (const equipment of equipmentList) {
      console.log(
        `📊 Processing equipment: ${equipment.nama} - Status: ${
          equipment.maintenanceAlertLevel || "green"
        } - PIC: ${equipment.pic}`
      );
      await this.checkStatusChange(equipment);
      await this.checkReminderNeeded(equipment);
    }
  }

  // Check if equipment status has changed
  private async checkStatusChange(equipment: Equipment): Promise<void> {
    const equipmentId = equipment.id;
    const currentStatus = equipment.maintenanceAlertLevel || "green";
    const existingHistory = this.statusHistory.get(equipmentId);

    console.log(`🔍 Checking status change for ${equipment.nama}:`);
    console.log(`   - Equipment ID: ${equipmentId}`);
    console.log(`   - Current Status: ${currentStatus}`);
    console.log(
      `   - Previous Status: ${existingHistory?.currentStatus || "unknown"}`
    );
    console.log(`   - PIC: ${equipment.pic}`);

    // First time seeing this equipment or status changed
    if (!existingHistory || existingHistory.currentStatus !== currentStatus) {
      const previousStatus = existingHistory?.currentStatus || "unknown";

      console.log(
        `🔄 Status change detected for ${equipment.nama}: ${previousStatus} → ${currentStatus}`
      );

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
    const statusTransition = `${previousStatus} → ${currentStatus}`;

    console.log(
      `🔄 Status change detected for ${equipment.nama}: ${statusTransition}`
    );

    // Send email for yellow status (warning)
    if (currentStatus === "yellow" && previousStatus !== "yellow") {
      const history = this.statusHistory.get(equipment.id);

      // Check if warning email was already sent for this equipment
      if (!history?.yellowEmailSent) {
        console.log(
          `⚠️ Sending YELLOW status notification for: ${equipment.nama}`
        );
        await this.sendStatusChangeEmail(equipment, "warning");

        // Update flag to mark yellow email as sent
        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      } else {
        console.log(
          `⚠️ YELLOW email already sent for ${equipment.nama}, skipping`
        );
      }
    }

    // For equipment that's already yellow but was unknown/first time, also send email
    if (currentStatus === "yellow" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      // Check if warning email was already sent for this equipment
      if (!history?.yellowEmailSent) {
        console.log(
          `⚠️ Sending YELLOW status notification for existing yellow equipment: ${equipment.nama}`
        );
        await this.sendStatusChangeEmail(equipment, "warning");

        // Update flag to mark yellow email as sent
        if (history) {
          history.lastWarningEmailSent = new Date();
          history.yellowEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      } else {
        console.log(
          `⚠️ YELLOW email already sent for existing equipment ${equipment.nama}, skipping`
        );
      }
    }

    // Send email for red status (urgent)
    if (currentStatus === "red" && previousStatus !== "red") {
      const history = this.statusHistory.get(equipment.id);

      // Check if urgent email was already sent for this equipment
      if (!history?.redEmailSent) {
        console.log(
          `🚨 Sending RED status notification for: ${equipment.nama}`
        );
        await this.sendStatusChangeEmail(equipment, "urgent");

        // Update flag to mark red email as sent
        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      } else {
        console.log(
          `🚨 RED email already sent for ${equipment.nama}, skipping`
        );
      }
    }

    // For equipment that's already red but was unknown/first time, also send email
    if (currentStatus === "red" && previousStatus === "unknown") {
      const history = this.statusHistory.get(equipment.id);

      // Check if urgent email was already sent for this equipment
      if (!history?.redEmailSent) {
        console.log(
          `🚨 Sending RED status notification for existing red equipment: ${equipment.nama}`
        );
        await this.sendStatusChangeEmail(equipment, "urgent");

        // Update flag to mark red email as sent
        if (history) {
          history.lastUrgentEmailSent = new Date();
          history.redEmailSent = true;
          this.statusHistory.set(equipment.id, history);
        }
      } else {
        console.log(
          `🚨 RED email already sent for existing equipment ${equipment.nama}, skipping`
        );
      }
    }

    // Send green status (resolved) notification
    if (
      currentStatus === "green" &&
      (previousStatus === "yellow" || previousStatus === "red")
    ) {
      console.log(
        `✅ Sending RESOLVED status notification for: ${equipment.nama}`
      );
      await this.sendStatusChangeEmail(equipment, "resolved");

      // Clear reminders for this equipment
      this.clearReminders(equipment.id);

      // Reset email flags when status is resolved
      const history = this.statusHistory.get(equipment.id);
      if (history) {
        history.yellowEmailSent = false;
        history.redEmailSent = false;
        this.statusHistory.set(equipment.id, history);
        console.log(
          `🔄 Email flags reset for ${equipment.nama} - can send new alerts when status changes again`
        );
      }
    }
  }

  // Setup automatic reminders based on status
  private setupReminders(equipment: Equipment): void {
    // Clear existing reminders first
    this.clearReminders(equipment.id);

    // Since maxReminders is 1 for both yellow and red, no need to setup recurring reminders
    // Email will be sent immediately when status changes
    console.log(
      `ℹ️ No recurring reminders needed for ${equipment.nama} - email sent once per status change`
    );
  }

  // Check if reminder is needed based on time elapsed
  private async checkReminderNeeded(equipment: Equipment): Promise<void> {
    const history = this.statusHistory.get(equipment.id);
    if (!history) {
      console.log(
        `⚠️ No history found for ${equipment.nama}, skipping reminder check`
      );
      return;
    }

    const currentStatus = equipment.maintenanceAlertLevel || "green";

    console.log(
      `⏰ Checking reminder for ${equipment.nama} (Status: ${currentStatus})`
    );

    // Only send reminders for red/yellow status
    if (currentStatus !== "red" && currentStatus !== "yellow") {
      console.log(
        `ℹ️ ${equipment.nama} status is ${currentStatus}, no reminder needed`
      );
      return;
    }

    const config =
      this.REMINDER_CONFIGS[
        currentStatus as keyof typeof this.REMINDER_CONFIGS
      ];
    const now = new Date();

    // Check if we've reached max reminders
    if (history.reminderEmailsSent.length >= config.maxReminders) {
      console.log(
        `📧 Max reminders (${config.maxReminders}) reached for ${equipment.nama}`
      );
      return;
    }

    // Check if enough time has passed since last reminder
    const lastReminder =
      history.reminderEmailsSent[history.reminderEmailsSent.length - 1];
    const timeSinceLastReminder = lastReminder
      ? now.getTime() - lastReminder.getTime()
      : Infinity;

    console.log(
      `⏱️ Time since last reminder for ${equipment.nama}: ${timeSinceLastReminder}ms (Required: ${config.reminderInterval}ms)`
    );

    if (timeSinceLastReminder >= config.reminderInterval) {
      console.log(`✅ Sending reminder for ${equipment.nama}`);
      await this.sendReminderEmail(equipment, currentStatus);
    } else {
      console.log(`⏳ Not enough time passed for ${equipment.nama} reminder`);
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
      console.log(`📧 Max reminders reached for ${equipment.nama}`);
      return;
    }

    console.log(
      `🔔 Sending ${status.toUpperCase()} reminder email for: ${equipment.nama}`
    );

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

        console.log(
          `⏰ Next reminder scheduled for ${equipment.nama} in ${
            config.reminderInterval >= 60 * 60 * 1000
              ? `${config.reminderInterval / (60 * 60 * 1000)} hours`
              : `${config.reminderInterval / (60 * 1000)} minutes`
          }`
        );
      } else {
        console.log(`📧 All reminders sent for ${equipment.nama}`);
      }
    }
  }

  // Send status change email
  private async sendStatusChangeEmail(
    equipment: Equipment,
    type: "warning" | "urgent" | "resolved"
  ): Promise<boolean> {
    try {
      console.log(
        `📧 Attempting to send ${type} email for ${equipment.nama}...`
      );

      const recipientEmail = await this.getEmailFromEquipment(equipment);
      const recipientName = this.getNameFromPIC(equipment.pic);

      console.log(`📧 Email details: ${recipientEmail} (${recipientName})`);

      console.log(`📧 Email service has been disabled - skipping ${type} email for ${equipment.nama}`);

      // Email service is disabled, just return false but log the action
      console.log(`🚫 EmailJS service removed - ${type} email would have been sent for ${equipment.nama}`);
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
      console.log(`⏰ Reminders cleared for equipment ID: ${equipmentId}`);
    }
  }

  // Get email from equipment using staff data
  private async getEmailFromEquipment(equipment: Equipment): Promise<string> {
    // First check if equipment has direct email
    if (equipment.email && equipment.email.trim()) {
      console.log(`✅ Using equipment direct email: ${equipment.email}`);
      return equipment.email.trim();
    }

    console.log(`🔍 Looking up email for PIC: "${equipment.pic}"`);

    // Try to get email from staff data based on PIC name or ID
    try {
      const response = await staffService.getAll();
      console.log(
        "Staff API response in maintenanceReminderService:",
        response
      );

      // Handle direct array response from staff API
      const staffData = Array.isArray(response)
        ? response
        : response?.data || [];
      console.log("Staff data for email lookup:", staffData);

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

      console.log(
        `Looking for PIC: "${equipment.pic}", Found staff:`,
        staffMember
      );

      if (staffMember && staffMember.email && staffMember.email.trim()) {
        console.log(
          `✅ Found email for ${equipment.pic}: ${staffMember.email}`
        );
        return staffMember.email.trim();
      } else {
        console.log(`❌ No email found for PIC: "${equipment.pic}"`);
      }
    } catch (error) {
      console.error("❌ Error fetching staff data for email:", error);
    }

    // Fallback to default admin email
    console.log(`⚠️ Using fallback email for ${equipment.nama}`);
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
    console.log("🔄 All tracking data reset");
  }
}

export const maintenanceReminderService = new MaintenanceReminderService();
