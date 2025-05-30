
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CashMove {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  createdAt: string;
}

export const useCashMoves = () => {
  const [cashMoves, setCashMoves] = useState<CashMove[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCashMoves([]);
      setIsLoading(false);
      return;
    }

    const fetchCashMoves = async () => {
      try {
        setIsLoading(true);
        
        const { data, error: cashMovesError } = await (supabase as any)
          .from('cash_moves')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (cashMovesError) throw cashMovesError;

        if (data) {
          const transformedMoves: CashMove[] = data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            type: item.type as 'deposit' | 'withdrawal',
            amount: Number(item.amount),
            createdAt: item.created_at
          }));
          
          setCashMoves(transformedMoves);
        }
      } catch (err) {
        console.error('Error fetching cash moves:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch cash moves'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashMoves();

    // Set up real-time subscription
    const channel = (supabase as any)
      .channel('cash-moves-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'cash_moves',
          filter: `user_id=eq.${user.id}` 
        },
        (payload: any) => {
          console.log('Cash move change received:', payload);
          // Refresh the cash moves list when changes are detected
          fetchCashMoves();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to perform a cash deposit
  const deposit = async (amount: number): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to make a deposit');
    }

    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }

    try {
      const { data, error } = await (supabase as any).rpc('perform_cash_move', {
        p_user_id: user.id,
        p_type: 'deposit',
        p_amount: amount
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error creating deposit:', err);
      throw err;
    }
  };

  // Function to perform a cash withdrawal
  const withdraw = async (amount: number): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to make a withdrawal');
    }

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    try {
      const { data, error } = await (supabase as any).rpc('perform_cash_move', {
        p_user_id: user.id,
        p_type: 'withdrawal',
        p_amount: amount
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error creating withdrawal:', err);
      throw err;
    }
  };

  return {
    cashMoves,
    isLoading,
    error,
    deposit,
    withdraw
  };
};
