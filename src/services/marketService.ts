
const API_URL = 'http://localhost:3001/api';

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface Asset {
  _id: string;
  symbol: string;
  name: string;
  description?: string;
  type: 'stock' | 'crypto';
  price: number;
  marketCap: number;
  volume: number;
  logoUrl?: string;
  availableStock?: number;
  changePercent?: number;
  change?: number;
  isFrozen?: boolean;
}

// Legacy type alias for backward compatibility
export type AssetData = {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  changePercent: number;
  change: number;
  marketCap: number;
  volume: number;
  logoUrl?: string;
  logo?: string;
  availableStock?: number;
  isFrozen?: boolean;
};

// Get authentication token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Get headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch(`${API_URL}/assets`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    const assets = await response.json();
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
      changePercent: asset.changePercent || 0,
      change: asset.change || 0,
      isFrozen: asset.isFrozen || false
    }));
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const fetchAssetById = async (assetId: string): Promise<Asset> => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch asset');
    }
    
    const asset = await response.json();
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

// Legacy function for backward compatibility
export const getAssetById = fetchAssetById;

// Convert Asset to AssetData format for backward compatibility
const convertToAssetData = (asset: Asset): AssetData => ({
  id: asset._id,
  symbol: asset.symbol,
  name: asset.name,
  type: asset.type,
  price: asset.price,
  changePercent: asset.changePercent || 0,
  change: asset.change || 0,
  marketCap: asset.marketCap,
  volume: asset.volume,
  logoUrl: asset.logoUrl,
  logo: asset.logoUrl,
  availableStock: asset.availableStock,
  isFrozen: asset.isFrozen
});

// Legacy functions for backward compatibility
export const getAllAssets = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.map(convertToAssetData);
};

export const getStocks = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.filter(asset => asset.type === 'stock').map(convertToAssetData);
};

export const getCryptos = async (): Promise<AssetData[]> => {
  const assets = await fetchAssets();
  return assets.filter(asset => asset.type === 'crypto').map(convertToAssetData);
};

export const getPriceHistory = async (assetId: string, timeframe: 'day' | 'week' | 'month' | 'year'): Promise<PricePoint[]> => {
  try {
    // Map timeframe to API parameter
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
    
    // Convert MongoDB price snapshots to PricePoint format
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

// Fallback mock data generator (kept as backup)
const generateMockPriceData = (timeframe: 'day' | 'week' | 'month' | 'year'): PricePoint[] => {
  const basePrice = 100 + Math.random() * 900;
  const points: PricePoint[] = [];
  const now = Date.now();
  
  let intervals: number;
  let intervalMs: number;
  
  switch (timeframe) {
    case 'day':
      intervals = 24;
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case 'week':
      intervals = 7 * 4;
      intervalMs = 6 * 60 * 60 * 1000; // 6 hours
      break;
    case 'month':
      intervals = 30;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case 'year':
      intervals = 52;
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
  }
  
  for (let i = intervals; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const variation = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + variation * (intervals - i) / intervals);
    
    points.push({
      timestamp,
      price: Math.max(price, 0.01)
    });
  }
  
  return points;
};

export const createOrder = async (orderData: {
  userId: string;
  side: 'buy' | 'sell';
  assetId: string;
  assetName: string;
  symbol: string;
  type: 'stock' | 'crypto';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  status: string;
  timestamp: string;
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
