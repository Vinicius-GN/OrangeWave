
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface PortfolioDistributionProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
}

const DEFAULT_COLORS = ['#FF7700', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PortfolioDistribution = ({ 
  data, 
  colors = DEFAULT_COLORS 
}: PortfolioDistributionProps) => {
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [
            `$${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`, 
            'Value'
          ]} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioDistribution;
