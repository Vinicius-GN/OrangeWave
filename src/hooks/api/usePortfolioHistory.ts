
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

interface PortfolioHistoryItem {
  _id: string;
  userId: string;
  date: string;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const usePortfolioHistory = (timeframe: '1W' | '1M' | '6M' | '1Y' = '1M') => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PortfolioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioHistory = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/portfolio-history/${user._id}?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch portfolio history: ${response.statusText}`);
        }

        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching portfolio history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio history');
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioHistory();
  }, [user?._id, timeframe]);

  return { history, isLoading, error };
};
