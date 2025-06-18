/**
 * Orders Page Component
 * 
 * This component displays a comprehensive history of user's trading orders in the OrangeWave
 * trading platform. It provides detailed information about buy/sell transactions, order status,
 * and allows users to track their trading activity over time.
 * 
 * Features:
 * - Complete order history display with chronological sorting
 * - Order type indicators (buy/sell) with color coding
 * - Detailed order information (asset, quantity, price, total, date)
 * - Order status tracking and visual indicators
 * - Responsive card-based layout for better mobile experience
 * - Integration with orders API hook for real-time data
 * - Loading states and error handling
 * - Direct links to asset detail pages for further analysis
 */

// shadcn/ui components for consistent styling and functionality
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Layout and navigation components
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

// Custom hooks for orders data management
import { useOrders } from '@/hooks/api/useOrders';

// UI icons from Lucide React
import { ExternalLink } from 'lucide-react';

/**
 * Orders Component
 * 
 * Main orders history component that handles:
 * - Order data fetching and state management
 * - Order display with detailed information
 * - Visual formatting and status indicators
 * - Loading and error state handling
 * - Navigation to related asset pages
 * 
 * @returns JSX.Element - The complete orders history interface
 */
const Orders = () => {
  // Custom hook for orders data management with loading and error states
  const { orders, isLoading, error } = useOrders();

  /**
   * Date formatting utility
   * 
   * Formats ISO date strings into user-friendly display format
   * with both date and time information for order timestamps.
   * 
   * @param dateString - ISO date string from order data
   * @returns Formatted date string for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Order type color scheme utility
   * 
   * Returns appropriate CSS classes for styling order type badges
   * based on the transaction type (buy/sell) for visual distinction.
   * 
   * @param type - Order type ('buy' or 'sell')
   * @returns CSS class string for badge styling
   */
  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-200'; // Green for buy orders
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-200'; // Red for sell orders
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'; // Default gray
    }
  };

  // Loading state with user feedback
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  // Error state with user-friendly error message
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading orders: {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page header with title and description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-muted-foreground">
            View your trading order history and status
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Your trading orders will appear here once you start trading.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Orders list display with detailed information
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`border ${getOrderTypeColor(order.side)} font-medium`}>
                        {order.side.toUpperCase()}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">
                          {order.assetName || order.symbol}
                        </CardTitle>
                        <CardDescription>
                          Order #{order._id.slice(-8)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/asset/${order.assetId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Asset
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                    
                    {/* Order price per unit */}
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">${order.price.toFixed(2)}</p>
                    </div>
                    
                    {/* Total order value */}
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                    </div>
                    
                    {/* Order status indicator */}
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(order.createdAt || order.timestamp)}</p>
                    </div>
                  </div>
                  {order.fees && order.fees > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fees:</span>
                        <span className="font-medium">${order.fees.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
