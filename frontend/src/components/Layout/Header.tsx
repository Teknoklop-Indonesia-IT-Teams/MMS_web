import React, { useState, useEffect, useRef } from "react";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "../Common/ThemeToggle";
import { useAuth } from "../../hooks/useAuthSimple";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logout();
      } catch (error) {
        console.error("❌ Header: Logout failed:", error);
        // Force reload as fallback
        window.location.href = "/login";
      }
    }
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "supervisor":
        return "bg-blue-500 text-white";
      case "operator":
        return "bg-green-500 text-white";
      case "maintenance":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <header className="text-white transition-colors duration-200 bg-blue-500 shadow-md dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="p-1 transition-colors rounded-md lg:hidden hover:bg-blue-600 dark:hover:bg-gray-700"
          >
            <Menu size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-base font-semibold sm:text-xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* User Info and Menu */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center px-3 py-2 space-x-2 transition-colors bg-blue-600 rounded-lg dark:bg-gray-800 hover:bg-blue-700 dark:hover:bg-gray-700"
              >
                <div className="p-1 bg-white rounded-full">
                  <User size={16} className="text-blue-500" />
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium">{user.nama}</div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Debug indicator */}
              {showUserMenu && (
                <div className="absolute right-0 p-1 mt-1 text-xs text-black bg-yellow-200 rounded">
                  Dropdown should be visible
                </div>
              )}

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-h-[100px]">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nama}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.username}
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      data-testid="logout-button"
                      className="flex items-center w-full px-3 py-2 space-x-2 text-sm text-left text-red-600 rounded-md dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold sm:text-lg">MMS Trial</div>
          </div>
        </div>
      </div>

      {subtitle && (
        <div className="px-4 py-2 transition-colors duration-200 bg-blue-600 dark:bg-gray-800 sm:px-6">
          <span className="text-sm text-blue-100 dark:text-gray-300 sm:text-base">
            {subtitle}
          </span>
        </div>
      )}
    </header>
  );
};

export default Header;
