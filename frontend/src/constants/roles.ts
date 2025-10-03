/**
 * Role definitions for the MMS system
 */
export const ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  OPERATOR: "operator",
  MAINTENANCE: "maintenance",
} as const;

/**
 * Permission sets for different parts of the application
 */
export const PERMISSIONS = {
  // Dashboard access - All roles can view
  DASHBOARD_VIEW: [
    ROLES.ADMIN,
    ROLES.SUPERVISOR,
    ROLES.OPERATOR,
    ROLES.MAINTENANCE,
  ],
  DASHBOARD_FULL_ACCESS: [ROLES.ADMIN, ROLES.SUPERVISOR],
  DASHBOARD_READ_ONLY: [ROLES.OPERATOR, ROLES.MAINTENANCE],

  // Equipment management - All roles can view, but edit restrictions apply
  EQUIPMENT_VIEW: [
    ROLES.ADMIN,
    ROLES.SUPERVISOR,
    ROLES.OPERATOR,
    ROLES.MAINTENANCE,
  ],
  EQUIPMENT_CREATE: [ROLES.ADMIN, ROLES.SUPERVISOR],
  EQUIPMENT_EDIT: [ROLES.ADMIN, ROLES.SUPERVISOR],
  EQUIPMENT_DELETE: [ROLES.ADMIN, ROLES.SUPERVISOR],
  // Special permission for adding descriptions in telemetri
  EQUIPMENT_ADD_DESCRIPTION: [
    ROLES.ADMIN,
    ROLES.SUPERVISOR,
    ROLES.OPERATOR,
    ROLES.MAINTENANCE,
  ],

  // Staff management - Only admin and supervisor can access
  STAFF_VIEW: [ROLES.ADMIN, ROLES.SUPERVISOR],
  STAFF_CREATE: [ROLES.ADMIN],
  STAFF_EDIT: [ROLES.ADMIN, ROLES.SUPERVISOR],
  STAFF_DELETE: [ROLES.ADMIN],

  // Email notifications
  EMAIL_SETTINGS: [ROLES.ADMIN, ROLES.SUPERVISOR],

  // Reports
  REPORTS_VIEW: [ROLES.ADMIN, ROLES.SUPERVISOR],

  // System settings
  SYSTEM_SETTINGS: [ROLES.ADMIN, ROLES.SUPERVISOR],
} as const;
