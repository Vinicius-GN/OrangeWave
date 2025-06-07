
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

interface Order {
  _id: string;
  userId: string;
  side: 'buy' | 'sell';
  assetId: string;
  assetName: string;
  symbol: string;
  type: 'stock' | 'crypto';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  status: string;
  timestamp: string;
  createdAt: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem('authToken');

  const fetchOrders = async () => {
    if (!user || !authToken) return;
    
    try {
      const response = await fetch(`${API_URL}/orders?userId=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: Order[] = await response.json();
        // Filter orders for current user
        const userOrders = data.filter(order => order.userId === user._id);
        setOrders(userOrders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: {
    assetSymbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
  }) => {
    if (!user || !authToken) throw new Error('User not authenticated');
    
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          side: orderData.type,
          assetSymbol: orderData.assetSymbol,
          quantity: orderData.quantity,
          price: orderData.price,
          total: orderData.quantity * orderData.price,
          fees: 0,
          status: 'pending',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      // Refresh orders list
      await fetchOrders();
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user && authToken) {
      fetchOrders();
    }
  }, [user, authToken]);

  return {
    orders,
    isLoading,
    error,
    createOrder,
    refreshOrders: fetchOrders
  };
};
