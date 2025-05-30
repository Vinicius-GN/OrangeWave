
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { seedAssets, createPriceSnapshots } from '@/utils/seedAssets';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SupabaseInitializer: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, supabaseUser } = useAuth();

  // Ensure user profile and balance exists
  useEffect(() => {
    const ensureUserProfileAndBalance = async () => {
      if (!supabaseUser) return;
      
      try {
        // Check if user has a profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', supabaseUser.id)
          .single();
        
        // If no profile, create one
        if (profileError && profileError.code === 'PGRST116') {
          await supabase.from('profiles').insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email
          });
        }
        
        // Check if user has a balance
        const { data: balanceData, error: balanceError } = await (supabase as any)
          .from('balances')
          .select('user_id')
          .eq('user_id', supabaseUser.id)
          .single();
          
        // If no balance, create one (with initial 10000)
        if (balanceError && balanceError.code === 'PGRST116') {
          await (supabase as any).from('balances').insert({
            user_id: supabaseUser.id,
            cash: 10000
          });
        }
      } catch (error) {
        console.error('Error ensuring user profile and balance:', error);
      }
    };
    
    if (isAuthenticated && supabaseUser) {
      ensureUserProfileAndBalance();
    }
  }, [isAuthenticated, supabaseUser]);

  useEffect(() => {
    const initializeSupabase = async () => {
      if (isInitialized) return;

      try {
        // Seed assets data
        await seedAssets();
        
        // Create initial price snapshots
        await createPriceSnapshots();
        
        setIsInitialized(true);
        toast({
          title: "Data initialized",
          description: "Market data has been loaded successfully.",
        });
      } catch (error) {
        console.error("Failed to initialize data:", error);
        toast({
          title: "Initialization error",
          description: "Failed to load market data. Some features may not work correctly.",
          variant: "destructive",
        });
      }
    };

    // Only initialize once the auth state is determined
    if (!isAuthenticated) return;

    // Initialize after a short delay to avoid blocking UI
    const timer = setTimeout(() => {
      initializeSupabase();
      
      // Set up periodic price snapshots - once every 5 minutes
      const snapshotInterval = setInterval(() => {
        createPriceSnapshots();
      }, 5 * 60 * 1000);
      
      return () => {
        clearInterval(snapshotInterval);
      };
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, toast]);

  // This is a utility component that doesn't render anything visible
  return null;
};

export default SupabaseInitializer;
