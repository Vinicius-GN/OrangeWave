import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Types
export type AssetType = 'stock' | 'crypto'; // Removed 'etf' and 'other'

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  logoUrl?: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  assetSymbol: string;
  assetName?: string;
  symbol?: string; // Added for Orders page compatibility
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal'; 
  quantity?: number;
  price?: number;
  total: number;
  fees?: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

// Adding Order interface for Orders page
export interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
  status: 'open' | 'completed' | 'cancelled';
}

// Context type
interface PortfolioContextType {
  assets: Asset[];
  transactions: Transaction[];
  orders: Order[]; // Added for Orders page
  addAsset: (asset: Asset) => void;
  sellAsset: (assetId: string, quantity: number, price: number) => void;
  getAssetsByType: (type: AssetType) => Asset[];
  getAssetsValue: () => number;
  updateAssetPrices: (updates: Array<{ id: string, currentPrice: number }>) => void;
  cancelOrder: (orderId: string) => Promise<void>; // Added for Orders page
  getAssetById: (assetId: string) => Asset | undefined; // Added for AssetDetail page
  buyAsset: (assetInfo: { 
    symbol: string; 
    name: string; 
    type: AssetType; 
    currentPrice: number;
    logoUrl?: string; // Add logoUrl to the interface
  }, quantity: number) => Promise<void>; // Added for AssetDetail page
  deposit: (amount: number) => Promise<void>; // Added for Wallet page
  withdraw: (amount: number) => Promise<void>; // Added for Wallet page
}

// Default values
const defaultPortfolioContext: PortfolioContextType = {
  assets: [],
  transactions: [],
  orders: [], // Added for Orders page
  addAsset: () => {},
  sellAsset: () => {},
  getAssetsByType: () => [],
  getAssetsValue: () => 0,
  updateAssetPrices: () => {},
  cancelOrder: async () => {}, // Added for Orders page
  getAssetById: () => undefined, // Added for AssetDetail page
  buyAsset: async () => {}, // Added for AssetDetail page
  deposit: async () => {}, // Added for Wallet page
  withdraw: async () => {} // Added for Wallet page
};

// Context
const PortfolioContext = createContext<PortfolioContextType>(defaultPortfolioContext);

// Hook
export const usePortfolio = () => useContext(PortfolioContext);

// Mock initial assets for demo
const mockAssets: Asset[] = [
  {
    id: 'asset-aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    logoUrl: 'https://companieslogo.com/img/orig/AAPL-bf1a4314.png',
    quantity: 5,
    averagePrice: 178.32,
    currentPrice: 185.92
  },
  {
    id: 'asset-msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    logoUrl: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png',
    quantity: 3,
    averagePrice: 356.53,
    currentPrice: 414.28
  },
  {
    id: 'asset-btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    quantity: 1,
    averagePrice: 68452.15,
    currentPrice: 68211.35
  }
];

// Mock transactions
const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    assetId: 'asset-aapl',
    assetSymbol: 'AAPL',
    assetName: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'buy',
    quantity: 5,
    price: 178.32,
    total: 891.60,
    fees: 4.99,
    timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    status: 'completed'
  },
  {
    id: 'tx-2',
    assetId: 'asset-msft',
    assetSymbol: 'MSFT',
    assetName: 'Microsoft Corporation',
    symbol: 'MSFT',
    type: 'buy',
    quantity: 3,
    price: 356.53,
    total: 1069.59,
    fees: 4.99,
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    status: 'completed'
  },
  {
    id: 'tx-3',
    assetId: 'asset-btc',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    symbol: 'BTC',
    type: 'buy',
    quantity: 0.05,
    price: 68452.15,
    total: 3422.61,
    fees: 9.99,
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    status: 'completed'
  },
  {
    id: 'tx-4',
    assetId: '',
    assetSymbol: '',
    symbol: '',
    type: 'deposit',
    total: 10000,
    timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
    status: 'completed'
  }
];

// Mock orders for the Orders page
const mockOrders: Order[] = [
  {
    id: 'order-1',
    symbol: 'AAPL',
    type: 'buy',
    quantity: 2,
    price: 180.50,
    total: 361.00,
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    status: 'open'
  },
  {
    id: 'order-2',
    symbol: 'GOOGL',
    type: 'sell',
    quantity: 1,
    price: 2800.75,
    total: 2800.75,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    status: 'open'
  }
];

// Provider
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();

  // Add an asset to the portfolio
  const addAsset = useCallback((newAsset: Asset) => {
    if (!user) return;

    const total = newAsset.currentPrice * newAsset.quantity;
    
    // First, create a transaction
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      assetId: newAsset.id,
      assetSymbol: newAsset.symbol,
      symbol: newAsset.symbol, // Added for Orders page compatibility
      assetName: newAsset.name,
      type: 'buy',
      quantity: newAsset.quantity,
      price: newAsset.currentPrice,
      total,
      fees: 4.99,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    // Update user's cash balance
    updateUserBalance(-total);
    
    // Check if asset already exists in portfolio
    const existingAssetIndex = assets.findIndex(asset => asset.symbol === newAsset.symbol);
    
    if (existingAssetIndex >= 0) {
      // Update existing asset
      setAssets(currentAssets => {
        const updatedAssets = [...currentAssets];
        const existingAsset = updatedAssets[existingAssetIndex];
        
        // Calculate new average price
        const totalQuantity = existingAsset.quantity + newAsset.quantity;
        const totalValue = (existingAsset.quantity * existingAsset.averagePrice) + 
                          (newAsset.quantity * newAsset.averagePrice);
        const newAveragePrice = totalValue / totalQuantity;
        
        updatedAssets[existingAssetIndex] = {
          ...existingAsset,
          quantity: totalQuantity,
          averagePrice: newAveragePrice
        };
        
        return updatedAssets;
      });
    } else {
      // Add new asset
      setAssets(currentAssets => [...currentAssets, newAsset]);
    }
    
    // Add transaction
    setTransactions(currentTransactions => [newTransaction, ...currentTransactions]);
    
  }, [assets, user, updateUserBalance]);

  // Sell an asset from the portfolio
  const sellAsset = useCallback((assetId: string, quantity: number, price: number) => {
    if (!user) return;

    // Find the asset
    const assetIndex = assets.findIndex(asset => asset.id === assetId);
    if (assetIndex === -1) {
      toast({
        title: "Error",
        description: "Asset not found in your portfolio.",
        variant: "destructive"
      });
      return;
    }

    const asset = assets[assetIndex];
    
    // Check if the user has sufficient quantity
    if (asset.quantity < quantity) {
      toast({
        title: "Insufficient assets",
        description: `You only have ${asset.quantity} units of ${asset.symbol}`,
        variant: "destructive"
      });
      return;
    }

    // Calculate total sale value
    const total = price * quantity;
    
    // Create a transaction record
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      assetId: asset.id,
      assetSymbol: asset.symbol,
      symbol: asset.symbol,
      assetName: asset.name,
      type: 'sell',
      quantity,
      price,
      total,
      fees: 4.99,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    // Update user's cash balance
    updateUserBalance(total);
    
    // Update assets
    setAssets(currentAssets => {
      const updatedAssets = [...currentAssets];
      const existingAsset = updatedAssets[assetIndex];
      
      if (existingAsset.quantity === quantity) {
        // Remove the asset if all units are sold
        return updatedAssets.filter(a => a.id !== assetId);
      } else {
        // Reduce the quantity
        updatedAssets[assetIndex] = {
          ...existingAsset,
          quantity: existingAsset.quantity - quantity
        };
        return updatedAssets;
      }
    });
    
    // Add transaction
    setTransactions(currentTransactions => [newTransaction, ...currentTransactions]);
    
    toast({
      title: "Asset sold",
      description: `You sold ${quantity} ${asset.symbol} for $${total.toLocaleString()}`
    });
    
  }, [assets, user, updateUserBalance, toast]);

  // Get assets by type
  const getAssetsByType = useCallback((type: AssetType) => {
    return assets.filter(asset => asset.type === type);
  }, [assets]);

  // Calculate total assets value
  const getAssetsValue = useCallback(() => {
    return assets.reduce((total, asset) => total + (asset.currentPrice * asset.quantity), 0);
  }, [assets]);

  // Update asset prices
  const updateAssetPrices = useCallback((updates: Array<{ id: string, currentPrice: number }>) => {
    setAssets(currentAssets => {
      return currentAssets.map(asset => {
        const update = updates.find(u => u.id === asset.id);
        if (update) {
          return {
            ...asset,
            currentPrice: update.currentPrice
          };
        }
        return asset;
      });
    });
  }, []);

  // Get asset by ID - Added for AssetDetail page
  const getAssetById = useCallback((assetId: string) => {
    return assets.find(asset => asset.id === assetId);
  }, [assets]);

  // Buy asset - Fixed for AssetDetail page
  const buyAsset = useCallback(async (assetInfo: { 
    symbol: string; 
    name: string; 
    type: AssetType; 
    currentPrice: number;
    logoUrl?: string; // Add logoUrl to the interface
  }, quantity: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to buy assets.",
        variant: "destructive"
      });
      return;
    }
    
    const total = assetInfo.currentPrice * quantity;
    
    // Find existing asset with this symbol
    const existingAsset = assets.find(asset => asset.symbol === assetInfo.symbol);
    
    if (existingAsset) {
      // Calculate new average price
      const totalQuantity = existingAsset.quantity + quantity;
      const totalValue = (existingAsset.quantity * existingAsset.averagePrice) + 
                         (quantity * assetInfo.currentPrice);
      const newAveragePrice = totalValue / totalQuantity;
      
      // Update existing asset
      const updatedAsset: Asset = {
        ...existingAsset,
        quantity: totalQuantity,
        averagePrice: newAveragePrice,
        currentPrice: assetInfo.currentPrice // Update to latest price
      };
      
      addAsset(updatedAsset);
      
      toast({
        title: "Purchase successful",
        description: `You added ${quantity} more ${assetInfo.symbol} to your portfolio.`
      });
    } else {
      // Create a new asset with the correct ID format to match existing assets
      const newAsset: Asset = {
        id: `asset-${assetInfo.symbol.toLowerCase()}`, // Fixed: Use correct ID format without timestamp
        symbol: assetInfo.symbol,
        name: assetInfo.name,
        type: assetInfo.type,
        logoUrl: assetInfo.logoUrl, // Fixed: Include logoUrl from market data
        quantity: quantity,
        averagePrice: assetInfo.currentPrice,
        currentPrice: assetInfo.currentPrice
      };
      
      // Add the asset to the portfolio
      addAsset(newAsset);
      
      // Show success toast
      toast({
        title: "Purchase successful",
        description: `You bought ${quantity} ${assetInfo.symbol} for $${total.toLocaleString()}.`
      });
    }
  }, [user, assets, addAsset, toast]);

  // Cancel an order - Added for Orders page
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      // Find the order
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        toast({
          title: "Error",
          description: "Order not found.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the order status
      setOrders(currentOrders => 
        currentOrders.map(o => 
          o.id === orderId ? { ...o, status: 'cancelled' } : o
        )
      );
      
      toast({
        title: "Order cancelled",
        description: `Your ${order.type} order for ${order.quantity} ${order.symbol} has been cancelled.`
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the order.",
        variant: "destructive"
      });
    }
  }, [orders, toast]);

  // Deposit funds - Added for Wallet page
  const deposit = useCallback(async (amount: number) => {
    try {
      if (amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a positive amount to deposit.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a transaction record
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        assetId: 'wallet',
        assetSymbol: '',
        symbol: '',
        type: 'deposit',
        total: amount,
        timestamp: Date.now(),
        status: 'completed'
      };
      
      // Add the transaction
      setTransactions(currentTxns => [newTransaction, ...currentTxns]);
      
      // Update user balance across all components by using the AuthContext function
      updateUserBalance(amount);
      
      toast({
        title: "Deposit successful",
        description: `$${amount.toFixed(2)} has been added to your account.`
      });
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit failed",
        description: "There was an error processing your deposit.",
        variant: "destructive"
      });
    }
  }, [toast, updateUserBalance]);

  // Withdraw funds - Added for Wallet page
  const withdraw = useCallback(async (amount: number) => {
    try {
      if (amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a positive amount to withdraw.",
          variant: "destructive"
        });
        return;
      }
      
      if (!user || user.balance.wallet < amount) {
        toast({
          title: "Insufficient funds",
          description: "You don't have enough funds to withdraw that amount.",
          variant: "destructive"
        });
        return;
      }
      
      // Create a transaction record
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        assetId: 'wallet',
        assetSymbol: '',
        symbol: '',
        type: 'withdrawal',
        total: amount,
        timestamp: Date.now(),
        status: 'completed'
      };
      
      // Add the transaction
      setTransactions(currentTxns => [newTransaction, ...currentTxns]);
      
      // Update user balance across all components by using the AuthContext function
      updateUserBalance(-amount);
      
      toast({
        title: "Withdrawal successful",
        description: `$${amount.toFixed(2)} has been withdrawn from your account.`
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal.",
        variant: "destructive"
      });
    }
  }, [user, toast, updateUserBalance]);

  return (
    <PortfolioContext.Provider value={{
      assets,
      transactions,
      orders,
      addAsset,
      sellAsset,
      getAssetsByType,
      getAssetsValue,
      updateAssetPrices,
      cancelOrder,
      getAssetById,
      buyAsset,
      deposit,
      withdraw
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
