
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { usePriceSnapshots } from '@/hooks/api/usePriceSnapshots';

interface PriceChartProps {
  assetId: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

interface DataPoint {
  timestamp: string;
  price: number;
  formattedDate: string;
}

const PriceChart = ({ assetId, currentPrice, priceChange, priceChangePercent }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'month'>('day');
  const { snapshots, isLoading, error } = usePriceSnapshots(assetId, timeframe);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Transform API data to chart format
  const chartData: DataPoint[] = snapshots.map(snapshot => ({
    timestamp: snapshot.timestamp,
    price: snapshot.price,
    formattedDate: format(new Date(snapshot.timestamp), 'MMM dd, HH:mm')
  }));

  // Calculate if price is up or down
  const isPositive = priceChangePercent >= 0;

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
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading price data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Price Evolution</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{formatCurrency(currentPrice)}</span>
            <span className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% ({isPositive ? '+' : ''}{formatCurrency(priceChange)})
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setTimeframe('hour')}
            variant={timeframe === 'hour' ? 'default' : 'outline'}
            size="sm"
          >
            1H
          </Button>
          <Button 
            onClick={() => setTimeframe('day')}
            variant={timeframe === 'day' ? 'default' : 'outline'}
            size="sm"
          >
            1D
          </Button>
          <Button 
            onClick={() => setTimeframe('month')}
            variant={timeframe === 'month' ? 'default' : 'outline'}
            size="sm"
          >
            1M
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
                dataKey="timestamp" 
                type="category"
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  switch(timeframe) {
                    case 'hour':
                      return format(date, 'HH:mm');
                    case 'day': 
                      return format(date, 'dd MMM');
                    case 'month':
                      return format(date, 'dd MMM');
                    default:
                      return format(date, 'dd MMM');
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
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No data available for this timeframe</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
