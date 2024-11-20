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
      <h1 className="header-title">Total Cost of Ownership (TCO) Portal</h1>
    </header>
  );
}

export default Header;