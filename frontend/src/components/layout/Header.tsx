import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import '../common/Button.css';
import ToggleButton from '../common/ToggleButton';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDirectOrIndirectPage = location.pathname === '/direct-costs' || location.pathname === '/indirect-costs';

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="header">
      <button className="hamburger button-primary" onClick={toggleSidebar}>☰</button>
      <img 
        src={require('../../costcologo.png')} 
        alt="App Logo" 
        className="logo" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      {isDirectOrIndirectPage && <ToggleButton />}
      <h1 className="header-title">Total Cost of Ownership (TCO) Portal</h1>
      <img 
        src={require('../../C3Elogo.png')} 
        alt="App Logo" 
        className="logo" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
    </header>
  );
}

export default Header;