export interface User {
  id: number;
  nama: string;
  role: string;
  username: string;
  email?: string;
  telp?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Equipment {
  id: number;
  nama: string;
  lokasi: string;
  jenis: string;
  instalasi: string;
  garansi: string;
  remot: string;
  status: string;
  device: string;
  sensor: string;
  pelanggan: string;
  pic: string;
  email?: string;
  i_alat?: string;
  keterangan?: string;
  // Maintenance fields
  maintenanceDate?: string;
  maintenanceInterval?: number;
  isMaintenanceActive?: boolean | number; // Can be 0/1 from database or true/false
  maintenanceDaysLeft?: number | null;
  maintenanceStatus?:
    | "active"
    | "inactive"
    | "selesai"
    | "overdue"
    | "urgent"
    | "needed"
    | "good";
  maintenanceAlertLevel?:
    | "green"
    | "yellow"
    | "red"
    | "blue"
    | "none"
    | "urgent"
    | "warning"
    | "good";
  maintenanceStatusText?: string;
  nextMaintenanceDate?: string;
}

export interface Record {
  id: number;
  deskripsi: string;
  awal: string;
  tindakan: string;
  tambahan: string;
  akhir: string;
  berikutnya: string;
  keterangan: string;
  petugas: string;
  i_panel?: string | null;
  i_alat?: string | null;
  i_sensor?: string | null;
  id_m_alat: number;
  tanggal: string;
}

export interface DashboardStats {
  totalEquipment: number;
  equipmentByType: { [key: string]: number };
  activeEquipment: number;
  warrantyExpiring: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: string;
}

export interface Staff {
  userId: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  mobile?: string;
}
