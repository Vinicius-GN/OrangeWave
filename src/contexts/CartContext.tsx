import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  type: 'stock' | 'crypto';
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalValue: number;
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  completePurchase: (items: CartItem[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    } else {
      setItems([]);
    }
  }, [user]);

  // Auto-save cart changes to localStorage
  useEffect(() => {
    if (user && items.length > 0) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(items));
    } else if (user) {
      localStorage.removeItem(`cart_${user._id}`);
    }
  }, [items, user]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.assetId === item.assetId);
      
      if (existingItem) {
        // Merge quantities for same asset instead of creating duplicate entries
        return prevItems.map(cartItem =>
          cartItem.assetId === item.assetId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Create new cart item with assetId as unique identifier
        return [...prevItems, { ...item, id: item.assetId, quantity }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      // Auto-remove items with zero or negative quantity
      removeFromCart(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate total cart value by summing price × quantity for all items
  const getCartTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const completePurchase = async (purchasedItems: CartItem[]) => {
    // Placeholder for purchase completion logic (API calls, stock updates, etc.)
    console.log('Purchase completed for items:', purchasedItems);
  };

  // Calculated values for cart summary
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = totalItems;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalValue,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        completePurchase,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
