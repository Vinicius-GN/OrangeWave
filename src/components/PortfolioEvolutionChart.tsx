
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { usePortfolioHistory } from '@/hooks/api/usePortfolioHistory';

interface PortfolioEvolutionChartProps {
  className?: string;
}

interface DataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

const PortfolioEvolutionChart = ({ className }: PortfolioEvolutionChartProps) => {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '6M' | '1Y'>('1M');
  const { history, isLoading, error } = usePortfolioHistory(timeframe);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Transform API data to chart format
  const chartData: DataPoint[] = history.map(item => ({
    date: item.date,
    value: item.totalValue,
    formattedDate: format(new Date(item.date), 'MMM dd, yyyy')
  }));

  // Calculate if portfolio is up or down
  const isPositive = chartData.length >= 2 && 
    chartData[chartData.length - 1].value >= chartData[0].value;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-background border border-primary/20 p-2 rounded shadow-md">
          <p className="text-sm font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-sm font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="h-[300px] w-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading portfolio history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="h-[300px] w-full flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Portfolio Evolution</h3>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setTimeframe('1W')}
            variant={timeframe === '1W' ? 'default' : 'outline'}
            size="sm"
          >
            1W
          </Button>
          <Button 
            onClick={() => setTimeframe('1M')}
            variant={timeframe === '1M' ? 'default' : 'outline'}
            size="sm"
          >
            1M
          </Button>
          <Button 
            onClick={() => setTimeframe('6M')}
            variant={timeframe === '6M' ? 'default' : 'outline'}
            size="sm"
          >
            6M
          </Button>
          <Button 
            onClick={() => setTimeframe('1Y')}
            variant={timeframe === '1Y' ? 'default' : 'outline'}
            size="sm"
          >
            1Y
          </Button>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
              <XAxis 
                dataKey="date" 
                type="category"
                tickFormatter={(date) => {
                  const dateObj = new Date(date);
                  switch(timeframe) {
                    case '1W':
                      return format(dateObj, 'EEE');
                    case '1M': 
                      return format(dateObj, 'dd MMM');
                    case '6M':
                      return format(dateObj, 'dd MMM');
                    case '1Y':
                      return format(dateObj, 'MMM yyyy');
                    default:
                      return format(dateObj, 'dd MMM');
                  }
                }}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                strokeOpacity={0.5}
                minTickGap={30}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                strokeOpacity={0.5}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartData[0] && (
                <ReferenceLine y={chartData[0].value} stroke="#888" strokeDasharray="3 3" />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Insufficient data to display portfolio evolution</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioEvolutionChart;
