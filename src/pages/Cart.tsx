import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useBalance } from '@/hooks/api/useBalance';
import { fetchAssetById } from '@/services/marketService';

const API_URL = 'http://localhost:3001/api';

// CartPage component manages the user's shopping cart, checkout, and payment logic
const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  // Get current user
  const { user } = useAuth();
  // Get and refresh user balance
  const { balance, refreshBalance } = useBalance();
  // Used to trigger portfolio refresh after purchase
  const { forceRefresh } = usePortfolio();
  // Navigation hook for redirecting after checkout
  const navigate = useNavigate();
  // Toast for showing notifications
  const { toast } = useToast();
  // State for selected payment method
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'credit_card'>('balance');
  // State to indicate if checkout is processing
  const [isProcessing, setIsProcessing] = useState(false);
  // State for tracking available stock for each asset in cart
  const [stockLimits, setStockLimits] = useState<Record<string, number>>({});
  // Loading state for fetching stock limits
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  // State for quantity input fields for each cart item
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  // State to check if user has a credit card on file
  const [hasCreditCard, setHasCreditCard] = useState(false);
  // Loading state for credit card info
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  // State for storing masked credit card info
  const [cardInfo, setCardInfo] = useState<{ maskedNumber?: string } | null>(null);
  
  // Calculate total price of all items in cart
  const total = getCartTotal();

  // Get authentication token
  const getAuthToken = () => localStorage.getItem('authToken');
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch credit card information
  useEffect(() => {
    const fetchCardInfo = async () => {
      if (!user) return;
      
      setIsLoadingCard(true);
      try {
        const response = await fetch(`${API_URL}/wallet/${user._id}/balance`, {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data: { cardNumber?: string } = await response.json();
          if (data && data.cardNumber) {
            setHasCreditCard(true);
            // Create masked version for display
            const maskedNumber = data.cardNumber.replace(/\d(?=\d{4})/g, '*');
            setCardInfo({ maskedNumber });
          } else {
            setHasCreditCard(false);
            setCardInfo(null);
          }
        } else {
          setHasCreditCard(false);
          setCardInfo(null);
        }
      } catch (error) {
        console.error('Error fetching card info:', error);
        setHasCreditCard(false);
        setCardInfo(null);
      } finally {
        setIsLoadingCard(false);
      }
    };
    
    fetchCardInfo();
  }, [user]);

  // Initialize quantity inputs when items change
  useEffect(() => {
    const newQuantityInputs: Record<string, string> = {};
    items.forEach(item => {
      newQuantityInputs[item.id] = item.quantity.toString();
    });
    setQuantityInputs(newQuantityInputs);
  }, [items]);
  
  // Fetch stock information for all items in the cart
  useEffect(() => {
    const fetchStockData = async () => {
      if (items.length === 0) {
        setIsLoadingStock(false);
        return;
      }

      setIsLoadingStock(true);
      const limits: Record<string, number> = {};
      
      try {
        for (const item of items) {
          const assetData = await fetchAssetById(item.assetId);
          if (assetData && assetData.availableStock !== undefined) {
            limits[item.id] = assetData.availableStock;
            
            if (item.quantity > assetData.availableStock) {
              updateQuantity(item.id, assetData.availableStock);
              toast({
                title: "Quantity adjusted",
                description: `${item.symbol} quantity has been adjusted to match available stock.`,
                variant: "default"
              });
            }
          } else {
            limits[item.id] = 9999;
          }
        }
        
        setStockLimits(limits);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast({
          title: "Error loading stock data",
          description: "Could not verify available stock. Some quantities may be limited.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStock(false);
      }
    };
    
    fetchStockData();
  }, [items, updateQuantity, toast]);

  const updateAssetStock = async (assetId: string, purchasedQuantity: number, currentStock: number) => {
    try {
      const response = await fetch(`${API_URL}/assets/${assetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          availableStock: Math.max(0, currentStock - purchasedQuantity),
          quantityBougth: purchasedQuantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update asset stock');
      }
    } catch (error) {
      console.error('Error updating asset stock:', error);
      throw error;
    }
  };

  const createOrder = async (item: any) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: user!._id,
          assetId: item.assetId,
          assetName: item.name,
          symbol: item.symbol,
          type: item.type,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          fees: 0,
          status: 'completed',
          timestamp: new Date().toISOString(),
          side: 'buy'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const addToPortfolio = async (assetId: string, addedQty: number) => {
    const symbol = items.find(i => i.assetId === assetId)!.symbol;
    const type   = items.find(i => i.assetId === assetId)!.type;
    const price  = items.find(i => i.assetId === assetId)!.price;

    try {
      // 1. Fetch existing portfolio to check for current positions
      const listRes = await fetch(
        `${API_URL}/portfolio/${user!._id}`,
        { headers: getAuthHeaders() }
      );
      if (!listRes.ok) {
        throw new Error('Falha ao buscar portfólio');
      }
      const portfolio: Array<{ assetId: string; quantity: number }> =
        await listRes.json();

      // 2. Calculate final quantity (merge with existing or create new position)
      const existing = portfolio.find(p => p.assetId === assetId);
      const finalQty = existing
        ? existing.quantity + addedQty    // Add to existing position
        : addedQty;                       // Create new position

      // 3. Update/create portfolio entry via API
      const saveRes = await fetch(
        `${API_URL}/portfolio/${user!._id}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            assetId,
            symbol,
            type,
            quantity: finalQty,
            buyPrice: price
          })
        }
      );
      if (!saveRes.ok) {
        throw new Error('Falha ao adicionar/atualizar portfólio');
      }
    } catch (err) {
      console.error('Erro no addToPortfolio:', err);
      throw err;
    }
  };


  const updateWalletBalance = async (amount: number) => {
    try {
      const response = await fetch(`${API_URL}/wallet/${user!._id}/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount,
          paymentMethod: paymentMethod === 'balance' ? 'wallet' : 'credit_card'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update wallet balance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  };

  const handleQuantityChange = (itemId: string, delta: number, currentQuantity: number) => {
    const stockLimit = stockLimits[itemId];
    const newQuantity = Math.max(1, currentQuantity + delta);
    
    if (stockLimit !== undefined && newQuantity > stockLimit) {
      toast({
        title: "Stock limit reached",
        description: `Only ${stockLimit} units are available for this item.`,
        variant: "default"
      });
      updateQuantity(itemId, stockLimit);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleQuantityInputChange = (itemId: string, value: string) => {
    setQuantityInputs(prev => ({ ...prev, [itemId]: value }));
  };

  const handleQuantityInputBlur = (itemId: string, item: any) => {
    const inputValue = quantityInputs[itemId];
    let parsedValue: number;
    
    if (item.type === 'crypto') {
      parsedValue = parseFloat(inputValue) || 0.00000001;
      parsedValue = Math.max(0.00000001, parsedValue);
    } else {
      parsedValue = parseInt(inputValue) || 1;
      parsedValue = Math.max(1, parsedValue);
    }
    
    const stockLimit = stockLimits[itemId];
    if (stockLimit !== undefined && parsedValue > stockLimit) {
      parsedValue = stockLimit;
      toast({
        title: "Stock limit reached",
        description: `Only ${stockLimit} units are available for this item.`,
        variant: "default"
      });
    }
    
    updateQuantity(itemId, parsedValue);
  };
  
  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your purchase.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate sufficient balance for wallet payment
    if (paymentMethod === 'balance' && balance < total) {
      toast({
        title: "Insufficient balance",
        description: `Your wallet balance ($${balance.toFixed(2)}) is less than the total ($${total.toFixed(2)}).`,
        variant: "destructive"
      });
      return;
    }
    
    // Pre-checkout stock validation to prevent order failures
    let stockAvailable = true;
    for (const item of items) {
      const limit = stockLimits[item.id];
      if (limit !== undefined && item.quantity > limit) {
        stockAvailable = false;
        toast({
          title: "Stock not available",
          description: `Only ${limit} units of ${item.symbol} are available.`,
          variant: "destructive"
        });
        break;
      }
    }
    
    if (!stockAvailable) return;
    
    try {
      setIsProcessing(true);
      
      // Process each item in the cart
      for (const item of items) {
        const currentStock = stockLimits[item.id] || 0;
        
        // 1. Update asset stock and quantity bought
        await updateAssetStock(item.assetId, item.quantity, currentStock);
        
        // 2. Create order record for transaction history
        await createOrder(item);
        
        // 3. Add to portfolio
        await addToPortfolio(item.assetId, item.quantity);
      }
      
      // 4. Update wallet balance
      await updateWalletBalance(total);
      
      // 5. Refresh user data to reflect changes
      await refreshBalance();
      await forceRefresh();
      
      // Clear cart after successful transaction
      clearCart();
      
      toast({
        title: "Purchase successful",
        description: `Your order has been processed using ${paymentMethod === 'balance' ? 'your wallet balance' : 'your credit card'}.`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add stocks or cryptocurrencies to your cart to continue.</p>
            <Button onClick={() => navigate('/market')}>
              Browse Market
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Cart Items ({items.length})</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingStock ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse text-center">
                        <div className="h-4 bg-secondary rounded w-48 mb-2 mx-auto"></div>
                        <div className="h-3 bg-secondary rounded w-32 mx-auto"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => {
                        const stockLimit = stockLimits[item.id];
                        const isAtStockLimit = stockLimit !== undefined && item.quantity > stockLimit;
                        const currentInputValue = quantityInputs[item.id] || item.quantity.toString();
                        
                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                            <div className="mb-3 sm:mb-0">
                              <h3 className="font-medium">{item.name} ({item.symbol})</h3>
                              <p className="text-sm text-muted-foreground">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                              {stockLimit !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Available: {stockLimit} units
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-md">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    step={item.type === 'crypto' ? "0.00000001" : "1"}
                                    min={item.type === 'crypto' ? "0.00000001" : "1"}
                                    max={stockLimit}
                                    value={currentInputValue}
                                    onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                                    onBlur={() => handleQuantityInputBlur(item.id, item)}
                                    className="w-20 text-center border-0 focus:ring-0"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                                    disabled={isAtStockLimit}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {item.type === 'crypto' && (
                                  <span className="text-xs text-muted-foreground">Fractional OK</span>
                                )}
                              </div>
                              
                              <div className="text-right min-w-[100px]">
                                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive" 
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {isAtStockLimit && (
                              <div className="w-full mt-2 text-xs text-amber-600 flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Maximum available quantity reached
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading fees</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={(value) => setPaymentMethod(value as 'balance' | 'credit_card')}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-2 rounded border">
                          <RadioGroupItem value="balance" id="payment-balance" />
                          <Label htmlFor="payment-balance" className="flex items-center">
                            <Wallet className="h-4 w-4 mr-2" />
                            Wallet Balance (${balance.toFixed(2)})
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 p-2 rounded border">
                          <RadioGroupItem 
                            value="credit_card" 
                            id="payment-cc" 
                            disabled={!hasCreditCard}
                          />
                          <Label htmlFor="payment-cc" className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {isLoadingCard ? (
                              "Loading card info..."
                            ) : hasCreditCard && cardInfo ? (
                              `Credit Card (${cardInfo.maskedNumber})`
                            ) : (
                              "Credit Card (Not available)"
                            )}
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {!hasCreditCard && !isLoadingCard && (
                        <Alert className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            No credit card found. Please add one in your{' '}
                            <Button 
                              variant="link" 
                              className="p-0 h-auto"
                              onClick={() => navigate('/wallet')}
                            >
                              wallet settings
                            </Button>
                            {' '}to complete your purchase.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {paymentMethod === 'balance' && balance < total && (
                        <p className="text-destructive text-sm mt-2">
                          Insufficient balance. Please add funds or choose another payment method.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleCheckout}
                    disabled={
                      isProcessing || 
                      items.length === 0 || 
                      (paymentMethod === 'balance' && balance < total) ||
                      (paymentMethod === 'credit_card' && !hasCreditCard)
                    }
                  >
                    {isProcessing ? "Processing..." : "Complete Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
