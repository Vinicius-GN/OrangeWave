
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { ArrowUpDown, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, Transaction } from '@/contexts/PortfolioContext';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { transactions, getAssetById } = usePortfolio();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Filter trade-related transactions
  const tradeTransactions = transactions.filter(
    txn => txn.type === 'buy' || txn.type === 'sell'
  );
  
  // Navigate to asset detail page
  const navigateToAsset = (assetId: string) => {
    console.log("Navigating to asset with ID:", assetId);
    
    // Skip wallet transactions
    if (assetId === 'wallet') {
      toast({
        title: "This is a wallet transaction",
        description: "Wallet transactions don't have an associated asset to view."
      });
      return;
    }
    
    // For buy/sell transactions, we need to find the actual asset
    const asset = getAssetById(assetId);
    
    if (asset) {
      navigate(`/asset/${asset.id}`);
    } else {
      // If we can't find the asset in our current portfolio
      toast({
        title: "Asset not found",
        description: "This asset may have been sold or is no longer in your portfolio."
      });
    }
  };
  
  // Render transaction list
  const renderTransactions = (txnList: Transaction[]) => {
    if (txnList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions to display</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {txnList.map((txn) => (
          <div 
            key={txn.id}
            className="p-4 border border-primary/20 rounded-lg flex flex-col md:flex-row justify-between gap-4 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                txn.type === 'buy' 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              )}>
                <ArrowUpDown className="h-5 w-5" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{txn.symbol}</span>
                  <Badge variant={txn.type === 'buy' ? 'default' : 'destructive'} className={cn(
                    "rounded-md text-xs",
                    txn.type === 'buy' 
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                      : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  )}>
                    {txn.type === 'buy' ? 'Buy' : 'Sell'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(txn.timestamp), 'MMM d, yyyy • h:mm a')}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
              <div>
                <div className="text-xs text-muted-foreground">Quantity</div>
                <div className="font-medium">{txn.quantity}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-medium">${txn.price.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-medium">${txn.total.toFixed(2)}</div>
              </div>
              
              {txn.assetId !== 'wallet' && txn.type === 'buy' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:self-center mt-2 md:mt-0 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => navigateToAsset(txn.assetId)}
                >
                  View Asset
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (!isAuthenticated) {
    return null; // Handled by useEffect redirect
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Transaction History</h1>
          <p className="text-muted-foreground">
            View your buying and selling history.
          </p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-bold">Your Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Review your past trades.
          </p>
        </div>
        {renderTransactions(tradeTransactions)}
      </div>
    </Layout>
  );
};

export default Orders;
