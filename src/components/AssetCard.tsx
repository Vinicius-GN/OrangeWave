
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowDownRight, ArrowUpRight, DollarSign, Minus, Plus } from "lucide-react";
import { AssetData } from "@/services/marketService";
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: AssetData;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { assets, sellAsset, addAsset } = usePortfolio();
  
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Find if user already owns this asset
  const portfolioAsset = assets.find(a => a.id === asset.id);
  const ownedQuantity = portfolioAsset?.quantity || 0;
  
  const handleBuy = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to buy assets.",
        variant: "destructive"
      });
      return;
    }
    
    const total = asset.price * quantity;
    
    if (total > user.balance.wallet) {
      toast({
        title: "Insufficient funds",
        description: `You need $${total.toLocaleString()} to complete this purchase.`,
        variant: "destructive"
      });
      return;
    }
    
    addAsset({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      logoUrl: asset.logoUrl || asset.logo, // Use logoUrl or logo whichever is available
      quantity,
      averagePrice: asset.price,
      currentPrice: asset.price
    });
    
    toast({
      title: "Purchase successful",
      description: `You bought ${quantity} ${asset.symbol} for $${total.toLocaleString()}.`
    });
    
    setShowBuyDialog(false);
    setQuantity(1);
  };
  
  const handleSell = () => {
    if (!portfolioAsset || ownedQuantity < quantity) {
      toast({
        title: "Insufficient assets",
        description: `You only have ${ownedQuantity} ${asset.symbol} to sell.`,
        variant: "destructive"
      });
      return;
    }
    
    sellAsset(asset.id, quantity, asset.price);
    
    toast({
      title: "Sale successful",
      description: `You sold ${quantity} ${asset.symbol} for $${(asset.price * quantity).toLocaleString()}.`
    });
    
    setShowSellDialog(false);
    setQuantity(1);
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all duration-200"
      onClick={() => navigate(`/asset/${asset.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              {(asset.logoUrl || asset.logo) ? (
                <img src={asset.logoUrl || asset.logo} alt={asset.symbol} className="w-6 h-6" />
              ) : (
                <span className="text-xs font-bold text-primary">{asset.symbol.substring(0, 2)}</span>
              )}
            </div>
            <div>
              <h3 className="font-medium">{asset.symbol}</h3>
              <p className="text-xs text-muted-foreground">{asset.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold">{formatPrice(asset.price)}</div>
            <div className="flex items-center justify-end mt-1">
              <Badge
                className={cn(
                  "rounded-sm py-0 px-1", 
                  asset.changePercent >= 0 
                    ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" 
                    : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                )}
              >
                <span className="flex items-center text-xs">
                  {asset.changePercent >= 0 ? 
                    <ArrowUpRight className="h-3 w-3 mr-0.5" /> : 
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  }
                  {Math.abs(asset.changePercent).toFixed(2)}%
                </span>
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 text-primary border-primary/30 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowBuyDialog(true);
            }}
          >
            Buy
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            className={cn(
              "flex-1",
              ownedQuantity > 0 
                ? "text-primary border-primary/30 hover:bg-primary/10" 
                : "text-muted-foreground border-gray-200 cursor-not-allowed hover:bg-transparent"
            )}
            disabled={ownedQuantity === 0}
            onClick={(e) => {
              e.stopPropagation();
              if (ownedQuantity > 0) {
                setShowSellDialog(true);
              }
            }}
          >
            Sell {ownedQuantity > 0 && `(${ownedQuantity})`}
          </Button>
        </div>
      </CardContent>
      
      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent 
          onClick={(e) => e.stopPropagation()} 
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Buy {asset.symbol}</DialogTitle>
            <DialogDescription>
              Current price: {formatPrice(asset.price)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3 flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-20 rounded-none text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total</Label>
              <div className="col-span-3 flex items-center">
                <span className="font-medium text-lg">
                  {formatPrice(asset.price * quantity)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBuy}
              className="bg-primary hover:bg-primary/90"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Buy Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent 
          onClick={(e) => e.stopPropagation()} 
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Sell {asset.symbol}</DialogTitle>
            <DialogDescription>
              Current price: {formatPrice(asset.price)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sell-quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3 flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="sell-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(ownedQuantity, Number(e.target.value))))}
                  min={1}
                  max={ownedQuantity}
                  className="w-20 rounded-none text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setQuantity(Math.min(ownedQuantity, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">You Own</Label>
              <div className="col-span-3">
                <span className="text-sm">
                  {ownedQuantity} {asset.symbol}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total</Label>
              <div className="col-span-3 flex items-center">
                <span className="font-medium text-lg">
                  {formatPrice(asset.price * quantity)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSell}
              variant="destructive"
            >
              Sell Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AssetCard;
