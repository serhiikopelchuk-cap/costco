import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the token
      authService.setToken(token);
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [navigate, searchParams]);

  return null;
};

export default AuthCallback; 