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
  private sentNotifications = new Set<string>();

  private getNotificationKey(equipmentId: number, alertLevel: string): string {
    return `${equipmentId}-${alertLevel}-${new Date().toDateString()}`;
  }

  private wasNotificationSent(
    equipmentId: number,
    alertLevel: string
  ): boolean {
    const key = this.getNotificationKey(equipmentId, alertLevel);
    return this.sentNotifications.has(key);
  }

  private markNotificationSent(equipmentId: number, alertLevel: string): void {
    const key = this.getNotificationKey(equipmentId, alertLevel);
    this.sentNotifications.add(key);
  }

  private getEmailFromEquipment(equipment: Equipment): string {
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

    return emailMapping[equipment.pic] || "alirohman857@gmail.com";
  }

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

  async sendMaintenanceWarningEmail(equipment: Equipment): Promise<boolean> {
    try {
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

  async sendMaintenanceUrgentEmail(equipment: Equipment): Promise<boolean> {
    try {
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

    for (const equipment of yellowEquipment) {
      await this.sendMaintenanceWarningEmail(equipment);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    for (const equipment of redEquipment) {
      await this.sendMaintenanceUrgentEmail(equipment);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

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
