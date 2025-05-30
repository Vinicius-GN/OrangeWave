import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, ArrowUpDown, Trash2, Clock, User
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// Define cart item interface
interface CartItem {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  addedAt: number;
}

// Define cart interface
interface Cart {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  createdAt: number;
  expiresAt: number;
  totalValue: number;
}

// Mock function to get active carts
const getActiveCarts = async (): Promise<Cart[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // This would be an API call in a real app
  return [
    {
      id: 'cart-1',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      items: [
        {
          id: 'cart-item-1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 2,
          price: 185.92,
          addedAt: Date.now() - 3 * 60 * 1000 // 3 minutes ago
        },
        {
          id: 'cart-item-2',
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          quantity: 1,
          price: 414.28,
          addedAt: Date.now() - 5 * 60 * 1000 // 5 minutes ago
        }
      ],
      createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
      totalValue: 2 * 185.92 + 1 * 414.28
    },
    {
      id: 'cart-2',
      userId: 'user-2',
      userName: 'Jane Doe',
      userEmail: 'jane@example.com',
      items: [
        {
          id: 'cart-item-3',
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 0.05,
          price: 68211.35,
          addedAt: Date.now() - 12 * 60 * 1000 // 12 minutes ago
        }
      ],
      createdAt: Date.now() - 12 * 60 * 1000, // 12 minutes ago
      expiresAt: Date.now() + 3 * 60 * 1000, // 3 minutes from now
      totalValue: 0.05 * 68211.35
    },
    {
      id: 'cart-3',
      userId: 'user-3',
      userName: 'Robert Johnson',
      userEmail: 'robert@example.com',
      items: [
        {
          id: 'cart-item-4',
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 3,
          price: 152.42,
          addedAt: Date.now() - 2 * 60 * 1000 // 2 minutes ago
        },
        {
          id: 'cart-item-5',
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          quantity: 1,
          price: 1013.39,
          addedAt: Date.now() - 4 * 60 * 1000 // 4 minutes ago
        }
      ],
      createdAt: Date.now() - 4 * 60 * 1000, // 4 minutes ago
      expiresAt: Date.now() + 11 * 60 * 1000, // 11 minutes from now
      totalValue: 3 * 152.42 + 1 * 1013.39
    }
  ];
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Convert milliseconds to minutes:seconds format
const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Calculate percentage of time elapsed
const calculateTimePercentage = (createdAt: number, expiresAt: number): number => {
  const totalDuration = expiresAt - createdAt;
  const elapsed = Date.now() - createdAt;
  const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  return Math.round(percentage);
};

// Check if cart is about to expire (< 3 minutes left)
const isNearExpiry = (expiresAt: number): boolean => {
  const timeRemaining = expiresAt - Date.now();
  return timeRemaining > 0 && timeRemaining < 3 * 60 * 1000; // Less than 3 minutes
};

// Check if cart has expired
const hasExpired = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt;
};

const ActiveCartsPage = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [filteredCarts, setFilteredCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<keyof Cart>('expiresAt');
  const [releaseCartId, setReleaseCartId] = useState<string | null>(null);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [cartDetails, setCartDetails] = useState<Cart | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Load carts data
  useEffect(() => {
    const loadCarts = async () => {
      setIsLoading(true);
      try {
        const data = await getActiveCarts();
        setCarts(data);
        applyFilters(data, searchQuery, statusFilter, sortField, sortOrder);
      } catch (error) {
        console.error('Error loading carts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load active carts. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCarts();
    
    // Set up interval to refresh cart times
    const intervalId = setInterval(() => {
      setCarts(prevCarts => {
        // No need to fetch from API, just update the existing carts
        applyFilters(prevCarts, searchQuery, statusFilter, sortField, sortOrder);
        return prevCarts;
      });
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Apply filters
  const applyFilters = (
    data: Cart[], 
    search: string, 
    status: string,
    field: keyof Cart,
    order: 'asc' | 'desc'
  ) => {
    let filtered = [...data];
    
    // Apply search filter
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter(cart => 
        cart.userName.toLowerCase().includes(lowercaseSearch) || 
        cart.userEmail.toLowerCase().includes(lowercaseSearch) ||
        cart.items.some(item => 
          item.symbol.toLowerCase().includes(lowercaseSearch) ||
          item.name.toLowerCase().includes(lowercaseSearch)
        )
      );
    }
    
    // Apply status filter
    if (status !== 'all') {
      if (status === 'expiring') {
        filtered = filtered.filter(cart => isNearExpiry(cart.expiresAt));
      } else if (status === 'expired') {
        filtered = filtered.filter(cart => hasExpired(cart.expiresAt));
      } else if (status === 'active') {
        filtered = filtered.filter(cart => !isNearExpiry(cart.expiresAt) && !hasExpired(cart.expiresAt));
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (field === 'createdAt' || field === 'expiresAt') {
        // For date fields
        return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
      } else if (field === 'totalValue') {
        // For numeric fields
        return order === 'asc' ? a[field] - b[field] : b[field] - a[field];
      } else {
        // For string fields (userName, etc.)
        const valueA = String(a[field] || '').toLowerCase();
        const valueB = String(b[field] || '').toLowerCase();
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    setFilteredCarts(filtered);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(carts, value, statusFilter, sortField, sortOrder);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(carts, searchQuery, value, sortField, sortOrder);
  };
  
  // Handle sort
  const handleSort = (field: keyof Cart) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    applyFilters(carts, searchQuery, statusFilter, field, newOrder);
  };
  
  // Open release dialog
  const openReleaseDialog = (cartId: string) => {
    setReleaseCartId(cartId);
    setIsReleaseDialogOpen(true);
  };
  
  // Release cart items
  const releaseCartItems = () => {
    if (!releaseCartId) return;
    
    const cartToRelease = carts.find(cart => cart.id === releaseCartId);
    if (!cartToRelease) return;
    
    const updatedCarts = carts.filter(cart => cart.id !== releaseCartId);
    
    setCarts(updatedCarts);
    applyFilters(updatedCarts, searchQuery, statusFilter, sortField, sortOrder);
    setIsReleaseDialogOpen(false);
    setReleaseCartId(null);
    
    toast({
      title: 'Cart Released',
      description: `Cart items for ${cartToRelease.userName} have been released back to inventory.`,
    });
  };
  
  // View cart details
  const viewCartDetails = (cart: Cart) => {
    setCartDetails(cart);
    setIsDetailsOpen(true);
  };
  
  // Format date
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <AdminLayout 
      title="Active Carts" 
      description="Monitor and manage customer shopping carts"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by customer or stock..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Carts</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    applyFilters(carts, '', 'all', sortField, sortOrder);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Carts table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('userName')}
                >
                  Customer
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center ml-auto"
                  onClick={() => handleSort('totalValue')}
                >
                  Total Value
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead className="w-[180px]">
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('expiresAt')}
                >
                  Time Remaining
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={6} className="h-14">
                    <div className="w-full h-4 bg-secondary/50 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCarts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No active carts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCarts.map((cart) => {
                const timeRemaining = cart.expiresAt - Date.now();
                const isExpired = timeRemaining <= 0;
                const isAboutToExpire = !isExpired && timeRemaining < 3 * 60 * 1000;
                const timePercentage = calculateTimePercentage(cart.createdAt, cart.expiresAt);
                
                return (
                  <TableRow key={cart.id} className={isExpired ? 'opacity-60' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cart.userName}</div>
                        <div className="text-sm text-muted-foreground">{cart.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {cart.items.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => viewCartDetails(cart)}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cart.totalValue)}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-left cursor-help">
                            <div className="text-sm">
                              {new Date(cart.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatDateTime(cart.createdAt)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className={`h-3 w-3 mr-1 ${isExpired ? 'text-destructive' : isAboutToExpire ? 'text-amber-500' : 'text-green-500'}`} />
                            <span className={isExpired ? 'text-destructive' : isAboutToExpire ? 'text-amber-500' : 'text-green-500'}>
                              {isExpired ? 'Expired' : formatTimeRemaining(timeRemaining)}
                            </span>
                          </div>
                          
                          {isExpired && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                              Expired
                            </Badge>
                          )}
                          
                          {isAboutToExpire && !isExpired && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        
                        <Progress
                          value={timePercentage}
                          className={`h-1.5 ${
                            isExpired 
                              ? 'bg-destructive/30' 
                              : isAboutToExpire 
                                ? 'bg-amber-500/30' 
                                : 'bg-green-500/30'
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openReleaseDialog(cart.id)}
                        >
                          Release Items
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Release confirmation dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Release</DialogTitle>
            <DialogDescription>
              Are you sure you want to release these cart items? The items will be returned to inventory and the customer's cart will be cleared.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={releaseCartItems}>
              Release Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cart details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
            <DialogDescription>
              {cartDetails && (
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" />
                  {cartDetails.userName} ({cartDetails.userEmail})
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
            
          {cartDetails && (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartDetails.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.symbol}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(cartDetails.totalValue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDateTime(cartDetails.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{formatDateTime(cartDetails.expiresAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>
                    {hasExpired(cartDetails.expiresAt) 
                      ? 'Expired' 
                      : isNearExpiry(cartDetails.expiresAt) 
                        ? 'Expiring Soon' 
                        : 'Active'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
            
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (cartDetails) {
                  openReleaseDialog(cartDetails.id);
                  setIsDetailsOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Release Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ActiveCartsPage;
