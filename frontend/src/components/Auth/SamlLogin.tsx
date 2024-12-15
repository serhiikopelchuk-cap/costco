import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const SamlLogin: React.FC = () => {
  const navigate = useNavigate();

  const handleSSOLogin = () => {
    // Redirect to backend SAML login endpoint
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="saml-login">
      <button onClick={handleSSOLogin}>
        Login with Costco SSO
      </button>
    </div>
  );
};

export default SamlLogin; 