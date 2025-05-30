
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, subMonths, isAfter, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Button } from '@/components/ui/button';

interface PortfolioEvolutionChartProps {
  className?: string;
}

interface DataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

const PortfolioEvolutionChart = ({ className }: PortfolioEvolutionChartProps) => {
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '6m' | '1y'>('1m');
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const { user } = useAuth();
  const { getAssetsValue, transactions } = usePortfolio();

  // Generate historical data based on transactions
  useEffect(() => {
    if (!user) return;
    
    const currentValue = user.balance.wallet + getAssetsValue();
    const today = new Date();
    let startDate: Date;
    let dateStep: number;
    
    // Determine timeframe parameters
    switch (timeframe) {
      case '1w':
        startDate = subDays(today, 7);
        dateStep = 1; // 1 day step
        break;
      case '1m':
        startDate = subMonths(today, 1);
        dateStep = 2; // 2 day step
        break;
      case '6m':
        startDate = subMonths(today, 6);
        dateStep = 7; // 7 day step
        break;
      case '1y':
        startDate = subMonths(today, 12);
        dateStep = 15; // 15 day step
        break;
      default:
        startDate = subMonths(today, 1);
        dateStep = 2;
    }
    
    const data: DataPoint[] = [];
    const totalDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base value calculations - fixed to use more realistic values
    const baseValue = Math.max(currentValue * 0.8, 1000); // Start with 80% of current or minimum $1000
    
    // Capture all valid points for the time period
    const validDates: Date[] = [];
    for (let i = 0; i <= totalDays; i += dateStep) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Skip weekends for a more realistic stock portfolio simulation
      const day = currentDate.getDay();
      if (day === 0 || day === 6) continue;
      
      validDates.push(new Date(currentDate));
    }

    // Sort transactions by date (oldest first)
    const relevantTransactions = [...transactions]
      .filter(txn => isAfter(new Date(txn.timestamp), startDate))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Create data points with more realistic value progression
    let runningValue = baseValue;
    
    validDates.forEach((date, index) => {
      // Apply transactions that happened up to this date
      relevantTransactions.forEach(txn => {
        const txnDate = new Date(txn.timestamp);
        if (txnDate <= date && txnDate > (index > 0 ? validDates[index-1] : new Date(0))) {
          if (txn.type === 'deposit') {
            runningValue += txn.total;
          } else if (txn.type === 'withdrawal') {
            runningValue -= txn.total;
          }
          // Buy/sell transactions affect available cash but not total portfolio value directly
        }
      });
      
      // Add slight market movement (smaller, more realistic fluctuations)
      // Less volatile for longer timeframes
      const volatilityFactor = timeframe === '1w' ? 0.01 : 
                              timeframe === '1m' ? 0.008 : 
                              timeframe === '6m' ? 0.006 : 0.005;
                              
      const movementFactor = 1 + ((Math.random() * 2 - 1) * volatilityFactor); 
      runningValue *= movementFactor;
      
      // Add upward trend over time (average market growth)
      const growthFactor = 1 + (0.0005 * dateStep); // slight compounding growth
      runningValue *= growthFactor;
      
      // Ensure value stays positive
      runningValue = Math.max(runningValue, 100);
      
      // For the last point, match the current portfolio value exactly
      if (index === validDates.length - 1) {
        runningValue = currentValue;
      }
      
      data.push({
        date: date.toISOString(),
        value: Math.round(runningValue * 100) / 100, // Round to 2 decimal places
        formattedDate: format(date, 'MMM dd, yyyy')
      });
    });
    
    setChartData(data);
  }, [timeframe, user, getAssetsValue, transactions]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

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

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Portfolio Evolution</h3>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setTimeframe('1w')}
            className={`px-2 py-1 text-xs rounded ${timeframe === '1w' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >
            1W
          </Button>
          <Button 
            onClick={() => setTimeframe('1m')}
            className={`px-2 py-1 text-xs rounded ${timeframe === '1m' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >
            1M
          </Button>
          <Button 
            onClick={() => setTimeframe('6m')}
            className={`px-2 py-1 text-xs rounded ${timeframe === '6m' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
          >
            6M
          </Button>
          <Button 
            onClick={() => setTimeframe('1y')}
            className={`px-2 py-1 text-xs rounded ${timeframe === '1y' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}
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
                    case '1w':
                      return format(dateObj, 'EEE');
                    case '1m': 
                      return format(dateObj, 'dd MMM');
                    case '6m':
                      return format(dateObj, 'dd MMM');
                    case '1y':
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
              <ReferenceLine y={chartData[0]?.value} stroke="#888" strokeDasharray="3 3" />
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
            <p className="text-muted-foreground">Not enough data to display chart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioEvolutionChart;
