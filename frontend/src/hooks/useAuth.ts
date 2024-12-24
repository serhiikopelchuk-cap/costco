import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export interface User {
  id: string;
  email: string;
  groups?: string[];
  hasAccess: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token?: string) => void;
  logout: () => void;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 