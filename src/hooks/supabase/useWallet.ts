
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WalletPosition {
  id: string;
  userId: string;
  ticker: string;
  assetType: 'stock' | 'crypto';
  quantity: number;
  avgCost: number;
  value?: number; // Calculated field: quantity * current price
}

export const useWallet = () => {
  const [positions, setPositions] = useState<WalletPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    const fetchWalletPositions = async () => {
      try {
        setIsLoading(true);
        
        const { data: positionsData, error: positionsError } = await supabase
          .from('wallet_positions')
          .select(`
            id,
            user_id,
            ticker,
            asset_type,
            quantity,
            avg_cost
          `)
          .eq('user_id', user.id);

        if (positionsError) throw positionsError;

        // Fetch current prices to calculate position values
        const tickers = positionsData.map((pos: any) => pos.ticker);
        
        const { data: pricesData, error: pricesError } = await supabase
          .from('assets')
          .select('id, current_price')
          .in('id', tickers);

        if (pricesError) throw pricesError;

        // Create a mapping of ticker to current price
        const priceMap = pricesData.reduce((acc: Record<string, number>, asset: any) => {
          acc[asset.id] = Number(asset.current_price);
          return acc;
        }, {});

        // Transform the positions data
        const transformedPositions: WalletPosition[] = positionsData.map((item: any) => {
          const currentPrice = priceMap[item.ticker] || 0;
          return {
            id: item.id,
            userId: item.user_id,
            ticker: item.ticker,
            assetType: item.asset_type as 'stock' | 'crypto',
            quantity: Number(item.quantity),
            avgCost: Number(item.avg_cost),
            value: Number(item.quantity) * currentPrice
          };
        });

        setPositions(transformedPositions);
      } catch (err) {
        console.error('Error fetching wallet positions:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch wallet positions'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletPositions();

    // Set up real-time subscription
    const channel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'wallet_positions',
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          console.log('Wallet position change received:', payload);
          // Refresh the wallet positions list when changes are detected
          fetchWalletPositions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to calculate total wallet value
  const getTotalValue = (): number => {
    return positions.reduce((total, position) => total + (position.value || 0), 0);
  };

  // Function to buy an asset
  const buyAsset = async (
    ticker: string, 
    quantity: number, 
    price: number, 
    fee: number = 0,
    assetType: 'stock' | 'crypto' = 'stock'
  ): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to buy assets');
    }

    if (quantity <= 0 || price <= 0) {
      throw new Error('Quantity and price must be greater than zero');
    }

    try {
      const { data, error } = await supabase.rpc('perform_buy', {
        p_user_id: user.id,
        p_ticker: ticker,
        p_quantity: quantity,
        p_price: price,
        p_fee: fee,
        p_asset_type: assetType
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error buying asset:', err);
      throw err;
    }
  };

  // Function to sell an asset
  const sellAsset = async (
    ticker: string, 
    quantity: number, 
    price: number, 
    fee: number = 0
  ): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to sell assets');
    }

    if (quantity <= 0 || price <= 0) {
      throw new Error('Quantity and price must be greater than zero');
    }

    try {
      const { data, error } = await supabase.rpc('perform_sell', {
        p_user_id: user.id,
        p_ticker: ticker,
        p_quantity: quantity,
        p_price: price,
        p_fee: fee
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error selling asset:', err);
      throw err;
    }
  };

  return {
    positions,
    isLoading,
    error,
    getTotalValue,
    buyAsset,
    sellAsset
  };
};
