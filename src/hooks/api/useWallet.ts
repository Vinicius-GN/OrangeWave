import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

interface WalletBalance {
  balance: number;
}

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'trade';
  amount: number;
  description: string;
  createdAt: string;
  timestamp?: string; // Adding timestamp property that backend sends
}

export const useWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        const data: WalletBalance = await response.json();
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  const fetchTransactions = async () => {
    if (!user || !authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/transactions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: Transaction[] = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    }
  };

  const deposit = async (amount: number) => {
    if (!user || !authToken) throw new Error('User not authenticated');
    
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deposit failed');
      }
      
      // Refresh balance and transactions
      await fetchBalance();
      await fetchTransactions();
    } catch (error) {
      console.error('Error making deposit:', error);
      throw error;
    }
  };

  const withdraw = async (amount: number) => {
    if (!user || !authToken) throw new Error('User not authenticated');
    
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Withdrawal failed');
      }
      
      // Refresh balance and transactions
      await fetchBalance();
      await fetchTransactions();
    } catch (error) {
      console.error('Error making withdrawal:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadWalletData = async () => {
      if (user && authToken) {
        setIsLoading(true);
        await Promise.all([fetchBalance(), fetchTransactions()]);
        setIsLoading(false);
      }
    };
    
    loadWalletData();
  }, [user, authToken]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    deposit,
    withdraw,
    refreshData: () => Promise.all([fetchBalance(), fetchTransactions()])
  };
};
