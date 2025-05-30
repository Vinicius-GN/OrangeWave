import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricePoint, getPriceHistory } from '@/services/marketService';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  assetId: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

const PriceChart = ({ assetId, currentPrice, priceChange, priceChangePercent }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPriceHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getPriceHistory(assetId, timeframe);
        
        // Ensure proper sequential timestamps for uniform spacing
        if (data.length > 0) {
          const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
          
          // Ensure uniform time intervals
          if (timeframe === 'day' || timeframe === 'week') {
            // For day/week, use hourly intervals
            const start = new Date(sortedData[0].timestamp);
            const end = new Date(sortedData[sortedData.length - 1].timestamp);
            const hourlyData: PricePoint[] = [];
            
            let currentTime = start;
            while (currentTime <= end) {
              // Find the closest data point
              const closest = sortedData.reduce((prev, curr) => {
                const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - currentTime.getTime());
                const currDiff = Math.abs(new Date(curr.timestamp).getTime() - currentTime.getTime());
                return prevDiff < currDiff ? prev : curr;
              });
              
              hourlyData.push({
                timestamp: currentTime.getTime(),
                price: closest.price
              });
              
              // Move to next hour/interval
              const intervalHours = timeframe === 'day' ? 1 : 6;
              currentTime = new Date(currentTime.getTime() + (intervalHours * 60 * 60 * 1000));
            }
            
            setPriceData(hourlyData);
          } else if (timeframe === 'month') {
            // For month, use daily intervals
            const start = new Date(sortedData[0].timestamp);
            const end = new Date(sortedData[sortedData.length - 1].timestamp);
            const dailyData: PricePoint[] = [];
            
            let currentDate = new Date(start);
            currentDate.setHours(0, 0, 0, 0);
            
            while (currentDate <= end) {
              // Find the closest data point
              const closest = sortedData.reduce((prev, curr) => {
                const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - currentDate.getTime());
                const currDiff = Math.abs(new Date(curr.timestamp).getTime() - currentDate.getTime());
                return prevDiff < currDiff ? prev : curr;
              });
              
              dailyData.push({
                timestamp: currentDate.getTime(),
                price: closest.price
              });
              
              // Move to next day
              currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
            }
            
            setPriceData(dailyData);
          } else {
            // For year, use weekly or monthly intervals
            setPriceData(sortedData);
          }
        } else {
          setPriceData(data);
        }
      } catch (error) {
        console.error('Failed to load price history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPriceHistory();
  }, [assetId, timeframe]);
  
  const isPositive = priceChange >= 0;
  
  // Format price data for chart - Fix date formatting
  const formattedData = priceData.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
    date: format(new Date(point.timestamp), 'MMM dd, yyyy'),
    time: format(new Date(point.timestamp), 'HH:mm'),
  }));
  
  // Format tooltip value
  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{data.date}</p>
          <p className="text-xs text-muted-foreground">{data.time}</p>
          <p className="text-sm font-semibold text-foreground">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Calculate min and max values for Y axis
  const prices = priceData.map(d => d.price);
  const minPrice = prices.length ? Math.min(...prices) * 0.995 : 0; // Add 0.5% padding
  const maxPrice = prices.length ? Math.max(...prices) * 1.005 : 0; // Add 0.5% padding

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
          <div className="text-2xl font-bold">
            ${currentPrice.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
          <div className="flex items-center mt-1">
            <Badge variant={isPositive ? "default" : "destructive"} className={cn(
              isPositive ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-red-500/20 text-red-500 hover:bg-red-500/30",
              "rounded-md font-medium"
            )}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </Badge>
            <span className="text-xs ml-2 text-muted-foreground">
              Last updated {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <Tabs defaultValue={timeframe} className="w-full md:w-auto" onValueChange={(value) => setTimeframe(value as any)}>
          <TabsList className="grid grid-cols-4 w-full md:w-[300px]">
            <TabsTrigger value="day">1D</TabsTrigger>
            <TabsTrigger value="week">1W</TabsTrigger>
            <TabsTrigger value="month">1M</TabsTrigger>
            <TabsTrigger value="year">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="w-full h-[300px] mt-2">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-card/50 rounded-lg">
            <div className="animate-pulse">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                domain={['dataMin', 'dataMax']}
                scale="time"
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  if (timeframe === 'day') {
                    return format(date, 'HH:mm');
                  } else if (timeframe === 'week') {
                    return format(date, 'EEE');
                  } else if (timeframe === 'month') {
                    return format(date, 'dd MMM');
                  } else if (timeframe === 'year') {
                    return format(date, 'MMM');
                  }
                  return '';
                }}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                strokeOpacity={0.5}
                fontSize={12}
                minTickGap={30}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                tickFormatter={formatTooltipValue}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                strokeOpacity={0.5}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#22c55e" : "#ef4444"} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: isPositive ? "#22c55e" : "#ef4444", strokeWidth: 2, fill: "#000" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
