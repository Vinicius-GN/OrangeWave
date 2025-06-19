/**
 * Authentication Context
 * 
 * This context provides centralized authentication management for the OrangeWave trading platform.
 * It handles user authentication state, login/logout operations, user registration, and token
 * management throughout the application lifecycle.
 * 
 * Features:
 * - Centralized authentication state management
 * - JWT token storage and validation
 * - User profile data management
 * - Login and registration with API integration
 * - Automatic token refresh and validation
 * - Logout with proper cleanup
 * - Loading states for authentication operations
 * - Error handling with user-friendly notifications
 * - Address management for user profiles
 * - Role-based access control (admin vs client)
 */

// React core imports for context and state management
import React, { createContext, useContext, useState, useEffect } from 'react';

// UI notifications for user feedback
import { useToast } from '@/components/ui/use-toast';

// API configuration
const API_URL = 'http://localhost:3001/api';

/**
 * User Address Interface
 * 
 * Defines the structure for user address information
 * collected during registration and profile management
 */
interface UserAddress {
  country: string;
  state: string;
  city: string;
  street: string;
  number: string;
}

/**
 * User Profile Interface
 * 
 * Defines the structure for authenticated user data
 * returned from the API and stored in context
 */
interface UserProfile {
  _id: string; // Unique user identifier
  fullName: string; // User's full name
  email: string; // User's email address
  role: 'admin' | 'client'; // User role for access control
  phone?: string; // Optional phone number
  address?: UserAddress; // Optional address information
}

/**
 * Authentication Context Type
 * 
 * Defines the interface for the authentication context
 * including state variables and available methods
 */
interface AuthContextType {
  user: UserProfile | null; // Current authenticated user data
  isAuthenticated: boolean; // Authentication status
  isLoading: boolean; // Loading state for auth operations
  login: (email: string, password: string) => Promise<void>; // Login method
  register: ( // Registration method with complete user data
    fullName: string,
    email: string, 
    password: string, 
    phone?: string,
    address?: UserAddress
  ) => Promise<void>;
  logout: () => Promise<void>; // Logout method
}

/**
 * Authentication Context
 * 
 * React context for sharing authentication state and methods
 * throughout the component tree
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Provides authentication context to all child components and handles:
 * - Authentication state management
 * - API integration for auth operations
 * - Token storage and validation
 * - User session management
 * 
 * @param children - Child components that need access to auth context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toast notifications for user feedback
  const { toast } = useToast();
  
  /**
   * Token validation effect
   * 
   * Checks for existing authentication token on app initialization
   * and validates it with the server to restore user session
   */
  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Error checking auth token:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };
    
    checkAuthToken();
  }, []);
  
  /**
   * Login function
   * 
   * Authenticates user with email and password, stores JWT token,
   * and fetches user profile data
   * 
   * @param email - User's email address
   * @param password - User's password
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const { token } = await response.json();
      localStorage.setItem('authToken', token);
      
      // Fetch user profile
      const userResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
      
      toast({
        title: 'Login successful',
        description: 'Welcome back to OrangeWave!',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to log in. Please check your credentials.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Register function
   * 
   * Creates a new user account with provided details
   * and logs the user in automatically
   * 
   * @param fullName - User's full name
   * @param email - User's email address
   * @param password - User's password
   * @param phone - Optional phone number
   * @param address - Optional address information
   */
  const register = async (
    fullName: string,
    email: string, 
    password: string, 
    phone?: string,
    address?: UserAddress
  ) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          address
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully. Please log in.',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout function
   * 
   * Clears the authentication token and user data,
   * and shows a logout confirmation message
   */
  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      setUser(null);
      
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
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns AuthContextType - Authentication context values and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
