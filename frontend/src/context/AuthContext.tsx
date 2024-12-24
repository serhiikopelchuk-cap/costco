import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  accessGranted: boolean;
  groups?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

// Export the context so it can be imported by useAuth hook
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      login(token);
    }
  }, []);

  const login = (token: string) => {
    try {
      // Decode the JWT token
      const decoded = jwtDecode(token) as any;
      console.log('Decoded token:', decoded);

      // Store token
      localStorage.setItem('auth_token', token);

      // Set user info from token
      setUser({
        id: decoded.sub,
        email: decoded.email,
        accessGranted: decoded.accessGranted,
        groups: decoded.groups
      });

      // Set authenticated state
      setIsAuthenticated(true);

      console.log('Authentication successful');
    } catch (error) {
      console.error('Failed to process token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 