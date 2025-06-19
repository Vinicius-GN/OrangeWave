import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface PriceSnapshot {
  _id: string;
  assetId: string;
  timeframe: string;
  timestamp: string;
  price: number;
  __v: number;
}

// Map chart timeframes to API timeframes
const getApiTimeframe = (chartTimeframe: 'hour' | 'day' | 'month') => {
  switch (chartTimeframe) {
    case 'hour':
      return 'hour'; // 1D chart uses hourly data
    case 'day':
      return 'day';  // 1W and 1M charts use daily data
    case 'month':
      return 'month'; // 1Y chart uses monthly data
    default:
      return 'month';
  }
};

export const usePriceSnapshots = (assetId: string, timeframe: 'hour' | 'day' | 'month' = 'day') => {
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceSnapshots = async () => {
      if (!assetId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const apiTimeframe = getApiTimeframe(timeframe);
        const response = await fetch(`${API_URL}/prices/${assetId}?timeframe=${apiTimeframe}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch price snapshots: ${response.statusText}`);
        }

        const data = await response.json();
        const sortedData = Array.isArray(data) ? 
          data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : 
          [];
        
        setSnapshots(sortedData);
      } catch (err) {
        console.error('Error fetching price snapshots:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch price snapshots');
        setSnapshots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceSnapshots();
  }, [assetId, timeframe]);

  return { snapshots, isLoading, error };
};