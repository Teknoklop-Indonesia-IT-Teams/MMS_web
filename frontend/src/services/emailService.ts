import { Equipment } from "../types";

export interface EmailNotificationData {
  equipmentId: number;
  equipmentName: string;
  location: string;
  maintenanceStatus: string;
  maintenanceAlertLevel: string;
  maintenanceDaysLeft: number | null;
  nextMaintenanceDate: string | null;
  pic: string;
}

export interface EmailConfig {
  recipientEmail: string;
  recipientName: string;
  equipmentName: string;
  location: string;
  daysLeft: number;
  nextMaintenanceDate: string;
}

class EmailNotificationService {
  private baseURL = `${import.meta.env.VITE_API_URL}`;
  private sentNotifications = new Set<string>(); // Track sent notifications to avoid spam

  // Generate unique key for equipment notification
  private getNotificationKey(equipmentId: number, alertLevel: string): string {
    return `${equipmentId}-${alertLevel}-${new Date().toDateString()}`;
  }

  // Check if notification was already sent today
  private wasNotificationSent(
    equipmentId: number,
    alertLevel: string
  ): boolean {
    const key = this.getNotificationKey(equipmentId, alertLevel);
    return this.sentNotifications.has(key);
  }

  // Mark notification as sent
  private markNotificationSent(equipmentId: number, alertLevel: string): void {
    const key = this.getNotificationKey(equipmentId, alertLevel);
    this.sentNotifications.add(key);
  }

  // Get email address based on equipment email or PIC
  private getEmailFromEquipment(equipment: Equipment): string {
    // Prioritas: 1. Email dari equipment, 2. Email dari PIC mapping, 3. Default email
    if (equipment.email && equipment.email.trim()) {
      return equipment.email.trim();
    }

    const emailMapping: { [key: string]: string } = {
      "1": "admin1@company.com",
      "2": "technician2@company.com",
      "3": "supervisor3@company.com",
      "4": "manager4@company.com",
      "Achmad Rofiuddin": "achmad.rofiuddin@company.com",
      "Revan Ardian": "revan.ardian@company.com",
    };

    return emailMapping[equipment.pic] || "alirohman857@gmail.com"; // Default ke email testing
  }

  // Get name from PIC
  private getNameFromPIC(pic: string): string {
    const nameMapping: { [key: string]: string } = {
      "1": "Admin 1",
      "2": "Technician 2",
      "3": "Supervisor 3",
      "4": "Manager 4",
      "Achmad Rofiuddin": "Achmad Rofiuddin",
      "Revan Ardian": "Revan Ardian",
    };

    return nameMapping[pic] || pic || "Tim Maintenance";
  }

  // Send email notification for yellow status (warning)
  async sendMaintenanceWarningEmail(equipment: Equipment): Promise<boolean> {
    try {
      // Check if notification was already sent today
      if (this.wasNotificationSent(equipment.id, "yellow")) {
        console.log(
          `Warning email already sent today for equipment ${equipment.nama}`
        );
        return true;
      }

      const emailConfig: EmailConfig = {
        recipientEmail: this.getEmailFromEquipment(equipment),
        recipientName: this.getNameFromPIC(equipment.pic),
        equipmentName: equipment.nama,
        location: equipment.lokasi,
        daysLeft: equipment.maintenanceDaysLeft || 0,
        nextMaintenanceDate: equipment.nextMaintenanceDate || "Unknown",
      };

      const response = await fetch(
        `${this.baseURL}/email/maintenance-warning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailConfig),
        }
      );

      if (response.ok) {
        this.markNotificationSent(equipment.id, "yellow");
        return true;
      } else {
        console.error(
          "❌ Failed to send warning email:",
          await response.text()
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending warning email:", error);
      return false;
    }
  }

  // Send email notification for red status (urgent)
  async sendMaintenanceUrgentEmail(equipment: Equipment): Promise<boolean> {
    try {
      // Check if notification was already sent today
      if (this.wasNotificationSent(equipment.id, "red")) {
        console.log(
          `Urgent email already sent today for equipment ${equipment.nama}`
        );
        return true;
      }

      const emailConfig: EmailConfig = {
        recipientEmail: this.getEmailFromEquipment(equipment),
        recipientName: this.getNameFromPIC(equipment.pic),
        equipmentName: equipment.nama,
        location: equipment.lokasi,
        daysLeft: equipment.maintenanceDaysLeft || 0,
        nextMaintenanceDate: equipment.nextMaintenanceDate || "Unknown",
      };

      const response = await fetch(`${this.baseURL}/email/maintenance-urgent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailConfig),
      });

      if (response.ok) {
        this.markNotificationSent(equipment.id, "red");
        return true;
      } else {
        console.error("❌ Failed to send urgent email:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending urgent email:", error);
      return false;
    }
  }

  // Check and send notifications for equipment with yellow/red status
  async checkAndSendNotifications(equipmentList: Equipment[]): Promise<void> {
    const yellowEquipment = equipmentList.filter(
      (eq) => eq.maintenanceAlertLevel === "yellow" && eq.isMaintenanceActive
    );

    const redEquipment = equipmentList.filter(
      (eq) =>
        eq.maintenanceAlertLevel === "red" &&
        eq.isMaintenanceActive &&
        eq.maintenanceStatus !== "selesai"
    );

    // Send yellow status notifications
    for (const equipment of yellowEquipment) {
      await this.sendMaintenanceWarningEmail(equipment);
      // Add small delay to prevent overwhelming the email service
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Send red status notifications
    for (const equipment of redEquipment) {
      await this.sendMaintenanceUrgentEmail(equipment);
      // Add small delay to prevent overwhelming the email service
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Manual trigger for testing
  async testEmail(equipment: Equipment): Promise<boolean> {
    if (equipment.maintenanceAlertLevel === "yellow") {
      return await this.sendMaintenanceWarningEmail(equipment);
    } else if (equipment.maintenanceAlertLevel === "red") {
      return await this.sendMaintenanceUrgentEmail(equipment);
    }
    return false;
  }
}

export const emailNotificationService = new EmailNotificationService();
