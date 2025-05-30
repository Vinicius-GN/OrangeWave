
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  balance: {
    wallet: number;
    investment: number;
  };
}

const ADMIN_USERS_KEY = 'orangewave_admin_users';

// Initialize localStorage with mock users if empty
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
    
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  
  return JSON.parse(existingUsers);
};

// Get all users from localStorage
export const getAdminUsers = (): UserProfile[] => {
  const users = localStorage.getItem(ADMIN_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
export const saveAdminUsers = (users: UserProfile[]): void => {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
};

// Add new user
export const addAdminUser = (user: Omit<UserProfile, 'id'>): UserProfile => {
  const users = getAdminUsers();
  const newUser: UserProfile = {
    ...user,
    id: `user-${Date.now()}`
  };
  
  const updatedUsers = [...users, newUser];
  saveAdminUsers(updatedUsers);
  
  return newUser;
};

// Delete user
export const deleteAdminUser = (id: string): boolean => {
  const users = getAdminUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  saveAdminUsers(filteredUsers);
  return true;
};

// Update existing user
export const updateAdminUser = (id: string, updatedUser: Partial<UserProfile>): UserProfile | null => {
  const users = getAdminUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  const updated = { ...users[userIndex], ...updatedUser };
  users[userIndex] = updated;
  
  saveAdminUsers(users);
  
  return updated;
};
