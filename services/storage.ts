import { User, UserData, Transaction, Account } from '../types';

const USERS_KEY = 'budget_buddy_users';
const DATA_PREFIX = 'budget_buddy_data_';

// Initial default data template
const DEFAULT_DATA_TEMPLATE: UserData = {
  transactions: [],
  accounts: [
    { id: '1', name: 'Main Savings', type: 'Savings', balance: 0, color: 'from-blue-600 to-blue-400' },
    { id: '2', name: 'Wallet Cash', type: 'Cash', balance: 0, color: 'from-emerald-600 to-emerald-400' }
  ],
  categories: ['Food', 'Utilities', 'Entertainment', 'Transport', 'Healthcare', 'Shopping', 'Personal', 'Income'],
  categoryLimits: {},
  budgetMode: 'smart',
  customLimit: '10000'
};

export const StorageService = {
  // --- Auth Methods ---

  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  register: (name: string, email: string, password: string): User => {
    const users = StorageService.getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: 'USR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name,
      email,
      password // In a real app, hash this!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Initialize data for user
    // We clone the template to ensure no reference issues
    const initialData: UserData = JSON.parse(JSON.stringify(DEFAULT_DATA_TEMPLATE));

    StorageService.saveUserData(newUser.id, initialData);

    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return user;
  },

  updateUser: (userId: string, updates: Partial<User>): User => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error('User not found');
    }

    // Check email uniqueness if changing email
    if (updates.email && updates.email !== users[index].email) {
        if (users.find(u => u.email === updates.email)) {
            throw new Error('Email already taken');
        }
    }

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return updatedUser;
  },

  // --- Data Methods ---

  getUserData: (userId: string): UserData => {
    const dataStr = localStorage.getItem(DATA_PREFIX + userId);
    if (!dataStr) {
        // Fallback if data is missing but user exists
        return JSON.parse(JSON.stringify(DEFAULT_DATA_TEMPLATE));
    }
    return JSON.parse(dataStr);
  },

  saveUserData: (userId: string, data: UserData) => {
    localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data));
  },

  // Helper to partially update data
  updateUserData: (userId: string, partial: Partial<UserData>) => {
    const current = StorageService.getUserData(userId);
    const updated = { ...current, ...partial };
    StorageService.saveUserData(userId, updated);
  }
};