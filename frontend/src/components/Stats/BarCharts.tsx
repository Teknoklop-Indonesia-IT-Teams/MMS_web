import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatusChartItem {
  name: string;
  value: number;
}

interface BarChartProps {
  statusChartData: StatusChartItem[];
}

const StatusBarChart: React.FC<BarChartProps> = ({ statusChartData }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={statusChartData}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatusBarChart;
