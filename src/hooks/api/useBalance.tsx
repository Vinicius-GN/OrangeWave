
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

export const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/wallet/${user._id}/balance`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      } else {
        setError('Failed to fetch balance');
        setBalance(0);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    await fetchBalance();
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance
  };
};
