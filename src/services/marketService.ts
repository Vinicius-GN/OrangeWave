// Market data service for OrangeWave Trading Platform
// Handles fetching and managing market data, asset information, and price history

// Base API URL for backend communication
const API_URL = 'http://localhost:3001/api';

// Data structure for individual price points in time series data
export interface PricePoint {
  timestamp: number;        // Unix timestamp in milliseconds
  price: number;           // Asset price at this timestamp
}

// Main asset interface representing tradeable financial instruments
export interface Asset {
  _id: string;             // MongoDB ObjectId as string
  symbol: string;          // Stock/crypto ticker symbol (e.g., 'AAPL', 'BTC')
  name: string;            // Full asset name (e.g., 'Apple Inc.', 'Bitcoin')
  description?: string;    // Optional detailed description
  type: 'stock' | 'crypto'; // Asset category for filtering and display
  price: number;           // Current market price
  marketCap: number;       // Total market capitalization
  volume: number;          // Trading volume (24h or daily)
  logoUrl?: string;        // Optional asset logo URL
  availableStock?: number; // Available quantity for trading
  changePercent?: number;  // Percentage change from previous period
  change?: number;         // Absolute price change from previous period
  isFrozen?: boolean;      // Whether trading is temporarily suspended
}

// Legacy type alias for backward compatibility with existing components
// Used by older components that haven't been migrated to the new Asset interface
export type AssetData = {
  id: string;              // Uses 'id' instead of '_id' for legacy compatibility
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  changePercent: number;
  change: number;
  marketCap: number;
  volume: number;
  logoUrl?: string;
  logo?: string;           // Duplicate field for backward compatibility
  availableStock?: number;
  isFrozen?: boolean;
};

// Retrieves JWT authentication token from browser's localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Constructs HTTP headers with authentication for API requests
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    // Include Authorization header only if token exists
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Fetches all available assets from the backend API
 * @returns Promise resolving to array of Asset objects
 */
export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch(`${API_URL}/assets`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    const assets = await response.json();
    // Normalize response data to ensure consistent Asset interface
    return assets.map((asset: any) => ({
      _id: asset._id,
      symbol: asset.symbol,
      name: asset.name,
      description: asset.description,
      type: asset.type,
      price: asset.price,
      marketCap: asset.marketCap,
      volume: asset.volume,
      logoUrl: asset.logoUrl,
      availableStock: asset.availableStock,
      changePercent: asset.changePercent || 0,  // Default to 0 if not provided
      change: asset.change || 0,                // Default to 0 if not provided
      isFrozen: asset.isFrozen || false         // Default to false if not provided
    }));
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

/**
 * Fetches a specific asset by its unique identifier
 * @param assetId - MongoDB ObjectId string of the asset
 * @returns Promise resolving to single Asset object
 */
export const fetchAssetById = async (assetId: string): Promise<Asset> => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch asset');
    }
    
    const asset = await response.json();
    // Normalize single asset response
    return {
      _id: asset._id,
      symbol: asset.symbol,
      name: asset.name,
      description: asset.description,
      type: asset.type,
      price: asset.price,
      marketCap: asset.marketCap,
      volume: asset.volume,
      logoUrl: asset.logoUrl,
      availableStock: asset.availableStock,
      changePercent: asset.changePercent || 0,
      change: asset.change || 0,
      isFrozen: asset.isFrozen || false
    };
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    throw error;
  }
};

// Legacy function alias for backward compatibility
export const getAssetById = fetchAssetById;

// Converts modern Asset interface to legacy AssetData format
const convertToAssetData = (asset: Asset): AssetData => ({
  id: asset._id,           // Convert _id to id for legacy compatibility
  symbol: asset.symbol,
  name: asset.name,
  type: asset.type,
  price: asset.price,
  changePercent: asset.changePercent || 0,
  change: asset.change || 0,
  marketCap: asset.marketCap,
  volume: asset.volume,
  logoUrl: asset.logoUrl,
  logo: asset.logoUrl,     // Duplicate for components expecting 'logo' field
  availableStock: asset.availableStock,
  isFrozen: asset.isFrozen
});

// Legacy function: Returns all assets in AssetData format
export const getAllAssets = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.map(convertToAssetData);
};

// Legacy function: Returns only stock assets in AssetData format
export const getStocks = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.filter(asset => asset.type === 'stock').map(convertToAssetData);
};

// Legacy function: Returns only cryptocurrency assets in AssetData format
export const getCryptos = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.filter(asset => asset.type === 'crypto').map(convertToAssetData);
};

/**
 * Fetches historical price data for charting and analysis
 * @param assetId - Unique identifier of the asset
 * @param timeframe - Time range for historical data
 * @returns Promise resolving to array of price points
 */
export const getPriceHistory = async (assetId: string, timeframe: 'day' | 'week' | 'month' | 'year'): Promise<PricePoint[]> => {
  try {
    // Map frontend timeframe to backend API parameters
    const rangeMap = {
      'day': '24h',
      'week': '1W',
      'month': '1M',
      'year': '1Y'
    };
    
    const range = rangeMap[timeframe];
    const response = await fetch(`${API_URL}/prices/${assetId}?timeframe=${range}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }
    
    const priceData = await response.json();
    
    // Convert MongoDB price snapshots to standardized PricePoint format
    return priceData.map((snapshot: any) => ({
      timestamp: new Date(snapshot.timestamp).getTime(),
      price: snapshot.price
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    // Return mock data as fallback to prevent chart from breaking
    return generateMockPriceData(timeframe);
  }
};

// Generates mock price data as fallback when API is unavailable
// This prevents charts from breaking during development or API downtime
const generateMockPriceData = (timeframe: 'day' | 'week' | 'month' | 'year'): PricePoint[] => {
  const basePrice = 100 + Math.random() * 900;  // Random base price between 100-1000
  const points: PricePoint[] = [];
  const now = Date.now();
  
  let intervals: number;    // Number of data points to generate
  let intervalMs: number;   // Time between each data point
  
  // Configure time intervals based on requested timeframe
  switch (timeframe) {
    case 'day':
      intervals = 24;                    // 24 hourly points
      intervalMs = 60 * 60 * 1000;      // 1 hour intervals
      break;
    case 'week':
      intervals = 7 * 4;                 // 28 points (4 per day)
      intervalMs = 6 * 60 * 60 * 1000;  // 6 hour intervals
      break;
    case 'month':
      intervals = 30;                    // 30 daily points
      intervalMs = 24 * 60 * 60 * 1000; // 1 day intervals
      break;
    case 'year':
      intervals = 52;                           // 52 weekly points
      intervalMs = 7 * 24 * 60 * 60 * 1000;   // 1 week intervals
      break;
  }
  
  // Generate realistic price movement with trend and volatility
  for (let i = intervals; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const variation = (Math.random() - 0.5) * 0.1; // ±10% random variation
    const price = basePrice * (1 + variation * (intervals - i) / intervals);
    
    points.push({
      timestamp,
      price: Math.max(price, 0.01)  // Ensure price never goes negative
    });
  }
  
  return points;
};

/**
 * Creates a new trading order in the system
 * @param orderData - Order details including asset, quantity, price, etc.
 * @returns Promise resolving to created order object
 */
export const createOrder = async (orderData: {
  userId: string;          // User placing the order
  side: 'buy' | 'sell';   // Order direction
  assetId: string;        // Asset being traded
  assetName: string;      // Human-readable asset name
  symbol: string;         // Trading symbol
  type: 'stock' | 'crypto'; // Asset type
  quantity: number;       // Number of units
  price: number;          // Price per unit
  total: number;          // Total order value
  fees: number;           // Trading fees
  status: string;         // Order status
  timestamp: string;      // Order creation time
}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
