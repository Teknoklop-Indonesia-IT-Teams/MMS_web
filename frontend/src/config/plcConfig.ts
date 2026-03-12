import { Cpu, CircuitBoard, Settings, Server } from "lucide-react";

export const PLC_CONFIG: Record<string, { icon: any; color: string }> = {
  // PLC
  Siemens: {
    icon: Cpu,
    color: "from-indigo-500 to-indigo-600",
  },
  Omron: {
    icon: CircuitBoard,
    color: "from-green-500 to-green-600",
  },
  Mitsubishi: {
    icon: Settings,
    color: "from-red-500 to-red-600",
  },
  Schneider: {
    icon: Settings,
    color: "from-purple-500 to-purple-600",
  },
  AllenBradley: {
    icon: Server,
    color: "from-orange-500 to-orange-600",
  },
};
