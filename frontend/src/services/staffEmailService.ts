// Staff Email Service untuk mengelola email petugas testing
export interface StaffEmail {
  id: number;
  nama: string;
  email: string;
}

class StaffEmailService {
  // Data email petugas untuk testing
  private static staffEmails: StaffEmail[] = [
    { id: 2, nama: "Revan Ardian", email: "alirohman857@gmail.com" },
    { id: 3, nama: "Achmad Rofiuddin", email: "ferdiantohengky@gmail.com" },
    { id: 4, nama: "Fayyadh", email: "flwmtr01@gmail.com" },
  ];

  // Get email by staff ID
  static getEmailByStaffId(staffId: number | string): string | null {
    const id = typeof staffId === "string" ? parseInt(staffId) : staffId;
    const staff = this.staffEmails.find((s) => s.id === id);
    return staff ? staff.email : null;
  }

  // Get email by staff name
  static getEmailByStaffName(staffName: string): string | null {
    const staff = this.staffEmails.find(
      (s) =>
        s.nama.toLowerCase().includes(staffName.toLowerCase()) ||
        staffName.toLowerCase().includes(s.nama.toLowerCase())
    );
    return staff ? staff.email : null;
  }

  // Get all staff emails
  static getAllStaffEmails(): StaffEmail[] {
    return [...this.staffEmails];
  }

  // Update email for staff (untuk testing)
  static updateStaffEmail(staffId: number, newEmail: string): boolean {
    const staffIndex = this.staffEmails.findIndex((s) => s.id === staffId);
    if (staffIndex !== -1) {
      this.staffEmails[staffIndex].email = newEmail;
      return true;
    }
    return false;
  }

  // Add new staff email
  static addStaffEmail(nama: string, email: string): StaffEmail {
    const newId = Math.max(...this.staffEmails.map((s) => s.id)) + 1;
    const newStaff: StaffEmail = { id: newId, nama, email };
    this.staffEmails.push(newStaff);
    return newStaff;
  }

  // Remove staff email
  static removeStaffEmail(staffId: number): boolean {
    const initialLength = this.staffEmails.length;
    this.staffEmails = this.staffEmails.filter((s) => s.id !== staffId);
    return this.staffEmails.length < initialLength;
  }

  // Get staff info by any identifier (ID or name)
  static getStaffInfo(identifier: string | number): StaffEmail | null {
    if (typeof identifier === "number") {
      return this.staffEmails.find((s) => s.id === identifier) || null;
    }

    // Try to find by name first
    let staff = this.staffEmails.find(
      (s) =>
        s.nama.toLowerCase().includes(identifier.toLowerCase()) ||
        identifier.toLowerCase().includes(s.nama.toLowerCase())
    );

    // If not found by name, try to parse as ID
    if (!staff) {
      const id = parseInt(identifier);
      if (!isNaN(id)) {
        staff = this.staffEmails.find((s) => s.id === id);
      }
    }

    return staff || null;
  }

  // Log current configuration (untuk debugging)
  static logCurrentConfig(): void {
    this.staffEmails.forEach((staff) => {
      console.log(`  ${staff.id}. ${staff.nama}: ${staff.email}`);
    });
  }
}

export default StaffEmailService;
