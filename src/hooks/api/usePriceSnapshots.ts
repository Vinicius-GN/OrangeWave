
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

        const response = await fetch(`${API_URL}/prices/${assetId}?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch price snapshots: ${response.statusText}`);
        }

        const data = await response.json();
        setSnapshots(Array.isArray(data) ? data : []);
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
