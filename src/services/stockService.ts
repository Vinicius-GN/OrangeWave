
const API_URL = 'http://localhost:3001/api';

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

export const incrementStock = async (assetId: string, quantity: number, currentStock?: number) => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
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

export const decrementStock = async (assetId: string, quantity: number, currentStock: number) => {
  try {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
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
