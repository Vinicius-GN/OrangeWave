
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Balance {
  cash: number;
}

export const useBalance = () => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        
        // Cast supabase to any to bypass type checking for tables not in types.ts
        const { data: balanceData, error: balanceError } = await (supabase as any)
          .from('balances')
          .select('cash')
          .eq('user_id', user.id)
          .single();

        if (balanceError) throw balanceError;

        setBalance(balanceData ? { cash: Number(balanceData.cash) } : { cash: 0 });
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up real-time subscription
    const channel = (supabase as any)
      .channel('balance-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'balances',
          filter: `user_id=eq.${user.id}` 
        },
        (payload: any) => {
          console.log('Balance change received:', payload);
          if (payload.new) {
            setBalance({ cash: Number(payload.new.cash) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to perform a cash move (deposit or withdrawal)
  const performCashMove = async (type: 'deposit' | 'withdrawal', amount: number): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to perform cash moves');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    try {
      // Optimistic update to immediately reflect change in UI
      const currentBalance = balance?.cash || 0;
      const newBalance = type === 'deposit' ? currentBalance + amount : currentBalance - amount;
      
      // Update local state immediately for better UX
      setBalance(prev => prev ? { cash: newBalance } : { cash: newBalance });
      
      // Then perform the actual server operation
      const { data, error } = await (supabase as any).rpc('perform_cash_move', {
        p_user_id: user.id,
        p_type: type,
        p_amount: amount
      });

      if (error) {
        // Revert optimistic update if server call fails
        setBalance(prev => prev ? { cash: currentBalance } : { cash: 0 });
        throw error;
      }

      // Display success message
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`,
        description: `$${amount.toFixed(2)} has been ${type === 'deposit' ? 'added to' : 'subtracted from'} your account.`
      });

      return data;
    } catch (err) {
      console.error(`Error performing ${type}:`, err);
      
      // Show error message
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`,
        description: `There was a problem with your ${type}. Please try again.`,
        variant: "destructive"
      });
      
      throw err;
    }
  };

  return {
    balance,
    isLoading,
    error,
    deposit: (amount: number) => performCashMove('deposit', amount),
    withdraw: (amount: number) => performCashMove('withdrawal', amount)
  };
};
