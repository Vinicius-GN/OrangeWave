import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  LineChart,
  Package
} from 'lucide-react';
import Layout from '@/components/Layout';
import PriceChart from '@/components/PriceChart';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useCart } from '@/contexts/CartContext';
import { useBalance } from '@/hooks/api/useBalance';
import { cn } from '@/lib/utils';
import SellAssetModal from '@/components/SellAssetModal';
import { fetchAssetById } from '@/services/marketService';

const API_URL = 'http://localhost:3001/api';

// Helper function to format percent change
const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

interface AssetData {
  _id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  changePercent: number;
  change: number;
  marketCap: number;
  volume: number;
  logoUrl?: string;
  isFrozen?: boolean;
  availableStock?: number;
}

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [ownedAsset, setOwnedAsset] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const { user } = useAuth();
  const { assets, getAssetById: getPortfolioAsset } = usePortfolio();
  const { balance } = useBalance();
  const { toast } = useToast();
  const { addToCart, items } = useCart();
  
  useEffect(() => {
    const loadAssetData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const assetData = await fetchAssetById(id);
        
        const convertedAssetData: AssetData = {
          _id: assetData._id,
          symbol: assetData.symbol,
          name: assetData.name,
          type: assetData.type as 'stock' | 'crypto',
          price: assetData.price,
          changePercent: assetData.changePercent || 0,
          change: assetData.change || 0,
          marketCap: assetData.marketCap,
          volume: assetData.volume,
          logoUrl: assetData.logoUrl,
          availableStock: assetData.availableStock
        };
        
        setAsset(convertedAssetData);
        
        // Check if the user owns this asset
        if (user) {
          const owned = getPortfolioAsset(assetData._id);
          setOwnedAsset(owned);
        }
      } catch (error) {
        console.error('Error loading asset data:', error);
        toast({
          title: "Error",
          description: "Failed to load asset data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssetData();
  }, [id, user, toast, getPortfolioAsset]);
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      if (asset?.availableStock !== undefined) {
        setQuantity(Math.min(value, asset.availableStock));
      } else {
        setQuantity(value);
      }
    }
  };
  
  // Handle adding to cart with proper stock validation
  const handleAddToCart = () => {
    if (!asset) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to cart.",
        variant: "destructive"
      });
      return;
    }
    
    if (asset.isFrozen) {
      toast({
        title: "Trading restricted",
        description: `${asset.name} is currently frozen and cannot be traded.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check available stock
    if (asset.availableStock !== undefined && asset.availableStock <= 0) {
      toast({
        title: "Out of stock",
        description: `${asset.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }
    
    // Get current quantity in cart for this asset
    const currentCartQuantity = items.filter(item => item.assetId === asset._id)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    // Check if adding this quantity would exceed available stock
    if (asset.availableStock !== undefined && (currentCartQuantity + quantity) > asset.availableStock) {
      const remainingStock = asset.availableStock - currentCartQuantity;
      if (remainingStock <= 0) {
        toast({
          title: "Already in cart",
          description: `You already have the maximum available quantity of ${asset.symbol} in your cart.`,
          variant: "destructive"
        });
        return;
      } else {
        toast({
          title: "Stock limit reached",
          description: `You can only add ${remainingStock} more units of ${asset.symbol} to your cart. Available stock: ${asset.availableStock}, Currently in cart: ${currentCartQuantity}`,
          variant: "destructive"
        });
        setQuantity(remainingStock);
        return;
      }
    }
    
    addToCart({
      id: `${asset._id}_${Date.now()}`,
      assetId: asset._id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      price: asset.price
    }, quantity);
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${asset.symbol} added to your cart.`,
    });
  };

  // Handle opening sell modal
  const handleOpenSellModal = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to sell assets.",
        variant: "destructive"
      });
      return;
    }

    if (!ownedAsset || ownedAsset.quantity <= 0) {
      toast({
        title: "No assets to sell",
        description: `You don't own any ${asset?.name || 'asset'} to sell.`,
        variant: "destructive"
      });
      return;
    }

    setShowSellModal(true);
  };
  
  if (!asset && !isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <p className="mb-8">The requested asset could not be found.</p>
          <Button asChild>
            <Link to="/market">Return to Market</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
            <Link to="/market" className="flex items-center text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Market
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          // Loading state
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-96 bg-secondary rounded"></div>
              </div>
              <div>
                <div className="h-80 bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          // Asset detail content
          <>
            {/* Asset header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center">
                {asset!.logoUrl && (
                  <img 
                    src={asset!.logoUrl} 
                    alt={asset!.name} 
                    className="w-12 h-12 mr-4 rounded-full bg-background object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {asset!.name} 
                    <span className="text-xl text-muted-foreground">({asset!.symbol})</span>
                    {asset!.isFrozen && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Frozen
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-medium">${asset!.price.toFixed(2)}</span>
                    <span 
                      className={cn(
                        "ml-2 flex items-center text-sm",
                        asset!.changePercent >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {asset!.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {asset!.changePercent >= 0 ? '+' : ''}{asset!.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Asset stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="font-medium">{formatNumber(asset!.marketCap)}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="font-medium">{formatNumber(asset!.volume)}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Available Stock</div>
                  <div className="font-medium flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    {asset!.availableStock !== undefined ? asset!.availableStock : 'Unlimited'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price chart section */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Price Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PriceChart 
                      assetId={id || ""} 
                      currentPrice={asset?.price || 0} 
                      priceChange={asset?.change || 0} 
                      priceChangePercent={asset?.changePercent || 0} 
                    />
                  </CardContent>
                </Card>
                
                {/* Asset information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">About {asset!.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {asset!.type === 'stock' ? (
                        `${asset!.name} (${asset!.symbol}) is a publicly traded company with a market capitalization of ${formatNumber(asset!.marketCap)}. The stock has seen a ${asset!.changePercent >= 0 ? 'positive' : 'negative'} change of ${asset!.changePercent >= 0 ? '+' : ''}${asset!.changePercent.toFixed(2)}% recently.`
                      ) : (
                        `${asset!.name} (${asset!.symbol}) is a cryptocurrency with a market capitalization of ${formatNumber(asset!.marketCap)}. The price has moved ${asset!.changePercent >= 0 ? 'up' : 'down'} by ${asset!.changePercent >= 0 ? '+' : ''}${asset!.changePercent.toFixed(2)}% recently.`
                      )}
                    </p>
                    
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <LineChart className="h-4 w-4 mr-2" />
                          Trading Statistics
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Current Price:</span>
                            <span className="font-medium">${asset!.price.toFixed(2)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">24h Change:</span>
                            <span className={asset!.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                              {asset!.changePercent >= 0 ? '+' : ''}{asset!.changePercent.toFixed(2)}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Volume:</span>
                            <span>{formatNumber(asset!.volume)}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Market Information
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Market Cap:</span>
                            <span>{formatNumber(asset!.marketCap)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Asset Type:</span>
                            <span className="capitalize">{asset!.type}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Available Stock:</span>
                            <span className={asset!.availableStock !== undefined && asset!.availableStock <= 10 ? "text-amber-500 font-medium" : ""}>
                              {asset!.availableStock !== undefined ? 
                                (asset!.availableStock === 0 ? 
                                  "Out of stock" : 
                                  `${asset!.availableStock} units`) : 
                                "Unlimited"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Trading Status:</span>
                            <span className={asset!.isFrozen ? "text-destructive" : "text-green-500"}>
                              {asset!.isFrozen ? "Frozen" : "Active"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Buy/sell section */}
              <div className="space-y-6">
                {/* Current holdings card */}
                {ownedAsset && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-medium">{ownedAsset.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg. Price:</span>
                          <span className="font-medium">${(ownedAsset.averagePrice || 0).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Value:</span>
                          <span className="font-medium">${(ownedAsset.quantity * asset!.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profit/Loss:</span>
                          <span className={cn(
                            "font-medium",
                            asset!.price > (ownedAsset.averagePrice || 0) ? "text-green-500" : "text-red-500"
                          )}>
                            {ownedAsset.averagePrice ? (((asset!.price - ownedAsset.averagePrice) / ownedAsset.averagePrice) * 100).toFixed(2) : '0.00'}%
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="destructive"
                        className="w-full mt-4"
                        onClick={handleOpenSellModal}
                      >
                        Sell Position
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* Add to cart section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add to Cart</CardTitle>
                    <CardDescription>
                      Current price: ${asset!.price.toFixed(2)} per {asset!.type === 'stock' ? 'share' : 'unit'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Quantity</label>
                      <Input
                        type="number"
                        min="1"
                        max={asset!.availableStock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-full"
                      />
                      {asset!.availableStock !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Max available: {asset!.availableStock}
                        </p>
                      )}
                    </div>
                    
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Cost</div>
                      <div className="text-xl font-bold">${(asset!.price * quantity).toFixed(2)}</div>
                    </div>
                    
                    <Button 
                      onClick={handleAddToCart}
                      disabled={asset!.isFrozen || (asset!.availableStock !== undefined && asset!.availableStock <= 0)}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    
                    {asset!.isFrozen && (
                      <p className="text-xs text-destructive text-center">
                        This asset is currently frozen and cannot be traded.
                      </p>
                    )}
                    
                    {asset!.availableStock !== undefined && asset!.availableStock <= 0 && (
                      <p className="text-xs text-destructive text-center">
                        This asset is currently out of stock.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Sell Modal */}
            {asset && ownedAsset && (
              <SellAssetModal
                isOpen={showSellModal}
                onClose={() => setShowSellModal(false)}
                asset={{
                  id: asset._id,
                  name: asset.name,
                  symbol: asset.symbol,
                  price: asset.price,
                  type: asset.type,
                  availableStock: asset.availableStock
                }}
                ownedQuantity={ownedAsset.quantity}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AssetDetail;
