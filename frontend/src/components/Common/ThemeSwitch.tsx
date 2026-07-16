import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        isDark ? "bg-gray-700" : "bg-blue-100"
      }`}
    >
      <Sun
        size={18}
        className={`absolute text-amber-500 transition-all duration-500 ease-in-out ${
          isDark
            ? "rotate-180 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        size={18}
        className={`absolute text-indigo-300 transition-all duration-500 ease-in-out ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-180 scale-0 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeSwitch;
