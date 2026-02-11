export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text
  phone?: string;
  address?: string;
  bio?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

export interface UserData {
  transactions: Transaction[];
  accounts: Account[];
  categories: string[];
  categoryLimits: { [key: string]: number };
  budgetMode: 'smart' | 'custom';
  customLimit: string;
}