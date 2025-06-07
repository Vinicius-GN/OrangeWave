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

// Provider Component
export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [history, setHistory] = useState<PortfolioHistory[]>([]);
  const [stats, setStats] = useState<PortfolioStats>(initialStats);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem('authToken');

  // Calculate portfolio statistics
  const calculateStats = (portfolioAssets: PortfolioAsset[]): PortfolioStats => {
    const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalInvestment = portfolioAssets.reduce((sum, asset) => sum + (asset.quantity * asset.averagePrice), 0);
    const totalProfitLoss = totalValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
    
    // Calculate day change (simplified - in reality this would come from API)
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

  // Fetch portfolio data from API
  const fetchPortfolioData = async () => {
    if (!user || !authToken) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch portfolio assets
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

      // For each portfolio item, fetch asset details and calculate values
      const portfolioAssets: PortfolioAsset[] = [];
      
      for (const item of portfolioData) {
        try {
          // Fetch asset details
          const assetResponse = await fetch(`${API_URL}/assets/${item.assetId}`);
          if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            
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

  const addAsset = async (asset: Asset, quantity: number) => {
    await addAssetToPortfolio(asset.symbol, quantity, asset.currentPrice);
  };

  const sellAsset = async (assetId: string, quantity: number, price: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      await removeAssetFromPortfolio(asset.symbol, quantity);
    }
  };

  const buyAsset = async (asset: Asset, quantity: number) => {
    await addAsset(asset, quantity);
  };

  const getAssetById = (id: string): PortfolioAsset | undefined => {
    return assets.find(asset => asset.id === id);
  };

  const getAssetsByType = (type: 'stock' | 'crypto'): PortfolioAsset[] => {
    return assets.filter(asset => asset.type === type);
  };

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

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
