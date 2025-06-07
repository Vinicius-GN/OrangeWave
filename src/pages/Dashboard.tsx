
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Plus, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import PortfolioDistribution from '@/components/PortfolioDistribution';
import PortfolioEvolutionChart from '@/components/PortfolioEvolutionChart';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useBalance } from '@/hooks/api/useBalance';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    assets,
    stats,
    isLoading,
    error,
    getAssetsByType,
    getAssetsValue,
    updateAssetPrices
  } = usePortfolio();
  const { balance, isLoading: balanceLoading } = useBalance();
  
  const [showBalance, setShowBalance] = useState(true);

  const stocks = getAssetsByType('stock');
  const crypto = getAssetsByType('crypto');
  
  // Calculate total portfolio value
  const totalPortfolioValue = balance + getAssetsValue();
  
  // Prepare data for portfolio distribution chart
  const distributionData = [
    { name: 'Cash', value: balance },
    { name: 'Stocks', value: stocks.reduce((sum, asset) => sum + asset.totalValue, 0) },
    { name: 'Crypto', value: crypto.reduce((sum, asset) => sum + asset.totalValue, 0) }
  ].filter(item => item.value > 0); // Only show categories with values > 0
  
  // Format currency display
  const formatCurrency = (amount: number, showValue: boolean = true) => {
    if (!showValue) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Handle asset purchase
  const handleBuyAsset = () => {
    navigate('/market');
  };

  useEffect(() => {
    // Update asset prices on component mount
    updateAssetPrices();
  }, []);

  if (isLoading || balanceLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-secondary rounded"></div>
              <div className="h-32 bg-secondary rounded"></div>
              <div className="h-32 bg-secondary rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.fullName}!</h1>
            <p className="text-muted-foreground">Here's your portfolio overview</p>
          </div>
          <Button onClick={handleBuyAsset} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buy Assets
          </Button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Portfolio Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="h-4 w-4 p-0"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue, showBalance)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                Portfolio Performance
              </div>
            </CardContent>
          </Card>

          {/* Available Cash */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance, showBalance)}</div>
              <p className="text-xs text-muted-foreground">
                Ready to invest
              </p>
            </CardContent>
          </Card>

          {/* Day's Change */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
              {stats.dayChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showBalance ? formatCurrency(Math.abs(stats.dayChange)) : '••••••'}
              </div>
              <div className={`text-xs ${stats.dayChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {showBalance ? formatPercent(stats.dayChangePercentage) : '••••%'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Portfolio Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Evolution Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Evolution</CardTitle>
                <CardDescription>Track your portfolio performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioEvolutionChart />
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Distribution */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
                <CardDescription>Your portfolio allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioDistribution data={distributionData} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
            <CardDescription>Overview of your current investments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Assets</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {assets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You don't have any holdings yet.</p>
                    <Button onClick={handleBuyAsset}>Start Investing</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{showBalance ? formatCurrency(asset.totalValue) : '••••••'}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{asset.quantity} shares</p>
                            <Badge variant={asset.profitLoss >= 0 ? "default" : "destructive"}>
                              {showBalance ? formatPercent(asset.profitLossPercentage) : '••••%'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stocks" className="mt-4">
                {stocks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You don't have any stock holdings yet.</p>
                    <Button onClick={handleBuyAsset}>Browse Stocks</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stocks.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{asset.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{showBalance ? formatCurrency(asset.totalValue) : '••••••'}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{asset.quantity} shares</p>
                            <Badge variant={asset.profitLoss >= 0 ? "default" : "destructive"}>
                              {showBalance ? formatPercent(asset.profitLossPercentage) : '••••%'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="crypto" className="mt-4">
                {crypto.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You don't have any cryptocurrency holdings yet.</p>
                    <Button onClick={handleBuyAsset}>Browse Crypto</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {crypto.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-600">{asset.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{asset.symbol}</p>
                            <p className="text-sm text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{showBalance ? formatCurrency(asset.totalValue) : '••••••'}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">{asset.quantity} units</p>
                            <Badge variant={asset.profitLoss >= 0 ? "default" : "destructive"}>
                              {showBalance ? formatPercent(asset.profitLossPercentage) : '••••%'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
