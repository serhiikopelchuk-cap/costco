import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { jwtDecode } from "jwt-decode";
import { User } from '../types/program';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for token in URL if we're on the auth-success page
        if (location.pathname === '/auth-success') {
          const params = new URLSearchParams(location.search);
          const token = params.get('token');
          if (token) {
            console.log('Received token on auth-success page');
            authService.setToken(token);
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              console.log('Successfully fetched user after SSO:', currentUser);
              setUser(currentUser);
              setIsAuthenticated(true);
              navigate('/dashboard');
              return;
            }
          }
          // If we're on auth-success but don't have a valid token/user, redirect to login
          console.log('No valid token/user on auth-success, redirecting to login');
          navigate('/login');
          return;
        }

        // Check if user is already authenticated
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Found existing token, verifying...');
          const isAuth = await authService.isAuthenticated();
          if (isAuth) {
            console.log('Token is valid, fetching user...');
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              console.log('Successfully fetched existing user:', currentUser);
              setUser(currentUser);
              setIsAuthenticated(true);
              if (location.pathname === '/login' || location.pathname === '/') {
                navigate('/dashboard');
              }
            }
          } else {
            console.log('Token is invalid, clearing auth state');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
            if (location.pathname !== '/login') {
              navigate('/login');
            }
          }
        } else if (location.pathname !== '/login' && location.pathname !== '/') {
          console.log('No token found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [location.pathname, navigate]);

  const login = () => {
    console.log('Initiating login...');
    authService.login();
  };

  const logout = async () => {
    console.log('Logging out...');
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 