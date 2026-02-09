import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface LocationPieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#ef4444"];

const LocationPieChart: React.FC<LocationPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center">Tidak ada data lokasi</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LocationPieChart;
