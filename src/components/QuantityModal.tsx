/**
 * @file QuantityModal.tsx
 * @brief Modal component for selecting quantity and purchasing or adding assets to cart.
 *
 * This React component presents a dialog that allows the user to:
 *  - Enter the desired quantity of an asset (stock or cryptocurrency)
 *  - View unit price and total cost in real time
 *  - Receive immediate feedback on validation issues (insufficient funds, exceeding limits, stock availability)
 *  - Choose between two primary actions: “Add to cart” or “Buy now”
 * 
 * The component supports both integer-only quantities for stocks and fractional quantities for crypto.
 * It enforces minimum and maximum constraints, automatically adjusts to available stock,
 * and synchronizes its internal input display with externally controlled quantity state.
 * Visual alerts are rendered for any validation breaches.
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * @interface QuantityModalProps
 * @brief Defines the props accepted by the QuantityModal component.
 *
 * @param open              Boolean flag indicating if the modal is visible (true) or hidden (false).
 * @param onOpenChange      Callback invoked when the modal open/close state changes.
 * @param title             Title string displayed at the top of the modal.
 * @param description?      Optional description text shown below the title.
 * @param symbol            Asset ticker symbol (e.g., "AAPL" or "BTC").
 * @param price             Current unit price of the asset in USD.
 * @param quantity          Currently selected quantity (controlled by parent component).
 * @param setQuantity       Function provided by parent to update the quantity state.
 * @param maxQuantity?      Optional upper limit on quantity (e.g., portfolio max buy amount).
 * @param userBalance?      Optional user wallet balance, for validating sufficient funds.
 * @param onBuy             Callback to execute when “Buy now” is clicked.
 * @param onAddToCart       Callback to execute when “Add to cart” is clicked.
 * @param availableStock?   Optional available market stock for the asset.
 * @param assetType?        Asset type: 'stock' (integer only) or 'crypto' (fractional allowed).
 */
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

/**
 * @brief Main component rendering the quantity selection modal.
 *
 * This component:
 *  1. Initializes internal input state synced with external quantity.
 *  2. Calculates derived values: total cost, insufficient funds, limit breaches, stock breaches.
 *  3. Enforces constraints on quantity editing (min, max, stock).
 *  4. Displays the unit price, total cost, and user balance (if provided).
 *  5. Renders contextual Alerts for any validation errors.
 *  6. Provides two action buttons: Add to cart and Buy now, which are disabled if any validation fails.
 *
 * @param props.open             Controls modal visibility.
 * @param props.onOpenChange     Handler to toggle open state.
 * @param props.title            Modal header title.
 * @param props.description?     Optional subtitle/description.
 * @param props.symbol           Asset symbol displayed for context.
 * @param props.price            USD unit price used in cost calculations.
 * @param props.quantity         External quantity value (controlled input).
 * @param props.setQuantity      Setter function to update external quantity.
 * @param props.maxQuantity?     Upper cap for quantity (e.g., trading limits).
 * @param props.userBalance?     User’s available funds for purchase validation.
 * @param props.onBuy            Function to run when purchasing immediately.
 * @param props.onAddToCart      Function to run when adding to shopping cart.
 * @param props.availableStock?  Available asset supply to enforce max purchase/quantity.
 * @param props.assetType?       Type of asset, affecting min value and parsing rules.
 * @returns JSX.Element         The complete modal element with header, body, alerts, and footer.
 */
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
  assetType = 'stock',
}) => {
  /** @brief String state for the input field, kept in sync with numeric quantity. */
  const [inputValue, setInputValue] = useState<string>(quantity.toString());

  /** @brief Derived total cost based on input quantity and unit price. */
  const totalCost = price * quantity;

  /** @brief True if userBalance exists and totalCost exceeds it. */
  const insufficientFunds =
    userBalance !== undefined && totalCost > userBalance;

  /** @brief True if maxQuantity exists and quantity is above that limit. */
  const exceedsMaxQuantity =
    maxQuantity !== undefined && quantity > maxQuantity;

  /** @brief True if availableStock exists and quantity exceeds availableStock. */
  const exceedsAvailableStock =
    availableStock !== undefined && quantity > availableStock;

  /**
   * @brief Keep inputValue in sync when the external quantity prop changes.
   *
   * Ensures the visible string input always reflects the numeric `quantity`.
   */
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  /**
   * @brief Automatically clamp quantity to availableStock if exceeded.
   *
   * Runs whenever availableStock or quantity changes.
   */
  useEffect(() => {
    if (
      availableStock !== undefined &&
      quantity > availableStock
    ) {
      setQuantity(availableStock);
    }
  }, [availableStock, setQuantity, quantity]);

  /**
   * @brief Handler invoked on each change to the quantity input field.
   *
   * 1. Updates the raw inputValue string.
   * 2. Parses into number (float for crypto, int for stock).
   * 3. Enforces a minimum (0.00000001 for crypto, 1 for stock).
   * 4. Enforces availableStock upper bound if provided.
   * 5. Calls setQuantity with the resulting sanitized numeric value.
   *
   * @param value  The raw string from the input field.
   */
  const handleQuantityChange = (value: string) => {
    setInputValue(value);
    let parsedValue: number;

    if (assetType === 'crypto') {
      parsedValue = parseFloat(value) || 0;
    } else {
      parsedValue = parseInt(value, 10) || 0;
    }

    const minValue = assetType === 'crypto' ? 0.00000001 : 1;
    if (parsedValue < minValue) {
      parsedValue = minValue;
    }

    if (availableStock !== undefined) {
      parsedValue = Math.min(parsedValue, availableStock);
    }

    setQuantity(parsedValue);
  };

  /**
   * @brief Handler for input blur event to enforce formatting and fallback.
   *
   * - Parses the raw inputValue to number (float or int).
   * - If invalid or <= 0, resets to minimum default.
   * - Otherwise, re-syncs inputValue to match sanitized `quantity`.
   */
  const handleInputBlur = () => {
    const parsed = assetType === 'crypto'
      ? parseFloat(inputValue)
      : parseInt(inputValue, 10);
    const minDefault = assetType === 'crypto' ? 0.00000001 : 1;

    if (isNaN(parsed) || parsed <= 0) {
      setQuantity(minDefault);
      setInputValue(minDefault.toString());
    } else {
      setInputValue(quantity.toString());
    }
  };

  /** @brief Renders the modal dialog JSX structure. */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Modal content with defined max width and auto-scrolling */}
      <DialogContent className="sm:max-w-[425px]">
        {/* Header section: title and optional description */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Body section: inputs, derived values, and alerts */}
        <div className="grid gap-4 py-4">
          {/* Quantity input block with dynamic label */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">
              Quantity{' '}
              {assetType === 'crypto'
                ? '(supports fractional amounts)'
                : '(whole numbers only)'}
            </Label>
            <Input
              id="quantity"
              type="number"
              step={assetType === 'crypto' ? '0.00000001' : '1'}
              min={assetType === 'crypto' ? '0.00000001' : '1'}
              max={availableStock ?? undefined}
              value={inputValue}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={handleInputBlur}
              className="col-span-3"
              placeholder={assetType === 'crypto' ? '0.00000001' : '1'}
            />
            {/* Display available stock info if provided */}
            {availableStock !== undefined && (
              <div className="text-sm text-muted-foreground">
                Available stock: {availableStock} units
              </div>
            )}
            {/* Tip for crypto fractional purchases */}
            {assetType === 'crypto' && (
              <div className="text-xs text-muted-foreground">
                Tip: You can purchase fractional amounts of cryptocurrencies
              </div>
            )}
          </div>

          {/* Unit price display */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Price per unit:
            </div>
            <div className="font-medium">${price.toFixed(2)}</div>
          </div>

          {/* Total cost display */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Total cost:</div>
            <div className="font-bold">${totalCost.toFixed(2)}</div>
          </div>

          {/* User balance display if provided */}
          {userBalance !== undefined && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Your balance:
              </div>
              <div className="font-medium">
                ${userBalance.toFixed(2)}
              </div>
            </div>
          )}

          {/* Validation alerts */}
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
                Maximum quantity exceeded. You can buy up to {maxQuantity}{' '}
                units.
              </AlertDescription>
            </Alert>
          )}
          {exceedsAvailableStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Not enough stock available. Only {availableStock} units in
                stock.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer section: action buttons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onAddToCart()}
            className="w-full sm:w-auto"
            disabled={
              insufficientFunds ||
              exceedsMaxQuantity ||
              exceedsAvailableStock ||
              quantity <= 0
            }
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to cart
          </Button>
          <Button
            onClick={() => onBuy()}
            className="w-full sm:w-auto"
            disabled={
              insufficientFunds ||
              exceedsMaxQuantity ||
              exceedsAvailableStock ||
              quantity <= 0
            }
          >
            Buy now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityModal;
