import { Equipment } from "../types";

class MaintenanceEmailService {
  private static MAINTENANCE_EMAILS = [
    "maintenance@company.com",
    "supervisor@company.com",
  ];

  private static isDevelopmentMode = import.meta.env.DEV;
  private static STORAGE_KEY = "mms_sent_notifications";

  static init() {
    console.log("🚫 Email service has been disabled - EmailJS removed");
  }

  static isConfigured(): boolean {
    return false; // Email service is disabled
  }

  /**
   * DISABLED: Automatic email processing disabled per user request
   * Only manual test emails via buttons are allowed
   */
  static async processMaintenanceNotifications(
    equipmentList: Equipment[]
  ): Promise<void> {
    console.log(
      "🚫 AUTOMATIC EMAIL DISABLED - Hanya kirim via tombol Test Email"
    );

    // Just log the stats for monitoring
    const alertCounts = { yellow: 0, red: 0, green: 0, blue: 0, other: 0 };
    equipmentList.forEach((eq) => {
      if (eq.maintenanceAlertLevel === "yellow") {
        alertCounts.yellow++;
      } else if (eq.maintenanceAlertLevel === "red") {
        alertCounts.red++;
      } else if (eq.maintenanceAlertLevel === "green") {
        alertCounts.green++;
      } else if (eq.maintenanceAlertLevel === "blue") {
        alertCounts.blue++;
      } else {
        alertCounts.other++;
      }
    });

    console.log(
      ` Status: Yellow=${alertCounts.yellow} Red=${alertCounts.red} Green=${alertCounts.green} Blue=${alertCounts.blue}`
    );

    // Return immediately - no emails sent
    return;
  }

  static async sendWarningNotification(equipment: Equipment): Promise<void> {
    console.log(`⚠️ MANUAL TEST EMAIL - Sending warning for ${equipment.nama}`);

    if (!this.isConfigured()) {
      console.warn("Email service disabled - EmailJS removed");
      return;
    }

    try {
      console.log(`🚫 Email service disabled - Warning email would have been sent for ${equipment.nama} to:`, this.MAINTENANCE_EMAILS);
      console.log(`✅ Manual test warning email simulation completed for ${equipment.nama}`);
    } catch (error) {
      console.error(`❌ Failed to send warning for ${equipment.nama}:`, error);
    }
  }

  static async sendUrgentNotification(equipment: Equipment): Promise<void> {
    console.log(`🚨 MANUAL TEST EMAIL - Sending urgent for ${equipment.nama}`);

    if (!this.isConfigured()) {
      console.warn("Email service disabled - EmailJS removed");
      return;
    }

    try {
      console.log(`🚫 Email service disabled - Urgent email would have been sent for ${equipment.nama} to:`, this.MAINTENANCE_EMAILS);
      console.log(`🚨 Manual test urgent email simulation completed for ${equipment.nama}`);
    } catch (error) {
      console.error(`❌ Failed to send urgent for ${equipment.nama}:`, error);
    }
  }

  // Utility methods for compatibility with EquipmentTable
  static updateMaintenanceEmails(emails: string[]): void {
    this.MAINTENANCE_EMAILS.length = 0;
    this.MAINTENANCE_EMAILS.push(...emails);
    console.log("Maintenance emails updated:", emails);
  }

  static getMaintenanceEmails(): string[] {
    return [...this.MAINTENANCE_EMAILS];
  }

  static clearSessionProcessed(): void {
    console.log("🧹 Session processed cleared");
  }

  static getMode(): { isDevelopment: boolean; canSendEmail: boolean } {
    return {
      isDevelopment: this.isDevelopmentMode,
      canSendEmail: !this.isDevelopmentMode && this.isConfigured(),
    };
  }

  static enableProductionMode(): void {
    this.isDevelopmentMode = false;
    console.log("🟢 Production mode enabled");
  }

  static enableDevelopmentMode(): void {
    this.isDevelopmentMode = true;
    console.log("🚫 Development mode enabled");
  }

  static getNotificationHistory(): string[] {
    console.log("📋 Getting notification history");
    return [];
  }

  static getSentNotificationsCount(): number {
    console.log("📊 Getting sent notifications count");
    return 0;
  }

  static getProcessingStatus(): {
    lastProcessed: Date | null;
    cooldownRemaining: number;
    canProcess: boolean;
    isCurrentlyProcessing: boolean;
    processedInSession: number;
    sentNotificationsTotal: number;
  } {
    return {
      lastProcessed: null,
      cooldownRemaining: 0,
      canProcess: true,
      isCurrentlyProcessing: false,
      processedInSession: 0,
      sentNotificationsTotal: 0,
    };
  }

  static clearNotificationHistory(): void {
    console.log("🗑️ Notification history cleared");
  }

  static resetProcessingCooldown(): void {
    console.log("🔄 Processing cooldown reset");
  }

  static forceEnableEmail(): void {
    console.log("🟢 Email processing force enabled");
  }
}

export default MaintenanceEmailService;
