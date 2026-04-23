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
  colors?: string[]; 
}

const statusColors = [
  "#ef4444", 
  "#f59e0b", 
  "#22c55e", 
  "#3b82f6",
  "#6b7280",
];

const StatusBarChart: React.FC<BarChartProps> = ({
  statusChartData,
  colors = statusColors,
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
