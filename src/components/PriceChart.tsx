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

// Map UI timeframes to appropriate API granularity levels
const getApiTimeframe = (uiTimeframe: '1H' | '1D' | '1W' | '1M' | '1Y'): 'hour' | 'day' | 'month' => {
  switch (uiTimeframe) {
    case '1H':
    case '1D':
      return 'hour'; // High granularity for short periods
    case '1W':
    case '1M':
      return 'day'; // Daily granularity for medium periods
    case '1Y':
      return 'month'; // Monthly granularity for long periods
    default:
      return 'month';
  }
};

// Filter data based on UI timeframe
const filterDataByTimeframe = (data: any[], timeframe: '1H' | '1D' | '1W' | '1M' | '1Y') => {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  let cutoffDate: Date;
  
  // Calculate cutoff date based on selected timeframe
  switch (timeframe) {
    case '1H':
      cutoffDate = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago
      break;
    case '1D':
      cutoffDate = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
      break;
    case '1W':
      cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
      break;
    case '1M':
      cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
      break;
    case '1Y':
      cutoffDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 365 days ago
      break;
    default:
      return data;
  }
  
  return data.filter(item => new Date(item.timestamp) >= cutoffDate);
};

// PriceChart component displays the price evolution chart and summary for a given asset
const PriceChart = ({ assetId, currentPrice, priceChange, priceChangePercent }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1M');
  const apiTimeframe = getApiTimeframe(timeframe);
  const { snapshots, isLoading, error } = usePriceSnapshots(assetId, apiTimeframe);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Transform and filter API data for chart visualization
  const filteredData = filterDataByTimeframe(snapshots, timeframe);
  const chartData: DataPoint[] = filteredData.map(snapshot => ({
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

  // Show loading state while fetching price data
  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading price data...</p>
      </div>
    );
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Main render: price summary and chart
  return (
    <div>
      {/* Header with current price and price change */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Price Evolution</h3>
          <div className="flex items-center gap-2 text-sm">
            {/* Current price */}
            <span className="font-medium">{formatCurrency(currentPrice)}</span>
            {/* Price change percent and value, colored by direction */}
            <span className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% ({isPositive ? '+' : ''}{formatCurrency(priceChange)})
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setTimeframe('1M')}
            variant={timeframe === '1M' ? 'default' : 'outline'}
            size="sm"
          >
            1M
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
                dataKey="timestamp" 
                type="category"
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  switch(timeframe) {
                    case '1H':
                    case '1D':
                      return format(date, 'HH:mm');
                    case '1W':
                    case '1M': 
                      return format(date, 'dd MMM');
                    case '1Y':
                      return format(date, 'MMM yyyy');
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
            <p className="text-muted-foreground text-center">
              Not enough data to build this chart yet.<br />
              <span className="text-sm">Try a different timeframe or check back later.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;