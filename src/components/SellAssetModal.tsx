/**
 * @file SellAssetModal.tsx
 * @brief React component that displays a modal for selling assets.
 *
 * This component provides a form interface for the user
 * to specify the quantity of an asset they wish to sell. Upon submission,
 * it creates the sell order, updates the wallet balance, adjusts the
 * available asset stock, and updates the portfolio position.
 */

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

/**
 * @brief Base URL for backend API calls.
 */
const API_URL = 'http://localhost:3001/api';

/**
 * @interface SellAssetModalProps
 * @brief Props for the SellAssetModal component.
 *
 * @param isOpen          Controls whether the modal is open (true) or closed (false).
 * @param onClose         Callback to close the modal.
 * @param asset           Object containing data for the asset to sell:
 *                         - id: unique identifier
 *                         - name: display name
 *                         - symbol: asset ticker
 *                         - price: unit price in USD
 *                         - type: 'stock' or 'crypto'
 *                         - availableStock?: amount available in the market
 * @param ownedQuantity   Quantity of the asset the user currently owns.
 */
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

/**
 * @brief Modal component for executing an asset sale.
 *
 * Renders a dialog with quantity input and total cost display.
 * Executes all backend operations upon confirmation.
 *
 * @param props.isOpen          Flag to open/close the modal.
 * @param props.onClose         Callback when modal should close.
 * @param props.asset           Asset data for the sale.
 * @param props.ownedQuantity   Maximum quantity the user can sell.
 * @returns JSX.Element        React element for the sell modal.
 */
const SellAssetModal = ({
  isOpen,
  onClose,
  asset,
  ownedQuantity,
}: SellAssetModalProps) => {
  /** @brief Number of units the user intends to sell. */
  const [quantity, setQuantity] = useState<number>(1);
  /** @brief Submission state to disable buttons while processing. */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  /** @brief Error message for validation or network failures. */
  const [error, setError] = useState<string | null>(null);

  /** @brief Authentication context providing the logged-in user object. */
  const { user } = useAuth();
  /** @brief Custom hook to refresh the wallet balance after sale. */
  const { refreshBalance } = useBalance();
  /** @brief Hook to display toast notifications. */
  const { toast } = useToast();
  /** @brief React Router hook for navigation after sale. */
  const navigate = useNavigate();

  /**
   * @brief Constructs authentication headers for HTTP requests.
   *
   * Retrieves the JWT token from localStorage and includes it
   * in the Authorization header if present.
   *
   * @returns Record<string, string> Headers including Content-Type and optionally Authorization.
   */
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  /**
   * @brief Resets the form state whenever the modal is opened.
   *
   * Ensures quantity returns to 1 and clears any existing error messages.
   */
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
    }
  }, [isOpen]);

  /**
   * @brief Validates and updates the quantity as the user types.
   *
   * - Parses the input string to an integer.
   * - Guarantees a positive number.
   * - Sets an error if the value exceeds the ownedQuantity.
   *
   * @param e React change event from the quantity input.
   */
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v > 0) {
      setQuantity(v);
      setError(v > ownedQuantity ? `You only own ${ownedQuantity}` : null);
    }
  };

  /**
   * @brief Creates a sell order in the backend.
   *
   * Populates order details including userId, assetId, quantity, price, and timestamp.
   *
   * @throws {Error} If the HTTP response is not ok.
   * @returns Promise<any> JSON data returned by the API.
   */
  const createSellOrder = async (): Promise<any> => {
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
    if (!res.ok) {
      throw new Error('Failed to create sell order');
    }
    return res.json();
  };

  /**
   * @brief Updates the user's wallet balance after the sale.
   *
   * Sends a deposit request with the total sale amount.
   *
   * @param amount Amount in USD to credit to the wallet.
   * @throws {Error} If the HTTP response is not ok.
   * @returns Promise<any> JSON data returned by the API.
   */
  const updateWalletBalance = async (amount: number): Promise<any> => {
    const res = await fetch(`${API_URL}/wallet/${user!._id}/deposit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, paymentMethod: 'sale' }),
    });
    if (!res.ok) {
      const errBody = await res.json();
      throw new Error(errBody.message || 'Failed to update wallet');
    }
    return res.json();
  };

  /**
   * @brief Updates the available asset stock in the backend.
   *
   * Adds the sold quantity back into the asset's availableStock.
   *
   * @param soldQty Quantity sold to restock.
   * @throws {Error} If the HTTP response is not ok.
   */
  const updateAssetStock = async (soldQty: number): Promise<void> => {
    const res = await fetch(`${API_URL}/assets/${asset.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        availableStock: (asset.availableStock || 0) + soldQty,
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to update asset stock');
    }
  };

  /**
   * @brief Updates or removes the user's portfolio position after sale.
   *
   * 1) Fetches the current portfolio.
   * 2) Finds the entry for this asset.
   * 3) If remaining quantity > 0, updates via POST with new quantity.
   * 4) If zero remains, removes the position via DELETE.
   *
   * @param assetId ID of the portfolio asset.
   * @param soldQty Quantity sold for position adjustment.
   * @throws {Error} If any fetch operation fails.
   */
  const removeFromPortfolio = async (
    assetId: string,
    soldQty: number
  ): Promise<void> => {
    // 1) Fetch portfolio
    const listRes = await fetch(`${API_URL}/portfolio/${user!._id}`, {
      headers: getAuthHeaders(),
    });
    if (!listRes.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    const portfolio: Array<{
      assetId: string;
      symbol: string;
      quantity: number;
      buyPrice: number;
    }> = await listRes.json();

    // 2) Find the asset entry
    const entry = portfolio.find((p) => p.assetId === assetId);
    if (!entry) return; // Nothing to do

    const remaining = entry.quantity - soldQty;

    if (remaining > 0) {
      // 3a) Update position if units remain
      const updRes = await fetch(`${API_URL}/portfolio/${user!._id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assetId,
          symbol: entry.symbol,
          type: asset.type,
          quantity: remaining,
          buyPrice: entry.buyPrice,
        }),
      });
      if (!updRes.ok) {
        throw new Error('Failed to update portfolio');
      }
    } else {
      // 3b) Remove position if no units remain
      const delRes = await fetch(
        `${API_URL}/portfolio/${user!._id}/${entry.symbol}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      if (!delRes.ok) {
        throw new Error('Failed to remove from portfolio');
      }
    }
  };

  /**
   * @brief Form submission handler for selling the asset.
   *
   * Validates quantity, creates the sell order, updates balance, stock, portfolio,
   * displays success toast or captures error for display.
   *
   * @param e Form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Immediate quantity validation
    if (quantity < 1 || quantity > ownedQuantity) {
      setError('Invalid quantity');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1) Create sell order
      await createSellOrder();

      // 2) Compute total sale amount
      const saleAmt = quantity * asset.price;

      // 3) Credit user wallet
      await updateWalletBalance(saleAmt);

      // 4) Restock asset
      await updateAssetStock(quantity);

      // 5) Adjust portfolio position
      await removeFromPortfolio(asset.id, quantity);

      // 6) Refresh balance in frontend
      await refreshBalance();

      // 7) Notify user and close modal
      toast({
        title: 'Sold!',
        description: `You sold ${quantity} ${asset.symbol}`,
      });
      onClose();

      // 8) Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** @brief Renders the sell modal JSX. */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sell {asset.name}</DialogTitle>
          <DialogDescription>
            Price: ${asset.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        {/* Sell form */}
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
