import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';
import './Button.css';
import ToggleButton from './ToggleButton';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const isDirectOrIndirectPage = location.pathname === '/direct-costs' || location.pathname === '/indirect-costs';

  return (
    <header className="header">
      <button className="hamburger button-primary" onClick={toggleSidebar}>☰</button>
      <img src={require('../costcologo.png')} alt="App Logo" className="logo" />
      {isDirectOrIndirectPage && <ToggleButton />}
      <h1 className="header-title">Total Cost of Ownership (TCO) Portal</h1>
    </header>
  );
}

export default Header;