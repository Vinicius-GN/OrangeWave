
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuantityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  symbol: string;
  price: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity?: number;
  userBalance?: number;
  onBuy: () => void;
  onAddToCart: () => void;
  availableStock?: number;
  assetType?: 'stock' | 'crypto';
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  symbol,
  price,
  quantity,
  setQuantity,
  maxQuantity,
  userBalance,
  onBuy,
  onAddToCart,
  availableStock,
  assetType = 'stock'
}) => {
  const [inputValue, setInputValue] = useState(quantity.toString());
  const totalCost = price * quantity;
  const insufficientFunds = userBalance !== undefined && totalCost > userBalance;
  const exceedsMaxQuantity = maxQuantity !== undefined && quantity > maxQuantity;
  const exceedsAvailableStock = availableStock !== undefined && quantity > availableStock;

  // Update input value when quantity changes externally
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // Adjust quantity if it exceeds available stock when component mounts or availableStock changes
  useEffect(() => {
    if (availableStock !== undefined && quantity > availableStock) {
      setQuantity(availableStock);
    }
  }, [availableStock, setQuantity, quantity]);

  // Handle quantity input change with support for fractional amounts in crypto
  const handleQuantityChange = (value: string) => {
    setInputValue(value);
    
    // Parse the value based on asset type
    let parsedValue: number;
    if (assetType === 'crypto') {
      // Allow fractional amounts for crypto
      parsedValue = parseFloat(value) || 0;
    } else {
      // Only whole numbers for stocks
      parsedValue = parseInt(value) || 0;
    }
    
    // Ensure minimum value
    if (parsedValue < (assetType === 'crypto' ? 0.00000001 : 1)) {
      parsedValue = assetType === 'crypto' ? 0.00000001 : 1;
    }
    
    // Apply stock limit if available
    if (availableStock !== undefined) {
      parsedValue = Math.min(parsedValue, availableStock);
    }
    
    setQuantity(parsedValue);
  };

  // Handle input blur to format the value correctly
  const handleInputBlur = () => {
    const parsedValue = assetType === 'crypto' ? parseFloat(inputValue) : parseInt(inputValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      const defaultValue = assetType === 'crypto' ? 0.00000001 : 1;
      setQuantity(defaultValue);
      setInputValue(defaultValue.toString());
    } else {
      setInputValue(quantity.toString());
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">
              Quantity {assetType === 'crypto' ? '(supports fractional amounts)' : '(whole numbers only)'}
            </Label>
            <Input 
              id="quantity" 
              type="number" 
              step={assetType === 'crypto' ? "0.00000001" : "1"}
              min={assetType === 'crypto' ? "0.00000001" : "1"}
              max={availableStock !== undefined ? availableStock : undefined}
              value={inputValue} 
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={handleInputBlur}
              className="col-span-3" 
              placeholder={assetType === 'crypto' ? "0.00000001" : "1"}
            />
            {availableStock !== undefined && (
              <div className="text-sm text-muted-foreground">
                Available stock: {availableStock} units
              </div>
            )}
            {assetType === 'crypto' && (
              <div className="text-xs text-muted-foreground">
                Tip: You can purchase fractional amounts of cryptocurrencies
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Price per unit:</div>
            <div className="font-medium">${price.toFixed(2)}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Total cost:</div>
            <div className="font-bold">${totalCost.toFixed(2)}</div>
          </div>
          
          {userBalance !== undefined && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Your balance:</div>
              <div className="font-medium">${userBalance.toFixed(2)}</div>
            </div>
          )}
          
          {insufficientFunds && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Insufficient funds. Please deposit more or reduce quantity.
              </AlertDescription>
            </Alert>
          )}
          
          {exceedsMaxQuantity && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maximum quantity exceeded. You can buy up to {maxQuantity} units.
              </AlertDescription>
            </Alert>
          )}
          
          {exceedsAvailableStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Not enough stock available. Only {availableStock} units in stock.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onAddToCart()} 
            className="w-full sm:w-auto"
            disabled={insufficientFunds || exceedsMaxQuantity || exceedsAvailableStock || quantity <= 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to cart
          </Button>
          
          <Button 
            onClick={() => onBuy()} 
            className="w-full sm:w-auto"
            disabled={insufficientFunds || exceedsMaxQuantity || exceedsAvailableStock || quantity <= 0}
          >
            Buy now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityModal;
