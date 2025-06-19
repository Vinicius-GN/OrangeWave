/**
 * @file AuthContext.tsx
 * @brief Authentication context for OrangeWave trading platform.
 *
 * Centralizes authentication state and operations:
 *  - Login and registration with API integration
 *  - JWT token storage and validation
 *  - User profile fetching and state management
 *  - Automatic token check on app startup
 *  - Logout and cleanup
 *  - Provides hooks for components to access auth state and methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const API_URL = 'http://localhost:3001/api';

/**
 * @struct UserAddress
 * @brief Structure representing a user’s address information.
 *
 * @var country  Country name
 * @var state    State or region
 * @var city     City name
 * @var street   Street name
 * @var number   Street number or apartment
 */
interface UserAddress {
  country: string;
  state: string;
  city: string;
  street: string;
  number: string;
}

/**
 * @struct UserProfile
 * @brief Structure representing an authenticated user’s profile.
 *
 * @var _id     Unique user identifier
 * @var fullName  User’s full name
 * @var email     User’s email address
 * @var role      User’s role ('admin'|'client')
 * @var phone     Optional phone number
 * @var address   Optional address object
 */
interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  address?: UserAddress;
}

/**
 * @interface AuthContextType
 * @brief Defines the shape of the authentication context.
 *
 * @var user            Current authenticated user or null
 * @var isAuthenticated Boolean indicating if user is logged in
 * @var isLoading       Boolean indicating an ongoing auth operation
 * @var login           Function to perform login
 * @var register        Function to register a new user
 * @var logout          Function to perform logout
 */
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    address?: UserAddress
  ) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * @brief React context for authentication.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @brief Provides authentication state and methods to child components.
 *
 * On mount:
 *  - Checks for existing JWT in localStorage
 *  - Validates token with API and fetches user profile
 * 
 * Exposes:
 *  - user, isAuthenticated, isLoading state
 *  - login(), register(), logout() methods
 *
 * @param children  React children to render within this provider
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  /**
   * @brief Effect to validate existing token and restore session.
   *
   * Retrieves token from localStorage, calls /users/me to fetch profile,
   * and sets user state accordingly. Removes invalid tokens.
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
   * @brief Performs user login.
   *
   * Sends credentials to /auth/login, stores returned JWT,
   * fetches user profile, and updates context state.
   *
   * @param email     User’s email address
   * @param password  User’s password
   * @throws Error if login fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
   * @brief Registers a new user.
   *
   * Sends new user data to /auth/register. On success, notifies user.
   *
   * @param fullName  User’s full name
   * @param email     User’s email
   * @param password  User’s password
   * @param phone     Optional phone number
   * @param address   Optional address object
   * @throws Error if registration fails
   */
  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    address?: UserAddress
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, phone, address })
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
   * @brief Logs out the current user.
   *
   * Clears JWT from localStorage, resets user state, and notifies.
   */
  const logout = async (): Promise<void> => {
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

  /**
   * @brief Provides authentication context values and methods.
   */
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
 * @brief Custom hook to consume authentication context.
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType with user, state flags, and auth methods
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
