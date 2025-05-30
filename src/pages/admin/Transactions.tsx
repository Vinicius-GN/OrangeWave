import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Filter, DownloadCloud, FileText, Calendar, ArrowUpDown, 
  CreditCard, Wallet, ChevronDown, ArrowDown, ArrowUp
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
// Fix date-fns import - remove DateRange and use only necessary imports
import { format, subDays, isValid, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

// Define our own DateRange type for internal use
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Define transaction interface
interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'credit_card' | 'wallet';
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'deposit',
    amount: 500,
    date: '2024-07-15',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-2',
    userId: 'user-2',
    type: 'purchase',
    amount: 150,
    date: '2024-07-14',
    status: 'completed',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'withdrawal',
    amount: 50,
    date: '2024-07-13',
    status: 'pending',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-4',
    userId: 'user-3',
    type: 'sale',
    amount: 300,
    date: '2024-07-12',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-5',
    userId: 'user-2',
    type: 'deposit',
    amount: 200,
    date: '2024-07-11',
    status: 'failed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'purchase',
    amount: 75,
    date: '2024-07-10',
    status: 'completed',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-7',
    userId: 'user-3',
    type: 'withdrawal',
    amount: 100,
    date: '2024-07-09',
    status: 'completed',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-8',
    userId: 'user-2',
    type: 'sale',
    amount: 400,
    date: '2024-07-08',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-9',
    userId: 'user-1',
    type: 'deposit',
    amount: 1000,
    date: '2024-07-07',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-10',
    userId: 'user-3',
    type: 'purchase',
    amount: 250,
    date: '2024-07-06',
    status: 'completed',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-11',
    userId: 'user-2',
    type: 'withdrawal',
    amount: 25,
    date: '2024-07-05',
    status: 'pending',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-12',
    userId: 'user-1',
    type: 'sale',
    amount: 120,
    date: '2024-07-04',
    status: 'completed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-13',
    userId: 'user-3',
    type: 'deposit',
    amount: 750,
    date: '2024-07-03',
    status: 'failed',
    paymentMethod: 'credit_card',
  },
  {
    id: 'tx-14',
    userId: 'user-2',
    type: 'purchase',
    amount: 60,
    date: '2024-07-02',
    status: 'completed',
    paymentMethod: 'wallet',
  },
  {
    id: 'tx-15',
    userId: 'user-1',
    type: 'withdrawal',
    amount: 200,
    date: '2024-07-01',
    status: 'completed',
    paymentMethod: 'wallet',
  },
];

// Function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const TransactionsManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  
  const { toast } = useToast();

  // Function to apply filters
  const applyFilters = (
    search: string,
    type: string,
    status: string,
    paymentMethod: string,
    dateRangeParam: DateRange | undefined,
    field: keyof Transaction,
    order: 'asc' | 'desc'
  ) => {
    setIsLoading(true);
    setTimeout(() => {
      let filtered = [...transactions];

      // Apply search filter
      if (search) {
        filtered = filtered.filter(transaction =>
          transaction.userId.toLowerCase().includes(search.toLowerCase()) ||
          transaction.id.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply type filter
      if (type !== 'all') {
        filtered = filtered.filter(transaction => transaction.type === type);
      }

      // Apply status filter
      if (status !== 'all') {
        filtered = filtered.filter(transaction => transaction.status === status);
      }

      // Apply payment method filter
      if (paymentMethod !== 'all') {
        filtered = filtered.filter(transaction => transaction.paymentMethod === paymentMethod);
      }

      // Apply date range filter
      if (dateRangeParam?.from && dateRangeParam?.to) {
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const startDate = dateRangeParam.from;
          const endDate = dateRangeParam.to;
          
          if (!isValid(transactionDate) || !isValid(startDate) || !isValid(endDate)) {
            return false;
          }
          
          return (
            !isAfter(startDate, transactionDate) && !isAfter(transactionDate, endDate)
          );
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredTransactions(filtered);
      setIsLoading(false);
    }, 300);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(value, typeFilter, statusFilter, paymentMethodFilter, dateRange, sortField, sortOrder);
  };

  // Handle type filter change
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    applyFilters(searchQuery, value, statusFilter, paymentMethodFilter, dateRange, sortField, sortOrder);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchQuery, typeFilter, value, paymentMethodFilter, dateRange, sortField, sortOrder);
  };

  // Handle payment method filter change
  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter(value);
    applyFilters(searchQuery, typeFilter, statusFilter, value, dateRange, sortField, sortOrder);
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    applyFilters(searchQuery, typeFilter, statusFilter, paymentMethodFilter, range, sortField, sortOrder);
  };
  
  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    applyFilters(searchQuery, typeFilter, statusFilter, paymentMethodFilter, dateRange, field, newOrder);
  };

  // Open dialog to view transaction details
  const openTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  // Close transaction dialog
  const closeTransactionDialog = () => {
    setSelectedTransaction(null);
    setIsDialogOpen(false);
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = ['ID', 'User ID', 'Type', 'Amount', 'Date', 'Status', 'Payment Method'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        transaction.id,
        transaction.userId,
        transaction.type,
        transaction.amount,
        transaction.date,
        transaction.status,
        transaction.paymentMethod || 'N/A'
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
      description: `${filteredTransactions.length} transactions exported to CSV.`,
    });
  };

  return (
    <AdminLayout title="Transactions" description="Manage and view all transactions">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 min-w-[120px]">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type-filter">Type</Label>
                  <Select
                    value={typeFilter}
                    onValueChange={handleTypeFilterChange}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payment-method-filter">Payment Method</Label>
                  <Select
                    value={paymentMethodFilter}
                    onValueChange={handlePaymentMethodFilterChange}
                  >
                    <SelectTrigger id="payment-method-filter">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange?.from && !dateRange?.to && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
                                dateRange.to,
                                "MMM dd, yyyy"
                              )}`
                            ) : (
                              format(dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-auto p-0">
                        <CalendarComponent
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPaymentMethodFilter('all');
                    setDateRange(undefined);
                    applyFilters('', 'all', 'all', 'all', undefined, sortField, sortOrder);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline" onClick={exportToCsv}>
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transactions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('id')}
                >
                  Transaction ID
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('userId')}
                >
                  User ID
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">
                <button 
                  className="flex items-center ml-auto"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center"
                  onClick={() => handleSort('date')}
                >
                  Date
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={8} className="h-14">
                    <div className="w-full h-4 bg-secondary/50 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredTransactions.length === 0 ? (
              // No data state
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.userId}</TableCell>
                  <TableCell className="capitalize">
                    {transaction.type}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        transaction.status === 'completed'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{transaction.paymentMethod || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openTransactionDialog(transaction)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View detailed information about the selected transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-left">
                  Transaction ID
                </Label>
                <Input id="id" value={selectedTransaction.id} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-left">
                  User ID
                </Label>
                <Input id="userId" value={selectedTransaction.userId} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-left">
                  Type
                </Label>
                <Input id="type" value={selectedTransaction.type} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-left">
                  Amount
                </Label>
                <Input id="amount" value={formatCurrency(selectedTransaction.amount)} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-left">
                  Date
                </Label>
                <Input id="date" value={format(new Date(selectedTransaction.date), 'MMM dd, yyyy')} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-left">
                  Status
                </Label>
                <Input id="status" value={selectedTransaction.status} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-left">
                  Payment Method
                </Label>
                <Input id="paymentMethod" value={selectedTransaction.paymentMethod || 'N/A'} className="col-span-3" readOnly />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">Loading...</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeTransactionDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TransactionsManagement;
