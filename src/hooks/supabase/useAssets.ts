
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Asset type for use throughout the app
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  price: number;
  openPrice: number;
  changePercent: number;
  marketCap?: number;
  logoUrl?: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('assets')
          .select('*');

        if (error) throw error;

        if (data) {
          // Transform data to match our Asset interface
          const transformedAssets: Asset[] = data.map((item: Tables<'assets'>) => ({
            id: item.id,
            symbol: item.id, // Using id as symbol since that's how we've set up our schema
            name: item.name,
            type: item.type as 'stock' | 'crypto',
            price: Number(item.current_price),
            openPrice: Number(item.open_price_today),
            changePercent: Number(item.day_change_percent),
            marketCap: item.market_cap ? Number(item.market_cap) : undefined,
            logoUrl: item.logo_url || undefined
          }));
          setAssets(transformedAssets);
        }
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch assets'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();

    // Set up real-time subscription
    const channel = supabase
      .channel('assets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        (payload) => {
          console.log('Assets change received:', payload);
          // Refresh the assets list when changes are detected
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to get a single asset by ID
  const getAssetById = async (id: string): Promise<Asset | null> => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          symbol: data.id,
          name: data.name,
          type: data.type as 'stock' | 'crypto',
          price: Number(data.current_price),
          openPrice: Number(data.open_price_today),
          changePercent: Number(data.day_change_percent),
          marketCap: data.market_cap ? Number(data.market_cap) : undefined,
          logoUrl: data.logo_url || undefined
        };
      }
      return null;
    } catch (err) {
      console.error(`Error fetching asset ${id}:`, err);
      return null;
    }
  };

  return {
    assets,
    isLoading,
    error,
    getAssetById
  };
};
