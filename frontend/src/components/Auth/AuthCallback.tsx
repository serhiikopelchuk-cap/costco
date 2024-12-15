import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // 1. Get token from URL params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // 2. Store token in auth context/localStorage
      login(token);
      // 3. Redirect to app dashboard
      navigate('/dashboard');
    }
  }, []);

  return <div>Processing authentication...</div>;
};

export default AuthCallback; 