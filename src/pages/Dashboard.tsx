
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import PortfolioDistribution from '@/components/PortfolioDistribution';
import PortfolioEvolutionChart from '@/components/PortfolioEvolutionChart';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, Asset } from '@/contexts/PortfolioContext';
import { AssetData, getMostTraded, getTopGainers, getAllAssets } from '@/services/marketService';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, DollarSign, ArrowRight, Plus, Coins } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    assets, 
    getAssetsByType, 
    getAssetsValue,
    updateAssetPrices
  } = usePortfolio();
  
  const [recommendedAssets, setRecommendedAssets] = useState<AssetData[]>([]);
  const [allMarketAssets, setAllMarketAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Load market assets and recommended assets
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        const [allAssets, mostTraded, topGainers] = await Promise.all([
          getAllAssets(),
          getMostTraded(3),
          getTopGainers(3)
        ]);
        
        setAllMarketAssets(allAssets);
        
        // Combine and deduplicate recommended assets
        const combined = [...mostTraded];
        
        for (const asset of topGainers) {
          if (!combined.some(a => a.id === asset.id)) {
            combined.push(asset);
            if (combined.length >= 5) break;
          }
        }
        
        setRecommendedAssets(combined.slice(0, 5));
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssets();
  }, []);
  
  // Update asset prices - fix oscillation by only updating once
  useEffect(() => {
    if (allMarketAssets.length > 0 && assets.length > 0) {
      const updates = assets.map(asset => {
        const match = allMarketAssets.find(a => a.symbol === asset.symbol);
        return {
          id: asset.id,
          currentPrice: match ? match.price : asset.currentPrice
        };
      });
      
      if (updates.length > 0) {
        updateAssetPrices(updates);
      }
    }
    // Only run this effect when allMarketAssets change, not on every render
  }, [allMarketAssets]);
  
  if (!isAuthenticated || !user) {
    return null; // Handled by useEffect redirect
  }
  
  // Prepare portfolio data
  const stockAssets = getAssetsByType('stock');
  const cryptoAssets = getAssetsByType('crypto');
  const totalAssetValue = getAssetsValue();
  const totalWalletValue = user.balance.wallet;
  const totalPortfolioValue = totalAssetValue + totalWalletValue;
  
  // Prepare chart data
  const hasAssets = assets.length > 0;
  
  const portfolioDistribution = [
    { name: 'Cash', value: totalWalletValue },
    { name: 'Stocks', value: stockAssets.reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0) },
    { name: 'Crypto', value: cryptoAssets.reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0) }
  ].filter(item => item.value > 0);
  
  // Asset list for portfolio - enhanced with market data
  const renderAssetList = (assetList: Asset[]) => {
    if (assetList.length === 0) {
      return (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">No assets in this category</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {assetList.map(asset => {
          // Get market data for this asset
          const marketAsset = allMarketAssets.find(ma => ma.symbol === asset.symbol);
          
          const totalValue = asset.quantity * asset.currentPrice;
          const profitLoss = asset.quantity * (asset.currentPrice - asset.averagePrice);
          const profitLossPercent = ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100;
          const isPositive = profitLoss >= 0;
          
          return (
            <div 
              key={asset.id}
              className="p-4 border border-primary/20 rounded-lg flex justify-between items-center hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => navigate(`/asset/${asset.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  {marketAsset?.logoUrl || asset.logoUrl ? (
                    <img src={marketAsset?.logoUrl || asset.logoUrl} alt={asset.symbol} className="w-6 h-6" />
                  ) : (
                    <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground">Qty: {asset.quantity}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">${totalValue.toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</div>
                <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{profitLoss.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} ({isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's your portfolio overview.
          </p>
        </div>
        
        {/* Portfolio Summary */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Portfolio Overview</CardTitle>
              <CardDescription>
                Your total assets and distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
                  <div className="text-muted-foreground text-sm mb-1">Total Portfolio Value</div>
                  <div className="text-3xl font-bold mb-4 text-primary">
                    ${totalPortfolioValue.toLocaleString(undefined, { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className="glass-card p-3 rounded-lg border border-primary/20">
                      <div className="text-muted-foreground text-xs mb-1">Available Cash</div>
                      <div className="font-semibold">
                        ${user.balance.wallet.toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                    
                    <div className="glass-card p-3 rounded-lg border border-primary/20">
                      <div className="text-muted-foreground text-xs mb-1">Invested Value</div>
                      <div className="font-semibold">
                        ${totalAssetValue.toLocaleString(undefined, { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 h-[200px] mt-4 md:mt-0">
                  {hasAssets || totalWalletValue > 0 ? (
                    <PortfolioDistribution data={portfolioDistribution} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-2">No assets in your portfolio yet</p>
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => navigate('/market')}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Assets
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Manage your investments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-between items-center hover:bg-primary/10 border border-primary/20" 
                variant="outline"
                onClick={() => navigate('/market')}
              >
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                  <span>Explore Markets</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Button>
              
              <Button 
                className="w-full justify-between items-center hover:bg-primary/10 border border-primary/20" 
                variant="outline"
                onClick={() => navigate('/wallet')}
              >
                <div className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4 text-primary" />
                  <span>Manage Wallet</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Button>
              
              <Button 
                className="w-full justify-between items-center hover:bg-primary/10 border border-primary/20" 
                variant="outline"
                onClick={() => navigate('/orders')}
              >
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-primary" />
                  <span>View Orders</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Button>
              
              <Button 
                className="w-full justify-between items-center hover:bg-primary/10 border border-primary/20" 
                variant="outline"
                onClick={() => navigate('/simulation')}
              >
                <div className="flex items-center">
                  <Coins className="mr-2 h-4 w-4 text-primary" />
                  <span>Trading Simulation</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Button>
              
              <Alert className="bg-primary/10 border-primary/30">
                <AlertDescription className="text-sm">
                  Get started by exploring the markets and adding assets to your portfolio.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio Evolution Chart */}
        <Card className="glass-card mb-8">
          <CardContent className="pt-6">
            <PortfolioEvolutionChart />
          </CardContent>
        </Card>
        
        {/* Asset List */}
        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Assets</h2>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            {assets.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any assets in your portfolio yet.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/market')}
                  >
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            ) : (
              renderAssetList(assets)
            )}
          </TabsContent>
          
          <TabsContent value="stocks">
            {renderAssetList(stockAssets)}
          </TabsContent>
          
          <TabsContent value="crypto">
            {renderAssetList(cryptoAssets)}
          </TabsContent>
        </Tabs>
        
        {/* Recommended Assets - Enhanced with centralized data */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/market')}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="glass-card animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary"></div>
                        <div>
                          <div className="h-4 w-16 bg-secondary rounded mb-2"></div>
                          <div className="h-3 w-24 bg-secondary rounded"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-16 bg-secondary rounded mb-2"></div>
                        <div className="h-3 w-10 bg-secondary rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              recommendedAssets.slice(0, 3).map(asset => (
                <Card key={asset.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/asset/${asset.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {asset.logo && (
                          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                            <img 
                              src={asset.logo}
                              alt={asset.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className={
                        asset.type === 'stock' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                      }>
                        {asset.type === 'stock' ? 'Stock' : 'Crypto'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-xl font-bold">${asset.price.toFixed(2)}</p>
                        <div className={
                          asset.changePercent >= 0 ? "text-green-500" : "text-red-500"
                        }>
                          {asset.changePercent >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1 inline" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1 inline" />
                          )}
                          {asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
