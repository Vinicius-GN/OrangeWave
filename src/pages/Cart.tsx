import React, { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { usePortfolio } from '@/contexts/PortfolioContext';

// Import the function to get asset stock data
import { getAssetById } from '@/services/marketService';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal, completePurchase } = useCart();
  const { user } = useAuth();
  const { buyAsset } = usePortfolio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'credit_card'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockLimits, setStockLimits] = useState<Record<string, number>>({});
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  
  const walletBalance = user?.balance?.wallet || 0;
  const total = getCartTotal();
  
  // Only show credit card option if user has a credit card stored
  const hasCreditCard = true; // In a real implementation, check if user has credit card info stored
  
  // ----------------------------  Function to make a POST request to Beeceptor -> As asked in the MIlestone 2 ---------------------------- 
  const postPurchaseToBeeceptor = async (product) => {
  try {
    const response = await fetch(`https://orangewave.free.beeceptor.com/product/:id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        nameProduct: product.name,
        price: product.price,
        stock: product.stock,
        quantity: product.quantity,
      }),
    });

    const data = await response.json(); // Beeceptor pode ou não retornar um corpo útil
    console.log('POST to Beeceptor:', data);
    return data;
  } catch (error) {
    console.error('POST request failed:', error);
    return null;
  }
};



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
        // Fetch stock data for each item in the cart
        for (const item of items) {
          const assetData = await getAssetById(item.assetId);
          if (assetData && assetData.availableStock !== undefined) {
            limits[item.id] = assetData.availableStock;
            
            // Check if current quantity exceeds available stock and adjust if needed
            if (item.quantity > assetData.availableStock) {
              updateQuantity(item.id, assetData.availableStock);
              toast({
                title: "Quantity adjusted",
                description: `${item.symbol} quantity has been adjusted to match available stock.`,
                variant: "default"
              });
            }
          } else {
            // Default to a high number if stock data is not available
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

  // Handle direct quantity input change
  const handleQuantityInputChange = (itemId: string, value: string) => {
    setQuantityInputs(prev => ({ ...prev, [itemId]: value }));
  };

  // Handle quantity input blur (when user finishes typing)
  const handleQuantityInputBlur = (itemId: string, item: any) => {
    const inputValue = quantityInputs[itemId];
    let parsedValue: number;
    
    // Support fractional amounts for crypto
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
    
    if (paymentMethod === 'balance' && walletBalance < total) {
      toast({
        title: "Insufficient balance",
        description: `Your wallet balance ($${walletBalance.toFixed(2)}) is less than the total ($${total.toFixed(2)}).`,
        variant: "destructive"
      });
      return;
    }
    
    // Check stock availability before proceeding
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
      
      // Store purchased items for stock update
      const purchasedItems = [...items];
      
      // Process each item in the cart
      for (const item of items) {
        // Always use buyAsset regardless of payment method to ensure assets are added to portfolio
        await buyAsset({
          symbol: item.symbol,
          name: item.name,
          type: item.type,
          currentPrice: item.price
        }, item.quantity);

        // Simulate purchase via Beeceptor
        await postPurchaseToBeeceptor({
          id: item.id,
          name: item.name,
          price: item.price,
          stock: stockLimits[item.id], // estoque antes da compra
          quantity: item.quantity
        });

      }
      
      // Update stock quantities after successful purchase
      await completePurchase(purchasedItems);
      
      // Clear the cart after successful purchase
      clearCart();
      
      // Show success toast with payment method information
      toast({
        title: "Purchase successful",
        description: `Your order has been processed using ${paymentMethod === 'balance' ? 'your wallet balance' : 'your credit card'}.`,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your purchase. Please try again.",
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
                              {/* Enhanced quantity controls with direct input */}
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
                            Wallet Balance (${walletBalance.toFixed(2)})
                          </Label>
                        </div>
                        
                        {hasCreditCard && (
                          <div className="flex items-center space-x-2 p-2 rounded border">
                            <RadioGroupItem value="credit_card" id="payment-cc" />
                            <Label htmlFor="payment-cc" className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Credit Card (•••• 4242)
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                      
                      {paymentMethod === 'balance' && walletBalance < total && (
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
                    disabled={isProcessing || items.length === 0 || (paymentMethod === 'balance' && walletBalance < total)}
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
