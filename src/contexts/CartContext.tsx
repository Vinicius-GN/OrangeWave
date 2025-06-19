/**
 * @file CartContext.tsx
 * @brief React context for managing the shopping cart in the OrangeWave platform.
 *
 * This context provides:
 *  - A central store for cart items, quantities, and total calculations
 *  - Persistence via localStorage keyed by user ID
 *  - Methods to add, remove, and update items in the cart
 *  - Automatic merging of duplicate items to prevent separate entries
 *  - Calculation of total item count and total monetary value
 *  - A placeholder method for completing the purchase (to be integrated with backend)
 *  - A custom hook for easy consumption of cart state and methods
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @struct CartItem
 * @brief Represents a single item in the shopping cart.
 *
 * @var id          Unique identifier for this cart entry (defaults to assetId)
 * @var assetId     Identifier of the underlying asset being purchased
 * @var symbol      Asset ticker symbol (e.g., "AAPL", "BTC")
 * @var name        Human-readable asset name
 * @var price       Unit price at time of addition to cart
 * @var quantity    Number of units of the asset in the cart
 * @var type        Asset type, either 'stock' or 'crypto'
 * @var imageUrl?   Optional URL for an asset icon or image
 */
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

/**
 * @interface CartContextType
 * @brief Defines the shape of the cart context value.
 *
 * @var items            Array of items currently in the cart
 * @var totalItems       Sum of quantities across all cart items
 * @var totalValue       Sum of (price × quantity) for all cart items
 * @var cartCount        Alias for totalItems, used for badge counts
 * @var addToCart        Adds a specified quantity of an item to the cart
 * @var removeFromCart   Removes an item from the cart by its id
 * @var updateQuantity   Updates the quantity of a specific cart item
 * @var clearCart        Empties the cart entirely
 * @var getCartTotal     Returns the computed monetary total of the cart
 * @var completePurchase Placeholder for purchase finalization logic
 */
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

/**
 * @brief React context object for the cart.
 *
 * Will be provided by CartProvider and consumed via useCart().
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * @component CartProvider
 * @brief Wraps application parts that need access to cart state and methods.
 *
 * Responsibilities:
 *  - Initialize cart from localStorage when a user logs in or changes
 *  - Persist cart changes back to localStorage keyed by user ID
 *  - Manage cart state (add, remove, update, clear)
 *  - Compute derived summary values (totalItems, totalValue, cartCount)
 *
 * @param children ReactNode elements that will have cart context access
 */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /** @brief Current authenticated user from AuthContext */
  const { user } = useAuth();
  /** @brief Internal state: array of items in the cart */
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * @brief Load cart from localStorage when `user` changes.
   *
   * Uses the key `cart_<userId>` to restore the saved cart array.
   * If no user is present, resets the cart to an empty array.
   */
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        try {
          const parsedCart: CartItem[] = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
    } else {
      setItems([]);
    }
  }, [user]);

  /**
   * @brief Auto-save cart changes to localStorage whenever `items` or `user` changes.
   *
   * Persists under key `cart_<userId>`. If the cart is empty, removes the key.
   */
  useEffect(() => {
    if (user) {
      if (items.length > 0) {
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(items));
      } else {
        localStorage.removeItem(`cart_${user._id}`);
      }
    }
  }, [items, user]);

  /**
   * @brief Adds an item to the cart or increments quantity if already present.
   *
   * Merges by `assetId` to avoid duplicate entries for the same asset.
   *
   * @param item      CartItem data without quantity (id defaults to assetId)
   * @param quantity  Number of units to add
   */
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number): void => {
    setItems(prevItems => {
      const existing = prevItems.find(ci => ci.assetId === item.assetId);
      if (existing) {
        // Merge quantities for existing item
        return prevItems.map(ci =>
          ci.assetId === item.assetId
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      }
      // Create a new entry with id = assetId
      return [...prevItems, { ...item, id: item.assetId, quantity }];
    });
  };

  /**
   * @brief Removes an item entirely from the cart by its unique id.
   *
   * @param id  The `id` (assetId) of the item to remove
   */
  const removeFromCart = (id: string): void => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  /**
   * @brief Updates the quantity of a specific cart item.
   *
   * If quantity ≤ 0, the item is automatically removed.
   *
   * @param id        Unique id of the cart item
   * @param quantity  New desired quantity
   */
  const updateQuantity = (id: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(ci =>
        ci.id === id ? { ...ci, quantity } : ci
      )
    );
  };

  /**
   * @brief Clears the entire cart, removing all items.
   */
  const clearCart = (): void => {
    setItems([]);
  };

  /**
   * @brief Computes the total monetary value of all items in the cart.
   *
   * @returns Sum of price × quantity for each item
   */
  const getCartTotal = (): number => {
    return items.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  };

  /**
   * @brief Placeholder for purchase completion logic.
   *
   * Intended to integrate with backend order processing, stock updates, etc.
   *
   * @param purchasedItems  Array of CartItem objects being purchased
   */
  const completePurchase = async (purchasedItems: CartItem[]): Promise<void> => {
    console.log('Purchase completed for items:', purchasedItems);
    // TODO: integrate with API to finalize purchase
  };

  /** @brief Derived value: total number of units across all cart items */
  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);

  /** @brief Derived value: total monetary value of the cart */
  const totalValue = items.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

  /** @brief Alias for totalItems, used for cart badge counts */
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
        completePurchase
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * @brief Custom hook to consume the cart context.
 *
 * @throws Error if used outside a CartProvider
 * @returns CartContextType with state and methods
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
