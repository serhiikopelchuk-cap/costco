import axios from 'axios';
import { API_BASE_URL, SSO_LOGIN_URL, SSO_LOGOUT_URL } from '../config';
import { User } from '../types/program';
import jwtDecode from 'jwt-decode';

// Set up axios interceptor for JWT
const setupAxiosInterceptors = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const authService = {
  // Initiate SSO login
  login: () => {
    window.location.href = SSO_LOGIN_URL;
  },

  // Handle SSO logout
  logout: async () => {
    try {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      await axios.post(`${API_BASE_URL}/auth/logout`);
      window.location.href = SSO_LOGOUT_URL;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Set up axios interceptor if token exists
      setupAxiosInterceptors(token);

      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      setupAxiosInterceptors(token);
      await axios.get(`${API_BASE_URL}/auth/verify`);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Set token after successful authentication
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    setupAxiosInterceptors(token);
  },

  // For development/testing
  devLogin: async (email: string): Promise<User | null> => {
    if (process.env.NODE_ENV === 'development') {
      const response = await axios.post(`${API_BASE_URL}/auth/dev-login`, { email });
      const { token } = response.data;
      if (token) {
        authService.setToken(token);
      }
      return response.data.user;
    }
    return null;
  }
}; 