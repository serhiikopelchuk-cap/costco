import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { API_BASE_URL } from '../../config';

const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleDevLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/dev-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { token } = await response.json();
      if (token) {
        authService.setToken(token);
        login();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  return process.env.NODE_ENV === 'development' ? (
    <div className="dev-login">
      <button onClick={handleDevLogin}>
        Development Login (Skip SSO)
      </button>
    </div>
  ) : null;
};

export default DevLogin; 