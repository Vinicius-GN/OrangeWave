
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { incrementStock } from '@/services/stockService';

interface SellAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    type: 'stock' | 'crypto';
    availableStock?: number;
  };
  ownedQuantity: number;
}

const SellAssetModal = ({ isOpen, onClose, asset, ownedQuantity }: SellAssetModalProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { sellAsset } = usePortfolio();
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
    }
  }, [isOpen]);

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
      
      // Validate against owned quantity
      if (value > ownedQuantity) {
        setError(`You only own ${ownedQuantity} ${asset.symbol}`);
      } else {
        setError(null);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    
    if (quantity > ownedQuantity) {
      setError(`You only own ${ownedQuantity} ${asset.symbol}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call the sellAsset function from the portfolio context
      await sellAsset(asset.id, quantity, asset.price);
      
      // Update stock quantity after successful sale
      incrementStock(asset.id, quantity, asset.availableStock);
      
      toast({
        title: 'Asset sold successfully',
        description: `You sold ${quantity} ${asset.symbol} for $${(quantity * asset.price).toFixed(2)}`,
      });
      
      onClose();
    } catch (err) {
      console.error('Error selling asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to sell asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total sale amount
  const totalSaleAmount = asset.price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell {asset.name}</DialogTitle>
          <DialogDescription>
            Current price: ${asset.price.toFixed(2)} per {asset.type === 'stock' ? 'share' : 'unit'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity (You own: {ownedQuantity})</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={ownedQuantity}
              value={quantity}
              onChange={handleQuantityChange}
              className="col-span-3"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label>Total Sale Amount</Label>
            <div className="text-2xl font-bold">${totalSaleAmount.toFixed(2)}</div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || quantity <= 0 || quantity > ownedQuantity}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Processing...' : 'Sell Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellAssetModal;
