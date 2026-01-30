import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, Database, X } from "lucide-react";
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

  return (
    <div className="flex flex-col w-64 min-h-screen text-white bg-gray-800 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-4 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400 dark:text-gray-300">
            MAIN NAVIGATION
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Dashboard - All roles */}
          <RoleBasedContent allowedRoles={PERMISSIONS.DASHBOARD_VIEW}>
            <li>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Home size={20} />
                <span className="text-sm sm:text-base">Dashboard</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          {/* Equipment - All roles can view, but with different permissions */}
          <RoleBasedContent allowedRoles={PERMISSIONS.EQUIPMENT_VIEW}>
            <li>
              <NavLink
                to="/telemetri"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Database size={20} />
                <span className="text-sm sm:text-base">List Telemetri</span>
              </NavLink>
            </li>
          </RoleBasedContent>

          {/* Staff Management - Admin and Supervisor only */}
          <RoleBasedContent allowedRoles={PERMISSIONS.STAFF_VIEW}>
            <li>
              <NavLink
                to="/petugas"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Users size={20} />
                <span className="text-sm sm:text-base">Petugas</span>
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
              <div className="text-white font-medium">{user.nama}</div>
              {/* <div className="text-gray-400 text-xs">{user.username}</div> */}
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
