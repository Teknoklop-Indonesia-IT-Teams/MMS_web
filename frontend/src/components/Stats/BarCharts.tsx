// StatusBarChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatusChartItem {
  name: string;
  value: number;
}

interface BarChartProps {
  statusChartData: StatusChartItem[];
  colors?: string[]; // Ubah menjadi array
}

const StatusBarChart: React.FC<BarChartProps> = ({
  statusChartData,
  colors = ["#f87171", "#fb923c", "#fbbf24", "#60a5fa"], // Default colors
}) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={statusChartData}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value">
          {statusChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatusBarChart;
