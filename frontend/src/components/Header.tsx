import React from 'react';
import './Header.css';
import './Button.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <button className="hamburger button-primary" onClick={toggleSidebar}>☰</button>
      <img src={require('../costcologo.png')} alt="App Logo" className="logo" />
    </header>
  );
}

export default Header;