
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

interface PortfolioHistoryItem {
  _id: string;
  userId: string;
  date: string;
  totalValue: number;
}

export const usePortfolioHistory = (timeframe: '1W' | '1M' | '6M' | '1Y' = '1M') => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PortfolioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem('authToken');

  const fetchHistory = async () => {
    if (!user || !authToken) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/portfolio-history/${user._id}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: PortfolioHistoryItem[] = await response.json();
        setHistory(data);
      } else {
        setError('Failed to fetch portfolio history');
      }
    } catch (err) {
      console.error('Error fetching portfolio history:', err);
      setError('Failed to fetch portfolio history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && authToken) {
      fetchHistory();
    }
  }, [user, authToken, timeframe]);

  return {
    history,
    isLoading,
    error,
    refreshHistory: fetchHistory
  };
};
