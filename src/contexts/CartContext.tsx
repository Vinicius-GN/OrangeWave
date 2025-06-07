
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

  // Save cart to localStorage whenever items change
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
        // Merge quantities for the same asset
        return prevItems.map(cartItem =>
          cartItem.assetId === item.assetId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Create new cart item using assetId as the unique identifier
        return [...prevItems, { ...item, id: item.assetId, quantity }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
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

  const getCartTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const completePurchase = async (purchasedItems: CartItem[]) => {
    // Implementation for completing purchase
    // This would typically involve API calls to update stock, etc.
    console.log('Purchase completed for items:', purchasedItems);
  };

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
