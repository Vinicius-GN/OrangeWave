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
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/api/useBalance';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

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

const SellAssetModal = ({
  isOpen,
  onClose,
  asset,
  ownedQuantity,
}: SellAssetModalProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshBalance } = useBalance();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
    }
  }, [isOpen]);

  // Real-time validation for quantity limits
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v > 0) {
      setQuantity(v);
      setError(v > ownedQuantity ? `You only own ${ownedQuantity}` : null);
    }
  };

  const createSellOrder = async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: user!._id,
        assetId: asset.id,
        assetName: asset.name,
        symbol: asset.symbol,
        type: asset.type,
        quantity,
        price: asset.price,
        total: asset.price * quantity,
        fees: 0,
        status: 'completed',
        timestamp: new Date().toISOString(),
        side: 'sell',
      }),
    });
    if (!res.ok) throw new Error('Failed to create sell order');
    return res.json();
  };

  const updateWalletBalance = async (amount: number) => {
    const res = await fetch(`${API_URL}/wallet/${user!._id}/deposit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, paymentMethod: 'sale' }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update wallet');
    }
    return res.json();
  };

  const updateAssetStock = async (soldQty: number) => {
    const res = await fetch(`${API_URL}/assets/${asset.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        availableStock: (asset.availableStock || 0) + soldQty,
      }),
    });
    if (!res.ok) throw new Error('Failed to update asset stock');
  };

  // Portfolio management: update or remove position after sale
  const removeFromPortfolio = async (assetId: string, soldQty: number) => {
    // 1) Fetch current portfolio to get existing position
    const listRes = await fetch(
      `${API_URL}/portfolio/${user!._id}`,
      { headers: getAuthHeaders() }
    );
    if (!listRes.ok) throw new Error('Failed to fetch portfolio');
    const portfolio: Array<{
      assetId: string;
      symbol: string;
      quantity: number;
      buyPrice: number;
    }> = await listRes.json();

    // 2) Find the entry for this asset
    const entry = portfolio.find((p) => p.assetId === assetId);
    if (!entry) return; // Nothing to do if position doesn't exist

    const remaining = entry.quantity - soldQty;

    if (remaining > 0) {
      // 3a) If shares remain, update position via POST
      const updRes = await fetch(
        `${API_URL}/portfolio/${user!._id}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            assetId,
            symbol: entry.symbol,
            type: asset.type,
            quantity: remaining,
            buyPrice: entry.buyPrice, // Maintain original average price
          }),
        }
      );
      if (!updRes.ok) throw new Error('Failed to update portfolio');
    } else {
      // 3b) If all shares sold, remove position entirely via DELETE
      const delRes = await fetch(
        `${API_URL}/portfolio/${user!._id}/${entry.symbol}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!delRes.ok) throw new Error('Failed to remove from portfolio');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || quantity > ownedQuantity) {
      setError('Invalid quantity');
      return;
    }

    try {
      setIsSubmitting(true);
      await createSellOrder();
      const saleAmt = quantity * asset.price;
      await updateWalletBalance(saleAmt);
      await updateAssetStock(quantity);
      await removeFromPortfolio(asset.id, quantity);
      await refreshBalance();

      toast({
        title: 'Sold!',
        description: `You sold ${quantity} ${asset.symbol}`,
      });
      onClose();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell {asset.name}</DialogTitle>
          <DialogDescription>
            Price: ${asset.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="qty">Quantity (You own: {ownedQuantity})</Label>
            <Input
              id="qty"
              type="number"
              min="1"
              max={ownedQuantity}
              value={quantity}
              onChange={handleQuantityChange}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Total</Label>
            <div className="text-2xl font-bold">
              ${(asset.price * quantity).toFixed(2)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Processing…' : 'Sell Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellAssetModal;

