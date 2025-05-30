import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Clock, DollarSign, CreditCard, History, Wallet as WalletIcon, PlusCircle, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, Transaction } from '@/contexts/PortfolioContext';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

const Wallet = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { deposit, withdraw, transactions } = usePortfolio();
  
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }
  
  // Filter transactions for wallet related actions
  const walletTransactions = transactions.filter(
    txn => txn.type === 'deposit' || txn.type === 'withdrawal'
  );

  // Handle deposit submission
  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await deposit(depositAmount);
      setDepositDialogOpen(false);
      setAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      // Error handling is done in PortfolioContext
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle withdrawal submission
  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return;
    }
    
    if (withdrawAmount > user.balance.wallet) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await withdraw(withdrawAmount);
      setWithdrawDialogOpen(false);
      setAmount('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      // Error handling is done in PortfolioContext
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render transaction history
  const renderTransactions = (txns: Transaction[]) => {
    if (txns.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {txns.map((txn) => (
          <div 
            key={txn.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                txn.type === 'deposit' 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              )}>
                {txn.type === 'deposit' ? (
                  <ArrowDown className="h-5 w-5" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </div>
              
              <div>
                <div className="font-medium">
                  {txn.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(txn.timestamp), 'MMM d, yyyy • h:mm a')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={cn(
                "font-medium",
                txn.type === 'deposit' ? "text-green-500" : "text-red-500"
              )}>
                {txn.type === 'deposit' ? '+' : '-'}${txn.total.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and view transaction history.
          </p>
        </div>
        
        {/* Wallet Balance Card */}
        <Card className="glass-card mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
                <div className="text-4xl font-bold mb-2">
                  ${user.balance.wallet.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last updated {format(new Date(), 'MMM d, yyyy • h:mm a')}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setDepositDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={user.balance.wallet <= 0}
                >
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for Wallet Management */}
        <Tabs defaultValue="history" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <Button variant="outline" size="sm" disabled>
                <History className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            {renderTransactions(walletTransactions)}
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Add or manage your payment methods.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No payment methods have been added yet.
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600" disabled>
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-center text-sm text-muted-foreground">
                Note: Payment methods are not available in the demo version.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add money to your trading account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="deposit-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <Alert className="bg-orange-500/10 border-orange-500/30">
              <AlertDescription className="text-sm">
                In a real application, this would connect to a payment processor.
                For this demo, funds will be added instantly.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            >
              {isProcessing ? 'Processing...' : 'Deposit Funds'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw money from your trading account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
              <div className="font-medium">${user.balance.wallet.toFixed(2)}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={user.balance.wallet.toString()}
                  placeholder="0.00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            {parseFloat(amount) > user.balance.wallet && (
              <Alert variant="destructive">
                <AlertDescription>
                  Insufficient funds. You can withdraw up to ${user.balance.wallet.toFixed(2)}.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="bg-orange-500/10 border-orange-500/30">
              <AlertDescription className="text-sm">
                In a real application, this would connect to a payment processor.
                For this demo, funds will be withdrawn instantly.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              variant="destructive"
              disabled={
                isProcessing || 
                !amount || 
                parseFloat(amount) <= 0 || 
                parseFloat(amount) > user.balance.wallet
              }
            >
              {isProcessing ? 'Processing...' : 'Withdraw Funds'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Wallet;
