
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PriceSnapshot {
  id: string;
  assetId: string;
  price: number;
  recordedAt: string;
}

export const usePriceSnapshots = (assetId?: string, limit = 100) => {
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!assetId) {
      setSnapshots([]);
      setIsLoading(false);
      return;
    }

    const fetchSnapshots = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('price_snapshots')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(limit);

        if (assetId) {
          query = query.eq('asset_id', assetId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const transformedSnapshots: PriceSnapshot[] = data.map(item => ({
            id: item.id,
            assetId: item.asset_id,
            price: Number(item.price),
            recordedAt: item.recorded_at || new Date().toISOString()
          }));
          setSnapshots(transformedSnapshots);
        }
      } catch (err) {
        console.error('Error fetching price snapshots:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch price snapshots'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnapshots();

    // Set up real-time subscription for price snapshots
    const channel = supabase
      .channel('price-snapshots-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'price_snapshots',
          filter: assetId ? `asset_id=eq.${assetId}` : undefined
        },
        (payload) => {
          console.log('Price snapshot change received:', payload);
          // Add the new snapshot to our state
          const newSnapshot = payload.new as any;
          setSnapshots(prevSnapshots => [
            {
              id: newSnapshot.id,
              assetId: newSnapshot.asset_id,
              price: Number(newSnapshot.price),
              recordedAt: newSnapshot.recorded_at || new Date().toISOString()
            },
            ...prevSnapshots.slice(0, limit - 1)
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assetId, limit]);

  // Function to add a new price snapshot
  const addPriceSnapshot = async (snapshot: Omit<PriceSnapshot, 'id' | 'recordedAt'>): Promise<PriceSnapshot> => {
    try {
      const { data, error } = await supabase
        .from('price_snapshots')
        .insert({
          asset_id: snapshot.assetId,
          price: snapshot.price,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        assetId: data.asset_id,
        price: Number(data.price),
        recordedAt: data.recorded_at || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error adding price snapshot:', err);
      throw err;
    }
  };

  return {
    snapshots,
    isLoading,
    error,
    addPriceSnapshot
  };
};
