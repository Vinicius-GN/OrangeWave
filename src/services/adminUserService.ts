// Admin user management service for OrangeWave Trading Platform
// Provides localStorage-based user management for admin panel functionality
// This service is used for demonstration/development - production should use backend API

// User profile interface defining the structure for admin panel user management
interface UserProfile {
  id: string;                    // Unique identifier for the user
  name: string;                  // Full name of the user
  email: string;                 // Email address (used for login)
  role: 'admin' | 'client';     // User role determining access permissions
  phone?: string;                // Optional phone number
  balance: {
    wallet: number;              // Available cash balance
    investment: number;          // Total value of investments/holdings
  };
}

// localStorage key for persisting admin user data
const ADMIN_USERS_KEY = 'orangewave_admin_users';

/**
 * Initializes the admin user system with default mock users
 * Creates a diverse set of users with different roles and balances for testing
 * Only runs if no existing users are found in localStorage
 * 
 * @returns Array of UserProfile objects (either existing or newly created)
 */
export const initializeAdminUsers = (): UserProfile[] => {
  const existingUsers = localStorage.getItem(ADMIN_USERS_KEY);
  
  if (!existingUsers) {
    // Create initial mock users
    const initialUsers: UserProfile[] = [
      {
        id: 'admin-1',
        email: 'admin@gmail.com',
        name: 'System Admin',
        role: 'admin',
        phone: '+1234567890',
        balance: {
          wallet: 0,
          investment: 0
        }
      },
      {
        id: 'user-1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'client',
        phone: '+1234567891',
        balance: {
          wallet: 1500,
          investment: 5000
        }
      },
      {
        id: 'user-2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'client',
        phone: '+1234567892',
        balance: {
          wallet: 500,
          investment: 2500
        }
      },
      {
        id: 'user-3',
        email: 'robert.jones@example.com',
        name: 'Robert Jones',
        role: 'admin',
        phone: '+1234567893',
        balance: {
          wallet: 2500,
          investment: 10000
        }
      },
      {
        id: 'user-4',
        email: 'emily.brown@example.com',
        name: 'Emily Brown',
        role: 'client',
        phone: '+1234567894',
        balance: {
          wallet: 100,
          investment: 1000
        }
      },
      {
        id: 'user-5',
        email: 'michael.davis@example.com',
        name: 'Michael Davis',
        role: 'client',
        phone: '+1234567895',
        balance: {
          wallet: 800,
          investment: 3000
        }
      }
    ];
    
    // Persist initial users to localStorage for future sessions
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  
  // Return existing users from localStorage
  return JSON.parse(existingUsers);
};

/**
 * Retrieves all users from localStorage
 * @returns Array of UserProfile objects or empty array if none exist
 */
export const getAdminUsers = (): UserProfile[] => {
  const users = localStorage.getItem(ADMIN_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

/**
 * Persists user array to localStorage
 * @param users - Array of UserProfile objects to save
 */
export const saveAdminUsers = (users: UserProfile[]): void => {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
};

/**
 * Adds a new user to the system
 * Automatically generates a unique ID based on current timestamp
 * 
 * @param user - User data without ID (will be generated)
 * @returns Complete UserProfile object with generated ID
 */
export const addAdminUser = (user: Omit<UserProfile, 'id'>): UserProfile => {
  const users = getAdminUsers();
  const newUser: UserProfile = {
    ...user,
    id: `user-${Date.now()}`      // Generate unique ID using timestamp
  };
  
  const updatedUsers = [...users, newUser];
  saveAdminUsers(updatedUsers);
  
  return newUser;
};

/**
 * Removes a user from the system by ID
 * @param id - Unique identifier of the user to delete
 * @returns true if user was deleted, false if user was not found
 */
export const deleteAdminUser = (id: string): boolean => {
  const users = getAdminUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  // Check if any user was actually removed
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  saveAdminUsers(filteredUsers);
  return true;
};

/**
 * Updates an existing user's information
 * Uses partial update pattern - only provided fields will be changed
 * 
 * @param id - Unique identifier of the user to update
 * @param updatedUser - Partial user data containing fields to update
 * @returns Updated UserProfile object or null if user not found
 */
export const updateAdminUser = (id: string, updatedUser: Partial<UserProfile>): UserProfile | null => {
  const users = getAdminUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null; // User not found
  }
  
  // Merge existing user data with updates
  const updated = { ...users[userIndex], ...updatedUser };
  users[userIndex] = updated;
  
  saveAdminUsers(users);
  
  return updated;
};
