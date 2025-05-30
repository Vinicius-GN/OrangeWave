import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Types
interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client'; // Added role field
  idNumber?: string;
  phone?: string;
  address?: UserAddress;
  balance: {
    wallet: number;
    investment: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    name: string, 
    idNumber?: string, 
    phone?: string,
    address?: UserAddress
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalance: (amount: number) => void;
  createAdmin: (adminData: { name: string; email: string; phone?: string }) => void; // Added admin creation
  getAdmins: () => UserProfile[]; // Added admin retrieval
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Determine user role based on email or stored data
  const determineUserRole = (email: string): 'admin' | 'client' => {
    // Check if user is admin@gmail.com
    if (email === 'admin@gmail.com') {
      return 'admin';
    }
    
    // Check if user is stored as admin in localStorage
    const adminsKey = 'orangewave_admins';
    const adminsJson = localStorage.getItem(adminsKey);
    const admins = adminsJson ? JSON.parse(adminsJson) : [];
    
    const isStoredAdmin = admins.some((admin: UserProfile) => admin.email === email);
    if (isStoredAdmin) return 'admin';
    
    // Check if email contains 'admin' for demo purposes
    return email.includes('admin') ? 'admin' : 'client';
  };
  
  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to get from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      // Also fetch balance
      const { data: balanceData } = await (supabase as any)
        .from('balances')
        .select('cash')
        .eq('user_id', userId)
        .single();
      
      // Check for profile in localStorage as fallback (for existing users)
      const storedUserJson = localStorage.getItem('orangewave_user');
      const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
      
      // Determine user role
      const userRole = determineUserRole(profileData.email || storedUser?.email || '');
      
      // Create profile object with Supabase balance if it exists
      const userProfile: UserProfile = {
        id: userId,
        name: profileData.name || (storedUser?.name || ''),
        email: profileData.email || (storedUser?.email || ''),
        role: userRole, // Set role based on determination
        phone: profileData.phone || (storedUser?.phone || ''),
        idNumber: storedUser?.idNumber || '',
        address: storedUser?.address || undefined,
        balance: {
          wallet: balanceData?.cash || 10000, // Default starting balance if no Supabase balance
          investment: 0
        }
      };
      
      setUser(userProfile);
      
      // Save to localStorage for components that still use it
      localStorage.setItem('orangewave_user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      // Important: Always set loading to false when we're done fetching
      setIsLoading(false);
    }
  };
  
  // Handle auth state changes
  useEffect(() => {
    // Immediately check for existing session to prevent blank loading state
    const checkExistingSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('Found existing session');
          setSession(existingSession);
          setSupabaseUser(existingSession.user);
          await fetchUserProfile(existingSession.user.id);
        } else {
          // No session exists, we can stop loading
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };

    // Call this immediately
    checkExistingSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        // Update the session state regardless of event type
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // Handle specific events
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Use a non-blocking approach to prevent auth deadlocks
          // We already updated the session state above
          setTimeout(() => fetchUserProfile(currentSession.user.id), 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login function with role-based redirection
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Login successful',
        description: 'Welcome back to OrangeWave!',
      });
    } catch (error: any) {
      setIsLoading(false); // Important: set loading to false on error
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to log in. Please check your credentials.',
        variant: 'destructive',
      });
      throw error;
    }
    // Note: isLoading will be set to false by the onAuthStateChange listener
  };
  
  // Register function
  const register = async (
    email: string, 
    password: string, 
    name: string, 
    idNumber?: string, 
    phone?: string,
    address?: UserAddress
  ) => {
    try {
      setIsLoading(true);
      
      // Register with Supabase Auth
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      // If we have a user ID, update the profile with additional data
      if (data?.user?.id) {
        // Determine role for new user
        const userRole = determineUserRole(email);
        
        // Create backward compatibility data for localStorage
        const newUser: UserProfile = {
          id: data.user.id,
          name,
          email,
          role: userRole, // Set role based on determination
          idNumber,
          phone,
          address,
          balance: {
            wallet: 10000, // Starting balance for demo
            investment: 0
          }
        };
        
        // Store in localStorage for backward compatibility
        localStorage.setItem('orangewave_user', JSON.stringify(newUser));
        
        // For backward compatibility with existing code
        const usersKey = 'orangewave_users';
        const usersJson = localStorage.getItem(usersKey);
        const users = usersJson ? JSON.parse(usersJson) : {};
        users[email] = {
          password,
          user: newUser
        };
        localStorage.setItem(usersKey, JSON.stringify(users));
      }
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully.',
      });
    } catch (error: any) {
      setIsLoading(false); // Important: set loading to false on error
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
      throw error;
    }
    // Note: isLoading will be set to false by the onAuthStateChange listener
  };
  
  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('orangewave_user');
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Logout failed',
        description: 'Something went wrong during logout.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add updateUserBalance function if it doesn't exist already
  const updateUserBalance = (amount: number) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      
      const newBalance = {
        ...prev.balance,
        wallet: prev.balance.wallet + amount
      };
      
      // Update localStorage for components that use it
      const updatedUser = {
        ...prev,
        balance: newBalance
      };
      
      localStorage.setItem('orangewave_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };
  
  // Create admin function
  const createAdmin = (adminData: { name: string; email: string; phone?: string }) => {
    const adminsKey = 'orangewave_admins';
    const adminsJson = localStorage.getItem(adminsKey);
    const admins = adminsJson ? JSON.parse(adminsJson) : [];
    
    const newAdmin: UserProfile = {
      id: `admin-${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      role: 'admin',
      phone: adminData.phone,
      balance: {
        wallet: 0,
        investment: 0
      }
    };
    
    admins.push(newAdmin);
    localStorage.setItem(adminsKey, JSON.stringify(admins));
    
    toast({
      title: 'Admin created',
      description: `Admin ${adminData.name} has been created successfully.`,
    });
  };
  
  // Get admins function
  const getAdmins = (): UserProfile[] => {
    const adminsKey = 'orangewave_admins';
    const adminsJson = localStorage.getItem(adminsKey);
    return adminsJson ? JSON.parse(adminsJson) : [];
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserBalance,
        createAdmin,
        getAdmins
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
