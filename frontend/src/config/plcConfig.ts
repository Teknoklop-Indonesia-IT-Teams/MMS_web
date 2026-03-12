import {
  Cpu,
  CircuitBoard,
  Settings,
  Server,
  Microchip,
  BrainCircuit,
  MemoryStick,
  Gpu,
} from "lucide-react";

export const PLC_CONFIG: Record<string, { icon: any; color: string }> = {
  // PLC
  Siemens: {
    icon: Cpu,
    color: "from-indigo-500 to-indigo-600",
  },
  Omron: {
    icon: Microchip,
    color: "from-green-500 to-green-600",
  },
  Mitsubishi: {
    icon: Settings,
    color: "from-red-500 to-red-600",
  },
  Schneider: {
    icon: MemoryStick,
    color: "from-purple-500 to-purple-600",
  },
  AllenBradley: {
    icon: Server,
    color: "from-orange-500 to-orange-600",
  },
  "Flexem FL7": {
    icon: CircuitBoard,
    color: "from-blue-500 to-blue-600",
  },
  "Flexem FL8": {
    icon: BrainCircuit,
    color: "from-emerald-500 to-emerald-600",
  },
  "Flexem FL6": {
    icon: Gpu,
    color: "from-amber-500 to-amber-600",
  },
  "Flexem FL5": {
    icon: CircuitBoard,
    color: "from-cyan-500 to-cyan-600",
  },
};
