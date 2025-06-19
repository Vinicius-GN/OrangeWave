/**
 * @file PriceChart.tsx
 * @brief React component that renders a price evolution chart for a given asset.
 *
 * This component fetches price snapshots from the API, filters the data based
 * on the selected timeframe, formats dates and currency values, and renders
 * an interactive line chart with custom tooltip and timeframe selection buttons.
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { usePriceSnapshots } from '@/hooks/api/usePriceSnapshots';

/**
 * @interface PriceChartProps
 * @brief Props accepted by the PriceChart component.
 *
 * @param assetId             Unique identifier of the asset for fetching snapshots.
 * @param currentPrice        The current price of the asset, displayed in the header.
 * @param priceChange         Absolute price change since the previous period.
 * @param priceChangePercent  Percentage price change over the selected timeframe.
 */
interface PriceChartProps {
  assetId: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

/**
 * @interface DataPoint
 * @brief Structure representing a single data point in the chart.
 *
 * @param timestamp      Original ISO timestamp of the snapshot.
 * @param price          Numeric price value associated with the timestamp.
 * @param formattedDate  Human-readable date string for tooltip display.
 */
interface DataPoint {
  timestamp: string;
  price: number;
  formattedDate: string;
}

/**
 * @brief Maps the UI timeframe selection to the API granularity parameter.
 *
 * @param uiTimeframe  Timeframe string selected by the user ('1H'|'1D'|'1W'|'1M'|'1Y').
 * @return 'hour'|'day'|'month'  Granularity to request from the API.
 */
const getApiTimeframe = (
  uiTimeframe: '1H' | '1D' | '1W' | '1M' | '1Y'
): 'hour' | 'day' | 'month' => {
  switch (uiTimeframe) {
    case '1H':
    case '1D':
      return 'hour';
    case '1W':
    case '1M':
      return 'day';
    case '1Y':
      return 'month';
    default:
      return 'month';
  }
};

/**
 * @brief Filters an array of snapshots to include only those within the selected timeframe.
 *
 * Calculates a cutoff date based on the timeframe and returns snapshots
 * whose timestamp is after that cutoff.
 *
 * @param data       Array of snapshot objects containing at least a `timestamp` field.
 * @param timeframe  Timeframe to filter by ('1H'|'1D'|'1W'|'1M'|'1Y').
 * @return any[]     Subset of `data` within the specified timeframe.
 */
const filterDataByTimeframe = (
  data: any[],
  timeframe: '1H' | '1D' | '1W' | '1M' | '1Y'
): any[] => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  let cutoffDate: Date;

  switch (timeframe) {
    case '1H':
      cutoffDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      break;
    case '1D':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '1W':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return data;
  }

  return data.filter((item) => new Date(item.timestamp) >= cutoffDate);
};

/**
 * @brief Component that renders the price evolution chart and summary for an asset.
 *
 * On mount, fetches price snapshots with the appropriate granularity based on
 * the selected timeframe, handles loading and error states, and displays a
 * responsive line chart with custom tooltip and timeframe toggles.
 *
 * @param props.assetId             Asset ID for API requests.
 * @param props.currentPrice        Current asset price to display.
 * @param props.priceChange         Absolute change in price.
 * @param props.priceChangePercent  Percentage change in price.
 * @return JSX.Element              Fully rendered chart component.
 */
const PriceChart = ({
  assetId,
  currentPrice,
  priceChange,
  priceChangePercent,
}: PriceChartProps) => {
  /** @brief State for the currently selected timeframe in the UI. */
  const [timeframe, setTimeframe] = useState<
    '1H' | '1D' | '1W' | '1M' | '1Y'
  >('1M');

  /** @brief Compute API granularity based on the selected timeframe. */
  const apiTimeframe = getApiTimeframe(timeframe);

  /** @brief Custom hook to fetch price snapshots from the API. */
  const { snapshots, isLoading, error } = usePriceSnapshots(
    assetId,
    apiTimeframe
  );

  /**
   * @brief Formats a numeric value into a USD currency string.
   *
   * @param value  Numeric amount to format.
   * @return string USD formatted string with two decimal places.
   */
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /** @brief Filter snapshots to only include those within the timeframe. */
  const filteredData = filterDataByTimeframe(snapshots, timeframe);

  /**
   * @brief Transform raw snapshot data into DataPoint[] for the chart.
   *
   * Each entry includes the original timestamp, price, and a formatted date.
   */
  const chartData: DataPoint[] = filteredData.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    price: snapshot.price,
    formattedDate: format(new Date(snapshot.timestamp), 'MMM dd, HH:mm'),
  }));

  /** @brief Determine if the percent price change is positive or non-negative. */
  const isPositive = priceChangePercent >= 0;

  /**
   * @brief Custom tooltip component for Recharts.
   *
   * Displays the formatted date and price when hovering over a data point.
   *
   * @param active   Boolean indicating if the tooltip is active.
   * @param payload  Array of data payloads provided by Recharts.
   * @return JSX.Element|null Rendered tooltip or null if inactive.
   */
  const CustomTooltip = ({ active, payload }: any): JSX.Element | null => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-background border border-primary/20 p-2 rounded shadow-md">
          <p className="text-sm font-medium">
            {payload[0].payload.formattedDate}
          </p>
          <p className="text-sm font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render loading indicator during data fetch
  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading price data...</p>
      </div>
    );
  }

  // Render error message if data fetch fails
  if (error) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  /** @brief Main render block when data is available. */
  return (
    <div>
      {/* Header section: current price and percent change */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Price Evolution</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{formatCurrency(currentPrice)}</span>
            <span
              className={
                isPositive ? 'text-green-500' : 'text-red-500'
              }
            >
              {isPositive ? '+' : ''}
              {priceChangePercent.toFixed(2)}% (
              {isPositive ? '+' : ''}
              {formatCurrency(priceChange)})
            </span>
          </div>
        </div>

        {/* Timeframe selection buttons */}
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

      {/* Responsive container for the line chart */}
      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              {/* Only horizontal grid lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              {/* X-Axis with dynamic tick formatting based on timeframe */}
              <XAxis
                dataKey="timestamp"
                type="category"
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  switch (timeframe) {
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
              {/* Y-Axis with currency formatting */}
              <YAxis
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                strokeOpacity={0.5}
                width={80}
              />
              {/* Custom tooltip */}
              <Tooltip content={<CustomTooltip />} />
              {/* Price line with color indicating up/down */}
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          /* Fallback when there's not enough data to display */
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Not enough data to build this chart yet.
              <br />
              <span className="text-sm">
                Try a different timeframe or check back later.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
