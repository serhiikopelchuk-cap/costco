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
      <img src={require('../logo.png')} alt="App Logo" className="logo" />
      {/* <h1>My App</h1> */}
      {/* Add navigation links or other header content here */}
    </header>
  );
}

export default Header;