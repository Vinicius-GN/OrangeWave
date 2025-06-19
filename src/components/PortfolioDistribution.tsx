/**
 * @file PortfolioDistribution.tsx
 * @brief React component that displays portfolio distribution in a pie chart.
 *
 * This component uses Recharts to render a responsive pie chart showing
 * how the total portfolio value is split across different categories.
 * If the data array is empty or all category values are zero, it will
 * render a message indicating that no data is available to display.
 *
 * Key features:
 *  - Responsive container for automatic sizing
 *  - Pie chart with configurable inner and outer radii
 *  - Labels displaying category name and percentage share
 *  - Cyclic color assignment from a provided palette
 *  - Tooltip showing formatted USD values on hover
 *  - Fallback UI for empty or zero-valued data sets
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

/**
 * @interface PortfolioDistributionProps
 * @brief Props for the PortfolioDistribution component.
 *
 * @param data     Array of objects representing portfolio categories:
 *                 - name: the category name (e.g., "Stocks", "Crypto")
 *                 - value: numeric value associated with that category
 * @param colors?  Optional array of hex color strings to apply to each slice.
 *                 Defaults to DEFAULT_COLORS if not provided.
 */
interface PortfolioDistributionProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
}

/**
 * @brief Default color palette for pie chart slices.
 *
 * These colors will be applied in order to each slice, wrapping around
 * if there are more slices than colors.
 */
const DEFAULT_COLORS = ['#FF7700', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * @brief Component rendering the portfolio distribution as a pie chart.
 *
 * - Checks if `data` is undefined, empty, or all values are zero.
 * - Shows a "No data to display" message if no valid data exists.
 * - Otherwise, renders a ResponsiveContainer holding a PieChart.
 * - Pie is configured with:
 *    - cx/cy: center coordinates as percentages
 *    - innerRadius / outerRadius: slice thickness
 *    - paddingAngle: spacing between slices
 *    - dataKey="value": mapping numeric values
 *    - label: function combining category name and percentage
 * - Each data entry maps to a Cell with a color from `colors`.
 * - Tooltip is configured to format values as USD currency.
 *
 * @param props.data     Array of category objects to plot.
 * @param props.colors?  Optional override for slice colors.
 * @returns JSX.Element  Either the pie chart or a "no data" message.
 */
const PortfolioDistribution = ({
  data,
  colors = DEFAULT_COLORS,
}: PortfolioDistributionProps) => {
  /**
   * @brief Determines if there is no valid data to display.
   *
   * Returns true when:
   *  - `data` is undefined or has zero length
   *  - every item in `data` has `value === 0`
   * This avoids rendering a meaningless empty chart.
   */
  const hasNoData =
    !data || data.length === 0 || data.every((item) => item.value === 0);

  // If no valid data, render a placeholder message instead of the chart
  if (hasNoData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No data to display</p>
      </div>
    );
  }

  /**
   * @brief Renders the pie chart with the provided data and colors.
   *
   * ResponsiveContainer ensures the chart fits its parent dimensions.
   * PieChart houses a Pie component configured for our use case.
   * Cells are individually colored, and Tooltip is attached
   * to show detailed USD-formatted values on hover.
   */
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}                           // Data array for slices
          cx="50%"                              // Center x at 50% of container
          cy="50%"                              // Center y at 50% of container
          innerRadius={60}                      // Radius of inner blank circle
          outerRadius={80}                      // Radius of full pie
          paddingAngle={5}                      // Space between slices
          dataKey="value"                       // Field name for slice values
          label={({ name, percent }) =>        // Label callback showing name and percent
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}             // Unique key per cell
              fill={colors[index % colors.length]} // Cycle through colors array
            />
          ))}
        </Pie>
        {/* Tooltip that formats the hovered value as USD */}
        <Tooltip
          formatter={(value: number) => [
            `$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,                                 // Formatted value string
            'Value',                              // Label in tooltip
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioDistribution;
