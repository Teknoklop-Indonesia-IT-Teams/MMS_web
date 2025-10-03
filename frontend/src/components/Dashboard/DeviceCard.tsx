import React from "react";
import {
  Droplets,
  Waves,
  Gauge,
  Activity,
  Mountain,
  TrendingUp,
  Cloud,
  Camera,
} from "lucide-react";

interface DeviceCardProps {
  type: string;
  count: number;
  onClick: () => void;
  isSelected?: boolean;
  hasActiveFilter?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  type,
  count,
  onClick,
  isSelected = false,
  hasActiveFilter = false,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "ARR":
        return <Droplets size={32} />;
      case "AWLR":
        return <Waves size={32} />;
      case "WQMS":
        return <Gauge size={32} />;
      case "Flow Meter":
        return <Activity size={32} />;
      case "Rembesan":
        return <Mountain size={32} />;
      case "GWL":
        return <TrendingUp size={32} />;
      case "Weather Station":
        return <Cloud size={32} />;
      case "CCTV":
        return <Camera size={32} />;
      default:
        return <Activity size={32} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "ARR":
        return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700";
      case "AWLR":
        return "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700";
      case "WQMS":
        return "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700";
      case "Flow Meter":
        return "from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700";
      case "Rembesan":
        return "from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700";
      case "GWL":
        return "from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700";
      case "Weather Station":
        return "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700";
      case "CCTV":
        return "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700";
      default:
        return "from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${getColor(
        type
      )} text-white p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:scale-105 transform ${
        isSelected
          ? "ring-4 ring-white/50 ring-offset-2 ring-offset-transparent scale-105 shadow-xl shadow-black/30"
          : ""
      } ${hasActiveFilter && !isSelected ? "opacity-50 hover:opacity-75" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1 drop-shadow-sm flex items-center">
            {type}
            {isSelected && hasActiveFilter && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                Dipilih
              </span>
            )}
          </h3>
          <p className="text-3xl font-bold drop-shadow-sm">{count}</p>
        </div>
        <div className="opacity-90 drop-shadow-sm">{getIcon(type)}</div>
      </div>
    </div>
  );
};

export default DeviceCard;
