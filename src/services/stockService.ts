
// Service to manage stock quantities in localStorage
const STOCK_STORAGE_KEY = 'asset_stock_data';

interface StockData {
  [assetId: string]: number;
}

// Get current stock data from localStorage
export const getStockData = (): StockData => {
  try {
    const stored = localStorage.getItem(STOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading stock data from localStorage:', error);
    return {};
  }
};

// Update stock quantity for a specific asset
export const updateAssetStock = (assetId: string, newQuantity: number): void => {
  try {
    const stockData = getStockData();
    stockData[assetId] = Math.max(0, newQuantity); // Ensure stock doesn't go negative
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockData));
    console.log(`Updated stock for ${assetId}: ${stockData[assetId]} units`);
  } catch (error) {
    console.error('Error updating stock data in localStorage:', error);
  }
};

// Get stock quantity for a specific asset
export const getAssetStock = (assetId: string, defaultStock?: number): number => {
  const stockData = getStockData();
  return stockData[assetId] !== undefined ? stockData[assetId] : (defaultStock ?? 0);
};

// Decrement stock when purchasing
export const decrementStock = (assetId: string, quantity: number, currentStock?: number): void => {
  const stockData = getStockData();
  const existingStock = stockData[assetId] !== undefined ? stockData[assetId] : (currentStock ?? 0);
  const newStock = Math.max(0, existingStock - quantity);
  updateAssetStock(assetId, newStock);
};

// Increment stock when selling
export const incrementStock = (assetId: string, quantity: number, currentStock?: number): void => {
  const stockData = getStockData();
  const existingStock = stockData[assetId] !== undefined ? stockData[assetId] : (currentStock ?? 0);
  const newStock = existingStock + quantity;
  updateAssetStock(assetId, newStock);
};
