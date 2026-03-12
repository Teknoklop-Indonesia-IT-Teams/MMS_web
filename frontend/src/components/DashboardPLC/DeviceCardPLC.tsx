import React from "react";
import { Activity } from "lucide-react";
import { PLC_CONFIG } from "../../config/plcConfig";

interface DeviceCardPLCProps {
  type: string;
  count: number;
  onClick: () => void;
  isSelected?: boolean;
  hasActiveFilter?: boolean;
}

const DeviceCardPLC: React.FC<DeviceCardPLCProps> = ({
  type,
  count,
  onClick,
  isSelected = false,
  hasActiveFilter = false,
}) => {
  const config = PLC_CONFIG[type];

  const IconComponent = config?.icon || Activity;

  const color =
    config?.color ||
    "from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700";

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${color} text-white p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected
          ? "ring-4 ring-white/50 ring-offset-2 ring-offset-transparent scale-105"
          : ""
      } ${hasActiveFilter && !isSelected ? "opacity-50 hover:opacity-75" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center mb-1 text-lg font-semibold">
            {type}
            {isSelected && hasActiveFilter && (
              <span className="px-2 py-1 ml-2 text-xs font-medium rounded-full bg-white/20">
                Dipilih
              </span>
            )}
          </h3>

          <p className="text-3xl font-bold">{count}</p>
        </div>

        <div className="opacity-90">
          <IconComponent size={32} />
        </div>
      </div>
    </div>
  );
};

export default DeviceCardPLC;
