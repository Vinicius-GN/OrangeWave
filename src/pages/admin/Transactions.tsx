import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Download } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

interface Order {
  _id: string;
  userId: string;
  side: 'buy' | 'sell';
  assetId: string;
  assetName: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  total: number;
  fees: number;
  status: string;
  timestamp: string;
}

const TransactionsManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const orderData = await response.json();
        setOrders(Array.isArray(orderData) ? orderData : []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sideFilter !== 'all') {
      filtered = filtered.filter(order => order.side === sideFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, sideFilter, statusFilter, orders]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const exportToCsv = () => {
    const headers = ['Order ID', 'User ID', 'Asset', 'Symbol', 'Side', 'Quantity', 'Price', 'Total', 'Fees', 'Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order._id,
        order.userId,
        order.assetName,
        order.symbol,
        order.side,
        order.quantity,
        order.price,
        order.total,
        order.fees,
        order.status,
        order.timestamp
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: `${filteredOrders.length} transactions exported to CSV.`,
    });
  };

  return (
    <AdminLayout title="Transactions" description="View and manage all platform transactions">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sideFilter} onValueChange={setSideFilter}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" onClick={exportToCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Transactions</div>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Volume</div>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.total, 0))}
            </div>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Fees</div>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, order) => sum + order.fees, 0))}
            </div>
          </div>
        </div>
      )}
      
      {/* Orders table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={9} className="h-14">
                    <div className="w-full h-4 bg-secondary/50 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.assetName}</div>
                      <div className="text-sm text-muted-foreground">{order.symbol}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{order.userId}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                      {order.side.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'completed' ? 'default' : 
                      order.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.timestamp)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/asset/${order.assetId}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Asset
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </AdminLayout>
  );
};

export default TransactionsManagement;
