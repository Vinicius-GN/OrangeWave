import { getAssetStock } from './stockService';

export interface AssetData {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto'; // Removed 'etf' and 'other'
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  logoUrl?: string;
  logo?: string;
  availableStock?: number;
  isFrozen?: boolean;
}

export interface StockData extends AssetData {
  sector?: string;
  industry?: string;
  high52Week: number;
  low52Week: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface CryptoData extends AssetData {
  high24h: number;
  low24h: number;
  supply?: number;
  maxSupply?: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
}

// Mock data for assets - Updated to include availableStock property
const mockAssets: AssetData[] = [
  {
    id: 'asset-aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    price: 185.92,
    change: 2.34,
    changePercent: 1.28,
    marketCap: 2875000000000,
    volume: 58900000,
    logoUrl: 'https://companieslogo.com/img/orig/AAPL-bf1a4314.png',
    logo: 'https://companieslogo.com/img/orig/AAPL-bf1a4314.png',
    availableStock: 150
  },
  {
    id: 'asset-msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    price: 414.28,
    change: 4.56,
    changePercent: 1.11,
    marketCap: 3089000000000,
    volume: 29700000,
    logoUrl: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png',
    logo: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png',
    availableStock: 200
  },
  {
    id: 'asset-googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    price: 152.42,
    change: -1.87,
    changePercent: -1.21,
    marketCap: 1923000000000,
    volume: 21300000,
    logoUrl: 'https://companieslogo.com/img/orig/google-9646e5e7.png',
    logo: 'https://companieslogo.com/img/orig/google-9646e5e7.png',
    availableStock: 175
  },
  {
    id: 'asset-amzn',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    type: 'stock',
    price: 184.72,
    change: 0.97,
    changePercent: 0.53,
    marketCap: 1887000000000,
    volume: 48900000,
    logoUrl: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png',
    logo: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png',
    availableStock: 120
  },
  {
    id: 'asset-tsla',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    type: 'stock',
    price: 1013.39,
    change: 12.84,
    changePercent: 1.28,
    marketCap: 1047000000000,
    volume: 28700000,
    logoUrl: 'https://companieslogo.com/img/orig/TSLA-6da550e5.png',
    logo: 'https://companieslogo.com/img/orig/TSLA-6da550e5.png',
    availableStock: 80
  },
  {
    id: 'asset-btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: 68211.35,
    change: -522.14,
    changePercent: -0.76,
    marketCap: 1280000000000,
    volume: 31200000000,
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    availableStock: 50
  },
  {
    id: 'asset-eth',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    price: 4823.58,
    change: -14.22,
    changePercent: -0.29,
    marketCap: 574000000000,
    volume: 18900000000,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    availableStock: 100
  },
  {
    id: 'asset-bnb',
    symbol: 'BNB',
    name: 'Binance Coin',
    type: 'crypto',
    price: 588.94,
    change: 1.92,
    changePercent: 0.33,
    marketCap: 92000000000,
    volume: 2130000000,
    logoUrl: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    logo: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png',
    availableStock: 200
  },
  {
    id: 'asset-ada',
    symbol: 'ADA',
    name: 'Cardano',
    type: 'crypto',
    price: 1.21,
    change: -0.01,
    changePercent: -0.82,
    marketCap: 40000000000,
    volume: 1670000000,
    logoUrl: 'https://www.investential.com/wp-content/uploads/2023/11/cardano-ada-1024x1024.png',
    logo: 'https://www.investential.com/wp-content/uploads/2023/11/cardano-ada-1024x1024.png',
    availableStock: 300
  },
  {
    id: 'asset-xrp',
    symbol: 'XRP',
    name: 'XRP',
    type: 'crypto',
    price: 0.84,
    change: -0.02,
    changePercent: -2.32,
    marketCap: 40000000000,
    volume: 2780000000,
    logoUrl: 'https://image.spreadshirtmedia.com/image-server/v1/products/T1459A839PA3861PT28D1038320795W10000H8280/views/1,width=800,height=800,appearanceId=839,backgroundColor=F2F2F2/xrp-symbol-black-sticker.jpg',
    logo: 'https://image.spreadshirtmedia.com/image-server/v1/products/T1459A839PA3861PT28D1038320795W10000H8280/views/1,width=800,height=800,appearanceId=839,backgroundColor=F2F2F2/xrp-symbol-black-sticker.jpg',
    availableStock: 500
  }
];

// Get all assets
export const getAllAssets = async (): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockAssets;
};

// Get asset by ID
export const getAssetById = async (id: string): Promise<AssetData | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const asset = mockAssets.find(a => a.id === id);
  
  if (!asset) {
    return null;
  }
  
  // Get updated stock from localStorage
  const currentStock = getAssetStock(id, asset.availableStock);
  
  return {
    ...asset,
    availableStock: currentStock
  };
};

// Get most traded assets
export const getMostTraded = async (limit: number = 5): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Sort assets by volume in descending order and take the top 'limit' assets
  const sortedAssets = [...mockAssets].sort((a, b) => b.volume - a.volume);
  return sortedAssets.slice(0, limit);
};

// Get top gainers
export const getTopGainers = async (limit: number = 5): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Sort assets by changePercent in descending order and take the top 'limit' assets
  const sortedAssets = [...mockAssets].sort((a, b) => b.changePercent - a.changePercent);
  return sortedAssets.slice(0, limit);
};

// Get top losers - required by Index.tsx
export const getTopLosers = async (limit: number = 5): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Sort assets by changePercent in ascending order and take the top 'limit' assets
  const sortedAssets = [...mockAssets].sort((a, b) => a.changePercent - b.changePercent);
  return sortedAssets.slice(0, limit);
};

// Get price history - required by PriceChart.tsx
export const getPriceHistory = async (
  assetId: string, 
  timeframe: 'day' | 'week' | 'month' | 'year'
): Promise<PricePoint[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const asset = mockAssets.find(a => a.id === assetId);
  if (!asset) return [];
  
  // Get current price
  const currentPrice = asset.price;
  
  // Generate points based on timeframe
  const points: PricePoint[] = [];
  const now = new Date();
  let volatility = asset.type === 'crypto' ? 0.08 : 0.03; // Crypto is more volatile
  
  // Number of data points to generate
  let numPoints = 0;
  let startDate = new Date();
  
  switch(timeframe) {
    case 'day':
      numPoints = 24; // Hourly data
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      volatility = volatility / 3; // Lower for shorter timeframes
      break;
    case 'week':
      numPoints = 7 * 4; // 4 times a day for a week
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      volatility = volatility / 2;
      break;
    case 'month':
      numPoints = 30; // Daily data
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      numPoints = 52; // Weekly data
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      volatility = volatility * 2; // Higher for longer timeframes
      break;
  }
  
  // Generate price points
  let lastPrice = currentPrice * (Math.random() * 0.4 + 0.8); // Start with 80-120% of current price
  
  for (let i = 0; i < numPoints; i++) {
    const pointDate = new Date(startDate.getTime() + ((now.getTime() - startDate.getTime()) * (i / numPoints)));
    
    // Random walk with trend toward current price
    const trend = (currentPrice - lastPrice) / (numPoints - i + 1) * 0.5;
    const randomChange = ((Math.random() * 2) - 1) * volatility * lastPrice;
    lastPrice = Math.max(0.01, lastPrice + trend + randomChange);
    
    points.push({
      timestamp: pointDate.getTime(),
      price: lastPrice
    });
  }
  
  // Ensure the last point is the current price
  points.push({
    timestamp: now.getTime(),
    price: currentPrice
  });
  
  return points;
};

// Get stocks - required by Market.tsx
export const getStocks = async (): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockAssets.filter(asset => asset.type === 'stock');
};

// Get cryptos - required by Market.tsx
export const getCryptos = async (): Promise<AssetData[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockAssets.filter(asset => asset.type === 'crypto');
};
