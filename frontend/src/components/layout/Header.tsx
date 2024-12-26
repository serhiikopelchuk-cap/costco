import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';
import '../common/Button.css';
import ToggleButton from '../common/ToggleButton';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const isDirectOrIndirectPage = location.pathname === '/direct-costs' || location.pathname === '/indirect-costs';

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  const handleUserInfoClick = () => {
    navigate('/user');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger button-primary" onClick={toggleSidebar}>☰</button>
        <img 
          src={require('../../costcologo.png')} 
          alt="App Logo" 
          className="logo" 
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
        {isDirectOrIndirectPage && <ToggleButton />}
      </div>
      
      <div className="header-center">
        <h1 className="header-title">Total Cost of Ownership (TCO) Portal</h1>
      </div>

      <div className="header-right">
        <img 
          src={require('../../C3Elogo.png')} 
          alt="App Logo" 
          className="logo" 
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
        <div 
          className="header-user-info" 
          onClick={handleUserInfoClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar">
            {isAuthenticated && user?.email ? user.email[0].toUpperCase() : '?'}
          </div>
          <span className="username">
            {isAuthenticated && user?.email ? user.email : 'Guest'}
          </span>
        </div>
        <button 
          className="auth-button"
          onClick={handleAuthClick}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
}

export default Header;