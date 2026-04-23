import {
  Droplets,
  Waves,
  Gauge,
  Activity,
  Mountain,
  TrendingUp,
  Cloud,
  Camera,
  Antenna,
  CircuitBoard,
  Sprout,
} from "lucide-react";

export const DEVICE_CONFIG: Record<string, { icon: any; color: string }> = {
  ARR: {
    icon: Droplets,
    color: "from-blue-500 to-blue-600",
  },
  AWLR: {
    icon: Waves,
    color: "from-emerald-500 to-emerald-600",
  },
  WQMS: {
    icon: Gauge,
    color: "from-amber-500 to-amber-600",
  },
  "Flow Meter": {
    icon: Activity,
    color: "from-rose-500 to-rose-600",
  },
  Rembesan: {
    icon: Mountain,
    color: "from-cyan-500 to-cyan-600",
  },
  GWL: {
    icon: Sprout,
    color: "from-teal-500 to-teal-600",
  },
  "Weather Station": {
    icon: Cloud,
    color: "from-orange-500 to-orange-600",
  },
  CCTV: {
    icon: Camera,
    color: "from-purple-500 to-purple-600",
  },
  EWS: {
    icon: Antenna,
    color: "from-gray-500 to-gray-600",
  },
  PLC: {
    icon: CircuitBoard,
    color: "from-indigo-500 to-indigo-600",
  },
};
