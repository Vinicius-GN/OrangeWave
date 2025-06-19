
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

export const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem('authToken');

  const fetchBalance = async () => {
    if (!user || !authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/balance`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      } else {
        setError('Failed to fetch balance');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && authToken) {
      fetchBalance();
    }
  }, [user, authToken]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance: fetchBalance
  };
};
