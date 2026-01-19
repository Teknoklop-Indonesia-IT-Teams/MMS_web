/**
 * Role definitions for the MMS system
 */
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  AST_MANAGER: "ast_manager",
  ENGINEER: "engineer",
} as const;

/**
 * Permission sets for different parts of the application
 */
export const PERMISSIONS = {
  // Dashboard access - All roles can view
  DASHBOARD_VIEW: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  DASHBOARD_FULL_ACCESS: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  // DASHBOARD_READ_ONLY: [ROLES.AST_MANAGER, ROLES.ENGINEER],

  // Equipment management - All roles can view, but edit restrictions apply
  EQUIPMENT_VIEW: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  EQUIPMENT_CREATE: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  EQUIPMENT_EDIT: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  EQUIPMENT_DELETE: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],
  // Special permission for adding descriptions in telemetri
  EQUIPMENT_ADD_DESCRIPTION: [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.AST_MANAGER,
    ROLES.ENGINEER,
  ],

  // Staff management - Only admin and supervisor can access
  STAFF_VIEW: [ROLES.ADMIN, ROLES.MANAGER],
  STAFF_CREATE: [ROLES.ADMIN, ROLES.MANAGER],
  STAFF_EDIT: [ROLES.ADMIN, ROLES.MANAGER],
  STAFF_DELETE: [ROLES.ADMIN, ROLES.MANAGER],

  // Email notifications
  EMAIL_SETTINGS: [ROLES.ADMIN, ROLES.MANAGER],

  // Reports
  REPORTS_VIEW: [ROLES.ADMIN, ROLES.MANAGER],

  // System settings
  SYSTEM_SETTINGS: [ROLES.ADMIN, ROLES.MANAGER],
} as const;
