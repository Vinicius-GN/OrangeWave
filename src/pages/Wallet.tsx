// Wallet management page for OrangeWave Trading Platform
// Provides user interface for balance management, deposits, withdrawals, and transaction history

import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useWallet } from '@/hooks/api/useWallet';
import CreditCardForm from '@/components/CreditCardForm';

const Wallet = () => {
  // Hook for wallet data and operations (balance, transactions, API calls)
  const { balance, transactions, isLoading, error, deposit, withdraw } = useWallet();
  const { toast } = useToast();
  
  // State management for form inputs and UI controls
  const [depositAmount, setDepositAmount] = useState('');      // Deposit input field value
  const [withdrawAmount, setWithdrawAmount] = useState('');    // Withdrawal input field value
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);   // Controls deposit modal visibility
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false); // Controls withdrawal modal visibility
  const [isProcessing, setIsProcessing] = useState(false);     // Indicates API operation in progress

  /**
   * Handles deposit transaction processing
   * Validates input, calls API, and provides user feedback
   */
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    // Input validation: ensure amount is a valid positive number
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Call deposit API through wallet hook
      await deposit(amount);
      toast({
        title: 'Deposit successful',
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
      // Reset form and close dialog on success
      setDepositAmount('');
      setIsDepositDialogOpen(false);
    } catch (error: any) {
      // Handle API errors with user-friendly messages
      toast({
        title: 'Deposit failed',
        description: error.message || 'Failed to process deposit.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles withdrawal transaction processing
   * Validates input and balance, calls API, and provides user feedback
   */
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    // Input validation: ensure amount is a valid positive number
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    // Balance validation: ensure user has sufficient funds
    if (amount > balance) {
      toast({
        title: 'Insufficient funds',
        description: 'You do not have enough balance for this withdrawal.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Call withdrawal API through wallet hook
      await withdraw(amount);
      toast({
        title: 'Withdrawal successful',
        description: `$${amount.toFixed(2)} has been withdrawn from your wallet.`,
      });
      // Reset form and close dialog on success
      setWithdrawAmount('');
      setIsWithdrawDialogOpen(false);
    } catch (error: any) {
      // Handle API errors with user-friendly messages
      toast({
        title: 'Withdrawal failed',
        description: error.message || 'Failed to process withdrawal.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Formats monetary amounts with proper currency formatting
   * @param amount - Numeric amount to format
   * @returns Formatted currency string (e.g., "$1,234.56")
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Formats various date formats from backend into consistent display format
   * Handles ISO strings, timestamps, and different date formats robustly
   * @param dateInput - Date string or Date object from API
   * @returns Formatted date string or error message
   */
  const formatDate = (dateInput: string | Date) => {
    try {
      let date: Date;
      
      // Handle different date formats from the backend
      if (typeof dateInput === 'string') {
        // Try ISO format first, then timestamp
        if (dateInput.includes('T') || dateInput.includes('-')) {
          date = new Date(dateInput);
        } else if (/^\d+$/.test(dateInput)) {
          // Handle timestamp (number as string)
          date = new Date(parseInt(dateInput));
        } else {
          date = new Date(dateInput);
        }
      } else {
        date = dateInput;
      }
      
      // Validate the parsed date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput);
        return 'Invalid date';
      }
      
      // Format to match the orders page style: "Jun 07, 2025 – 15:30"
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateInput);
      return 'Invalid date';
    }
  };

  /**
   * Returns appropriate icon for transaction type with semantic coloring
   * @param type - Transaction type string from API
   * @returns React icon component with appropriate styling
   */
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdraw':
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />;
    }
  };

  // Loading state: show spinner while fetching wallet data
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  // Error state: display error message if wallet data fails to load
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading wallet: {error}
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
          <h1 className="text-3xl font-bold mb-4">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Balance display card with deposit/withdrawal action buttons */}
        <Card className="mb-8 glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <div className="flex gap-4 mt-4">
              {/* Deposit funds dialog trigger */}
              <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                      Add money to your wallet. Enter the amount you want to deposit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="deposit-amount">Amount</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleDeposit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Deposit'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Withdraw funds dialog trigger */}
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Withdraw money from your wallet. Enter the amount you want to withdraw.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="withdraw-amount">Amount</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        max={balance}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available balance: {formatCurrency(balance)}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleWithdraw}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Withdraw'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Credit card management component for payment methods */}
        <div className="mb-8">
          <CreditCardForm />
        </div>

        {/* Transaction history display with formatted entries */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your recent wallet transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              // Empty state when no transactions exist
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              // Transaction list with formatted entries
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Transaction type icon with semantic coloring */}
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || `${transaction.type} transaction`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* Amount with positive/negative indicator and color coding */}
                      <p className={`font-medium ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {/* Formatted timestamp with fallback handling */}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp || transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Wallet;
