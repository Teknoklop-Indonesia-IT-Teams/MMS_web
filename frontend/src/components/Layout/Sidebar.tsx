import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Database,
  X,
  LayoutList,
  Cpu,
  Monitor,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuthSimple";
import RoleBasedContent from "../Auth/RoleBasedContent";
import { PERMISSIONS } from "../../constants/roles";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "manager":
        return "bg-blue-500 text-white";
      case "engineer":
        return "bg-green-500 text-white";
      case "ast_manager":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 dark:bg-blue-700 text-white"
        : "text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex flex-col w-64 min-h-screen text-white transition-colors duration-200 bg-gray-800 dark:bg-gray-900">
      <div className="p-4 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400 dark:text-gray-300">
            MAIN NAVIGATION
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 transition-colors rounded-md lg:hidden hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Dashboard */}
          <RoleBasedContent allowedRoles={PERMISSIONS.DASHBOARD_VIEW}>
            <li>
              <NavLink
                to="/dashboard-telemetry"
                onClick={onClose}
                className={navLinkClass}
              >
                <Home size={20} />
                <span className="text-sm sm:text-base">
                  Dashboard Telemetry
                </span>
              </NavLink>
            </li>
          </RoleBasedContent>

          <RoleBasedContent allowedRoles={PERMISSIONS.DASHBOARD_VIEW}>
            <li>
              <NavLink
                to="/dashboard-plc"
                onClick={onClose}
                className={navLinkClass}
              >
                <Monitor size={20} />
                <span className="text-sm sm:text-base">Dashboard PLC</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          {/* List Telemetri */}
          <RoleBasedContent allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
            <li>
              <NavLink
                to="/telemetri"
                onClick={onClose}
                className={navLinkClass}
              >
                <Database size={20} />
                <span className="text-sm sm:text-base">List Telemetri</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          <RoleBasedContent allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
            <li>
              <NavLink to="/plc" onClick={onClose} className={navLinkClass}>
                <Cpu size={20} />
                <span className="text-sm sm:text-base">List PLC</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          {/* Petugas */}
          <RoleBasedContent allowedRoles={PERMISSIONS.STAFF_VIEW}>
            <li>
              <NavLink to="/petugas" onClick={onClose} className={navLinkClass}>
                <Users size={20} />
                <span className="text-sm sm:text-base">Petugas</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          {/* ✅ Master Data - admin only */}
          <RoleBasedContent allowedRoles={PERMISSIONS.STAFF_VIEW}>
            <li>
              <NavLink
                to="/master-data"
                onClick={onClose}
                className={navLinkClass}
              >
                <LayoutList size={20} />
                <span className="text-sm sm:text-base">Master Data</span>
              </NavLink>
            </li>
          </RoleBasedContent>
        </ul>
      </nav>

      {/* User Info Footer */}
      {user && (
        <NavLink to="/profile">
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm">
              <div className="font-medium text-white">{user.nama}</div>
              <div
                className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getRoleBadgeColor(
                  user.role,
                )}`}
              >
                {user.role}
              </div>
            </div>
          </div>
        </NavLink>
      )}
    </div>
  );
};

export default Sidebar;
