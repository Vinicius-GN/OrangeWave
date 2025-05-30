
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export interface Trade {
  id: string;
  userId: string;
  assetId: string;
  assetSymbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  total: number;
  timestamp: string;
}

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTrades([]);
      setIsLoading(false);
      return;
    }

    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        
        const { data: tradesData, error: tradesError } = await supabase
          .from('trades')
          .select(`
            *,
            assets (id, name)
          `)
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (tradesError) throw tradesError;

        if (tradesData) {
          const transformedTrades: Trade[] = tradesData.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            assetId: item.asset_id,
            assetSymbol: item.asset_id, // Using the asset ID as symbol
            side: item.side as 'buy' | 'sell',
            quantity: Number(item.quantity),
            price: Number(item.price),
            fee: Number(item.fee || 0),
            total: Number(item.quantity) * Number(item.price),
            timestamp: item.timestamp
          }));
          setTrades(transformedTrades);
        }
      } catch (err) {
        console.error('Error fetching trades:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch trades'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();

    // Set up real-time subscription
    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'trades',
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          console.log('Trades change received:', payload);
          // Refresh the trades list when changes are detected
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to create a new trade
  const createTrade = async (trade: Omit<Trade, 'id' | 'userId' | 'timestamp'>): Promise<Trade> => {
    if (!user) {
      throw new Error('User must be authenticated to create a trade');
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          asset_id: trade.assetId,
          side: trade.side,
          quantity: trade.quantity,
          price: trade.price,
          fee: trade.fee || 0,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        assetId: data.asset_id,
        assetSymbol: trade.assetSymbol,
        side: data.side as 'buy' | 'sell',
        quantity: Number(data.quantity),
        price: Number(data.price),
        fee: Number(data.fee || 0),
        total: Number(data.quantity) * Number(data.price),
        timestamp: data.timestamp
      };
    } catch (err) {
      console.error('Error creating trade:', err);
      throw err;
    }
  };

  return {
    trades,
    isLoading,
    error,
    createTrade
  };
};
