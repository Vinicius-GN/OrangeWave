
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
import { getAssetById, getPriceHistory, PricePoint, AssetData as MarketAssetData } from '@/services/marketService';
import { cn } from '@/lib/utils';
import SellAssetModal from '@/components/SellAssetModal';
import QuantityModal from '@/components/QuantityModal';

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

// Update the AssetData interface to match the one from marketService
interface AssetData {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto'; // Removed 'etf' and 'other'
  price: number;
  changePercent: number;
  change: number;
  marketCap: number;
  volume: number;
  logo?: string;
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
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [ownedAsset, setOwnedAsset] = useState<any>(null);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const { user } = useAuth();
  const { assets, getAssetById: getPortfolioAsset } = usePortfolio();
  const { toast } = useToast();
  const { addToCart } = useCart();

    // ----------------------------  Function to make a GET request to Beeceptor -> As asked in the MIlestone 2 ---------------------------- 
  const fetchProductFromBeeceptor = async () => {
  try {
    const response = await fetch("https://orangewave.free.beeceptor.com/produto/123", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log("GET static response from Beeceptor:", data);
    return data;
  } catch (error) {
    console.error("GET to Beeceptor failed:", error);
    return null;
  }
};
  
  useEffect(() => {
    const loadAssetData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Load asset data
        const assetData = await getAssetById(id);
        
        if (!assetData) {
          toast({
            title: "Asset not found",
            description: "The requested asset could not be found.",
            variant: "destructive"
          });
          return;
        }
        
        // Convert the service type to our local type - ensure it's one of our supported types
        if (assetData.type !== 'stock' && assetData.type !== 'crypto') {
          // If the asset type is 'etf' or 'other', convert to 'stock' as fallback
          assetData.type = 'stock';
        }
        
        const convertedAssetData: AssetData = {
          ...assetData,
          type: assetData.type as 'stock' | 'crypto',
          availableStock: assetData.availableStock
        };
        
        setAsset(convertedAssetData);

        // Fetch product from Beeceptor
        await fetchProductFromBeeceptor();

        
        // Check if the user owns this asset
        if (user) {
          const owned = getPortfolioAsset(id);
          setOwnedAsset(owned);
        }
        
        // Load price history
        const history = await getPriceHistory(id, timeframe);
        setPriceHistory(history);
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
  }, [id, timeframe, user, toast, getPortfolioAsset]);
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      // Respect available stock
      if (asset?.availableStock !== undefined) {
        setQuantity(Math.min(value, asset.availableStock));
      } else {
        setQuantity(value);
      }
    }
  };
  
  // Handle adding to cart
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
    if (asset.availableStock !== undefined && quantity > asset.availableStock) {
      toast({
        title: "Not enough stock",
        description: `Only ${asset.availableStock} units of ${asset.symbol} are available.`,
        variant: "destructive"
      });
      setQuantity(asset.availableStock);
      return;
    }
    
    // Add to cart
    addToCart({
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      quantity: quantity,
      price: asset.price
    });
    
    // Close buy modal if open
    setShowBuyModal(false);
  };

  // Handle opening buy modal
  const handleOpenBuyModal = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to buy assets.",
        variant: "destructive"
      });
      return;
    }
    
    if (asset?.isFrozen) {
      toast({
        title: "Trading restricted",
        description: `${asset.name} is currently frozen and cannot be traded.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if there's available stock
    if (asset?.availableStock !== undefined && asset.availableStock <= 0) {
      toast({
        title: "Out of stock",
        description: `${asset.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }
    
    setShowBuyModal(true);
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
  
  // Handle direct buy
  const handleBuy = () => {
    // Implementation would be similar to handleAddToCart but with immediate purchase logic
    handleAddToCart();
    // Navigate to cart for checkout
    if (asset) {
      toast({
        title: "Added to cart",
        description: `${quantity} ${asset.symbol} added. Proceed to checkout.`,
      });
    }
  };
  
  // Format the total cost
  const totalCost = asset ? asset.price * quantity : 0;
  
  // Check if the asset is loaded
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
                {(asset.logoUrl || asset.logo) && (
                  <img 
                    src={asset.logoUrl || asset.logo} 
                    alt={asset.name} 
                    className="w-12 h-12 mr-4 rounded-full bg-background object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {asset.name} 
                    <span className="text-xl text-muted-foreground">({asset.symbol})</span>
                    {asset.isFrozen && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Frozen
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-medium">${asset.price.toFixed(2)}</span>
                    <span 
                      className={cn(
                        "ml-2 flex items-center text-sm",
                        asset.changePercent >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {asset.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Asset stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="font-medium">{formatNumber(asset.marketCap)}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="font-medium">{formatNumber(asset.volume)}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Available Stock</div>
                  <div className="font-medium flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    {asset.availableStock !== undefined ? asset.availableStock : 'Unlimited'}
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
                    <Tabs defaultValue={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                      
                      <TabsContent value="day">
                        <PriceChart assetId={id || ""} currentPrice={asset?.price || 0} priceChange={asset?.change || 0} priceChangePercent={asset?.changePercent || 0} />
                      </TabsContent>
                      <TabsContent value="week">
                        <PriceChart assetId={id || ""} currentPrice={asset?.price || 0} priceChange={asset?.change || 0} priceChangePercent={asset?.changePercent || 0} />
                      </TabsContent>
                      <TabsContent value="month">
                        <PriceChart assetId={id || ""} currentPrice={asset?.price || 0} priceChange={asset?.change || 0} priceChangePercent={asset?.changePercent || 0} />
                      </TabsContent>
                      <TabsContent value="year">
                        <PriceChart assetId={id || ""} currentPrice={asset?.price || 0} priceChange={asset?.change || 0} priceChangePercent={asset?.changePercent || 0} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                {/* Asset information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">About {asset.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {asset.type === 'stock' ? (
                        `${asset.name} (${asset.symbol}) is a publicly traded company with a market capitalization of ${formatNumber(asset.marketCap)}. The stock has seen a ${asset.changePercent >= 0 ? 'positive' : 'negative'} change of ${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}% recently.`
                      ) : (
                        `${asset.name} (${asset.symbol}) is a cryptocurrency with a market capitalization of ${formatNumber(asset.marketCap)}. The price has moved ${asset.changePercent >= 0 ? 'up' : 'down'} by ${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}% recently.`
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
                            <span className="font-medium">${asset.price.toFixed(2)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">24h Change:</span>
                            <span className={asset.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Volume:</span>
                            <span>{formatNumber(asset.volume)}</span>
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
                            <span>{formatNumber(asset.marketCap)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Asset Type:</span>
                            <span className="capitalize">{asset.type}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Available Stock:</span>
                            <span className={asset.availableStock !== undefined && asset.availableStock <= 10 ? "text-amber-500 font-medium" : ""}>
                              {asset.availableStock !== undefined ? 
                                (asset.availableStock === 0 ? 
                                  "Out of stock" : 
                                  `${asset.availableStock} units`) : 
                                "Unlimited"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Trading Status:</span>
                            <span className={asset.isFrozen ? "text-destructive" : "text-green-500"}>
                              {asset.isFrozen ? "Frozen" : "Active"}
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
                          <span className="font-medium">${ownedAsset.averagePrice.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Value:</span>
                          <span className="font-medium">${(ownedAsset.quantity * asset.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profit/Loss:</span>
                          <span className={cn(
                            "font-medium",
                            asset.price > ownedAsset.averagePrice ? "text-green-500" : "text-red-500"
                          )}>
                            {(((asset.price - ownedAsset.averagePrice) / ownedAsset.averagePrice) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Buy card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Add to Cart</CardTitle>
                    <CardDescription>
                      ${asset.price.toFixed(2)} per {asset.type === 'stock' ? 'share' : 'unit'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">
                          Quantity
                        </label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={asset.availableStock}
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-full"
                        />
                        {asset.availableStock !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Available: {asset.availableStock} units
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">${totalCost.toFixed(2)}</span>
                      </div>
                      
                      {asset.availableStock !== undefined && asset.availableStock <= 0 && (
                        <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>This asset is currently out of stock.</span>
                        </div>
                      )}
                      
                      {asset.availableStock !== undefined && asset.availableStock > 0 && asset.availableStock <= 5 && (
                        <div className="flex items-center p-3 rounded-md bg-amber-500/10 text-amber-600 text-sm">
                          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Low stock! Only {asset.availableStock} units remaining.</span>
                        </div>
                      )}
                      
                      {asset.isFrozen && (
                        <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Trading for this asset is currently restricted by the administrator.</span>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full" 
                        onClick={handleAddToCart}
                        disabled={asset.isFrozen || (asset.availableStock !== undefined && asset.availableStock <= 0) || (asset.availableStock !== undefined && quantity > asset.availableStock)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>

                      {/* Sell button */}
                      {ownedAsset && ownedAsset.quantity > 0 && (
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700" 
                          onClick={handleOpenSellModal}
                          disabled={asset.isFrozen}
                        >
                          Sell
                        </Button>
                      )}
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Added items will be reserved in your cart for 15 minutes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Price alerts card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Related Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link to="/market">
                          <DollarSign className="h-4 w-4 mr-2" />
                          View all {asset.type === 'stock' ? 'stocks' : 'cryptocurrencies'}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link to="/dashboard">
                          <LineChart className="h-4 w-4 mr-2" />
                          Go to your dashboard
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sell Modal */}
            {asset && ownedAsset && (
              <SellAssetModal 
                isOpen={showSellModal}
                onClose={() => setShowSellModal(false)}
                asset={asset}
                ownedQuantity={ownedAsset.quantity}
              />
            )}
            
            {/* Buy Modal */}
            {asset && (
              <QuantityModal
                open={showBuyModal}
                onOpenChange={setShowBuyModal}
                title={`Buy ${asset.name}`}
                description={`You are about to purchase ${asset.name} (${asset.symbol})`}
                symbol={asset.symbol}
                price={asset.price}
                quantity={quantity}
                setQuantity={setQuantity}
                userBalance={user?.balance?.wallet}
                onBuy={handleBuy}
                onAddToCart={handleAddToCart}
                availableStock={asset.availableStock}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AssetDetail;
