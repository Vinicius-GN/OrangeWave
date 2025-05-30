import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getAssetById } from '@/services/marketService';
import { getAssetStock, decrementStock } from '@/services/stockService';

export interface CartItem {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  price: number;
  addedAt: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  cartCount: number;
  completePurchase: (purchasedItems: CartItem[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
          setCartCount(parsedCart.length);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    } else {
      // Clear cart when user logs out
      setItems([]);
      setCartCount(0);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && items.length > 0) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    } else if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    setCartCount(items.length);
  }, [items, user]);

  // Add item to cart
  const addToCart = async (item: Omit<CartItem, 'id' | 'addedAt'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check available stock - use both API data and localStorage
      const assetDetails = await getAssetById(item.assetId);
      const currentStock = getAssetStock(item.assetId, assetDetails?.availableStock);
      
      if (currentStock !== undefined) {
        // Find existing items in cart for this asset
        const existingItems = items.filter(i => i.assetId === item.assetId);
        const totalQuantityInCart = existingItems.reduce((sum, i) => sum + i.quantity, 0);
        
        // Check if adding this item would exceed available stock
        if (totalQuantityInCart + item.quantity > currentStock) {
          // Calculate how many more can be added
          const remainingStock = Math.max(0, currentStock - totalQuantityInCart);
          
          if (remainingStock <= 0) {
            toast({
              title: "Stock limit reached",
              description: `You already have the maximum available quantity of ${item.symbol} in your cart.`,
              variant: "destructive"
            });
            return;
          } else {
            // Adjust the quantity to remaining stock
            item.quantity = remainingStock;
            toast({
              title: "Quantity adjusted",
              description: `Only ${remainingStock} more units of ${item.symbol} are available.`,
              variant: "default"
            });
          }
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = items.findIndex(i => 
        i.assetId === item.assetId && i.price === item.price
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        const newItems = [...items];
        newItems[existingItemIndex].quantity += item.quantity;
        setItems(newItems);
        
        toast({
          title: "Cart updated",
          description: `Updated quantity of ${item.symbol} in your cart.`
        });
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: `cart-item-${Date.now()}`,
          addedAt: Date.now()
        };
        
        setItems(prevItems => [...prevItems, newItem]);
        
        toast({
          title: "Added to cart",
          description: `${item.quantity} ${item.symbol} added to your cart.`
        });
      }
    } catch (error) {
      console.error("Error checking stock availability:", error);
      
      // Fallback to adding without stock check in case of error
      const existingItemIndex = items.findIndex(i => 
        i.assetId === item.assetId && i.price === item.price
      );

      if (existingItemIndex >= 0) {
        const newItems = [...items];
        newItems[existingItemIndex].quantity += item.quantity;
        setItems(newItems);
      } else {
        const newItem: CartItem = {
          ...item,
          id: `cart-item-${Date.now()}`,
          addedAt: Date.now()
        };
        
        setItems(prevItems => [...prevItems, newItem]);
      }
      
      toast({
        title: "Added to cart",
        description: `${item.quantity} ${item.symbol} added to your cart.`
      });
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    
    if (item) {
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
      
      toast({
        title: "Removed from cart",
        description: `${item.symbol} removed from your cart.`
      });
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      // Find the item to update
      const itemToUpdate = items.find(i => i.id === itemId);
      
      if (itemToUpdate) {
        // Check available stock - use both API data and localStorage
        const assetDetails = await getAssetById(itemToUpdate.assetId);
        const currentStock = getAssetStock(itemToUpdate.assetId, assetDetails?.availableStock);
        
        if (currentStock !== undefined) {
          // Ensure quantity doesn't exceed available stock
          if (quantity > currentStock) {
            quantity = currentStock;
            toast({
              title: "Quantity adjusted",
              description: `Quantity limited to available stock (${currentStock} units).`,
              variant: "default"
            });
          }
        }
      }
      
      // Update the quantity
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error("Error checking stock availability for update:", error);
      
      // Fallback to updating without stock check in case of error
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart."
    });
  };

  // Calculate total value of cart
  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // New function to handle purchase completion and stock updates
  const completePurchase = async (purchasedItems: CartItem[]) => {
    // Update stock quantities for purchased items
    for (const item of purchasedItems) {
      try {
        const assetDetails = await getAssetById(item.assetId);
        decrementStock(item.assetId, item.quantity, assetDetails?.availableStock);
      } catch (error) {
        console.error(`Error updating stock for ${item.assetId}:`, error);
      }
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      cartCount,
      completePurchase
    }}>
      {children}
    </CartContext.Provider>
  );
};
