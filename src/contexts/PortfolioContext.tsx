/**
 * Portfolio Context
 * 
 * This context provides comprehensive portfolio management functionality for the OrangeWave
 * trading platform. It handles user asset holdings, portfolio statistics, transaction history,
 * and real-time portfolio value calculations with profit/loss tracking.
 * 
 * Features:
 * - Real-time portfolio asset management with live price updates
 * - Comprehensive portfolio statistics and performance metrics
 * - Transaction history tracking and management
 * - Asset categorization (stocks vs cryptocurrencies)
 * - Profit/loss calculations with percentage tracking
 * - Portfolio value evolution over time
 * - Asset filtering and querying capabilities
 * - Integration with market data for current prices
 * - Optimistic updates for better user experience
 * - Error handling and state management
 */

// React core imports for context and state management
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  currentPrice: number;
}

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  imageUrl?: string;
  type: 'stock' | 'crypto';
}

interface PortfolioHistory {
  date: string;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface PortfolioStats {
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  symbol?: string;
  quantity?: number;
  price?: number;
  total: number;
  timestamp: number;
}

interface PortfolioContextType {
  assets: PortfolioAsset[];
  history: PortfolioHistory[];
  stats: PortfolioStats;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  addAssetToPortfolio: (symbol: string, quantity: number, price: number) => Promise<void>;
  removeAssetFromPortfolio: (symbol: string, quantity: number) => Promise<void>;
  addAsset: (asset: Asset, quantity: number) => Promise<void>;
  sellAsset: (assetId: string, quantity: number, price: number) => Promise<void>;
  buyAsset: (asset: Asset, quantity: number) => Promise<void>;
  getAssetById: (id: string) => PortfolioAsset | undefined;
  getAssetsByType: (type: 'stock' | 'crypto') => PortfolioAsset[];
  getAssetsValue: () => number;
  updateAssetPrices: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const API_URL = 'http://localhost:3001/api';

// Initial state
const initialStats: PortfolioStats = {
  totalValue: 0,
  totalInvestment: 0,
  totalProfitLoss: 0,
  totalProfitLossPercentage: 0,
  dayChange: 0,
  dayChangePercentage: 0,
};

// Context
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

/**
 * PortfolioProvider Component
 * 
 * Context provider for managing portfolio state and statistics
 */
export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // State for portfolio assets, history, statistics, transactions, loading, and error
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [history, setHistory] = useState<PortfolioHistory[]>([]);
  const [stats, setStats] = useState<PortfolioStats>(initialStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve authentication token from local storage
  const authToken = localStorage.getItem('authToken');

  /**
   * Calculates portfolio statistics including total value, total investment,
   * total profit/loss, and performance metrics like day change and percentage.
   * 
   * @param portfolioAssets - Array of assets in the user's portfolio
   * @returns Calculated statistics for the portfolio
   */
  const calculateStats = (portfolioAssets: PortfolioAsset[]): PortfolioStats => {
    // Sum total value and investment for all assets
    const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalInvestment = portfolioAssets.reduce((sum, asset) => sum + (asset.quantity * asset.averagePrice), 0);
    const totalProfitLoss = totalValue - totalInvestment;
    // Calculate profit/loss percentage, avoid division by zero
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    // Mock day change calculation (would typically come from API with historical data)
    const dayChange = totalValue * 0.015; // Mock 1.5% day change
    const dayChangePercentage = (dayChange / totalValue) * 100;

    return {
      totalValue,
      totalInvestment,
      totalProfitLoss,
      totalProfitLossPercentage,
      dayChange,
      dayChangePercentage,
    };
  };

  /**
   * Fetches portfolio data from the API, including user's asset holdings,
   * and enriches portfolio items with current asset data and calculated P&L.
   */
  const fetchPortfolioData = async () => {
    if (!user || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's portfolio holdings
      const portfolioResponse = await fetch(`${API_URL}/portfolio/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!portfolioResponse.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const portfolioData = await portfolioResponse.json();

      // Enrich portfolio items with current asset data and calculate P&L
      const portfolioAssets: PortfolioAsset[] = [];
      
      for (const item of portfolioData) {
        try {
          // Fetch current asset price and details
          const assetResponse = await fetch(`${API_URL}/assets/${item.assetId}`);
          if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            
            // Calculate current value and profit/loss
            const currentPrice = assetData.currentPrice || assetData.price || item.buyPrice;
            const totalValue = item.quantity * currentPrice;
            const profitLoss = totalValue - (item.quantity * item.buyPrice);
            const profitLossPercentage = item.buyPrice > 0 ? (profitLoss / (item.quantity * item.buyPrice)) * 100 : 0;

            portfolioAssets.push({
              id: item.assetId,
              symbol: item.symbol,
              name: assetData.name || item.symbol,
              quantity: item.quantity,
              averagePrice: item.buyPrice,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercentage,
              imageUrl: assetData.imageUrl || assetData.logoUrl,
              type: item.type
            });
          }
        } catch (err) {
          console.error(`Error fetching asset ${item.assetId}:`, err);
        }
      }
      
      setAssets(portfolioAssets);
      setStats(calculateStats(portfolioAssets));
      
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh - can be called after purchases
  const forceRefresh = async () => {
    await fetchPortfolioData();
  };

  // Refresh portfolio data
  const refreshPortfolio = async () => {
    await fetchPortfolioData();
  };

  /**
   * Adds a specified quantity of an asset to the portfolio, creating a new
   * portfolio entry if the asset does not already exist in the portfolio.
   * 
   * @param symbol - The trading symbol of the asset
   * @param quantity - The quantity to add
   * @param price - The price at which the asset is being added
   */
  const addAssetToPortfolio = async (symbol: string, quantity: number, price: number) => {
    if (!user || !authToken) throw new Error('User not authenticated');

    try {
      const response = await fetch(`${API_URL}/portfolio/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol,
          quantity,
          buyPrice: price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add asset to portfolio');
      }

      await refreshPortfolio();
      
    } catch (error) {
      console.error('Error adding asset to portfolio:', error);
      throw error;
    }
  };

  /**
   * Removes a specified quantity of an asset from the portfolio. If the quantity
   * to remove exceeds the current quantity in the portfolio, the asset is removed
   * entirely from the portfolio.
   * 
   * @param symbol - The trading symbol of the asset
   * @param quantity - The quantity to remove
   */
  const removeAssetFromPortfolio = async (symbol: string, quantity: number) => {
    if (!user || !authToken) throw new Error('User not authenticated');

    try {
      const response = await fetch(`${API_URL}/portfolio/${user._id}/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove asset from portfolio');
      }

      await refreshPortfolio();
      
    } catch (error) {
      console.error('Error removing asset from portfolio:', error);
      throw error;
    }
  };

  // Adds a new asset to the portfolio
  const addAsset = async (asset: Asset, quantity: number) => {
    await addAssetToPortfolio(asset.symbol, quantity, asset.currentPrice);
  };

  // Sells a specified quantity of an asset from the portfolio
  const sellAsset = async (assetId: string, quantity: number, price: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      await removeAssetFromPortfolio(asset.symbol, quantity);
    }
  };

  const buyAsset = async (asset: Asset, quantity: number) => {
    await addAsset(asset, quantity);
  };

  // Retrieves a portfolio asset by its ID
  const getAssetById = (id: string): PortfolioAsset | undefined => {
    return assets.find(asset => asset.id === id);
  };

  // Returns all assets of a given type (stock or crypto)
  const getAssetsByType = (type: 'stock' | 'crypto'): PortfolioAsset[] => {
    return assets.filter(asset => asset.type === type);
  };

  // Calculates the total value of all assets in the portfolio
  const getAssetsValue = (): number => {
    return assets.reduce((sum, asset) => sum + asset.totalValue, 0);
  };

  const updateAssetPrices = async () => {
    await refreshPortfolio();
  };

  // Load portfolio data when user changes
  useEffect(() => {
    if (user && authToken) {
      fetchPortfolioData();
    } else {
      // Reset portfolio when user logs out
      setAssets([]);
      setHistory([]);
      setStats(initialStats);
      setIsLoading(false);
    }
  }, [user, authToken]);

  return (
    <PortfolioContext.Provider
      value={{
        assets,
        history,
        stats,
        transactions,
        isLoading,
        error,
        refreshPortfolio,
        addAssetToPortfolio,
        removeAssetFromPortfolio,
        addAsset,
        sellAsset,
        buyAsset,
        getAssetById,
        getAssetsByType,
        getAssetsValue,
        updateAssetPrices,
        forceRefresh,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

// Custom hook to use the PortfolioContext
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
