// Stock management service for OrangeWave Trading Platform
// Handles stock inventory operations for trading assets including increment/decrement functionality

// Base API URL for backend communication
const API_URL = 'http://localhost:3001/api';

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
 * Increases the available stock quantity for a specific asset
 * Used when new stock is added to the system or when orders are cancelled
 * 
 * @param assetId - Unique identifier of the asset to modify
 * @param quantity - Number of units to add to current stock
 * @param currentStock - Current stock level (optional, defaults to 0)
 * @returns Promise with updated asset data
 */
export const incrementStock = async (assetId: string, quantity: number, currentStock?: number) => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        // Add quantity to current stock, fallback to 0 if currentStock is undefined
        availableStock: (currentStock || 0) + quantity
      })
    });

    if (!response.ok) {
      throw new Error('Failed to increment stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error incrementing stock:', error);
    throw error;
  }
};

/**
 * Decreases the available stock quantity for a specific asset
 * Used when assets are purchased or reserved by users
 * Prevents stock from going below zero to maintain data integrity
 * 
 * @param assetId - Unique identifier of the asset to modify
 * @param quantity - Number of units to subtract from current stock
 * @param currentStock - Current stock level (required for validation)
 * @returns Promise with updated asset data
 */
export const decrementStock = async (assetId: string, quantity: number, currentStock: number) => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        // Ensure stock never goes below 0 using Math.max
        availableStock: Math.max(0, currentStock - quantity)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to decrement stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error decrementing stock:', error);
    throw error;
  }
};
