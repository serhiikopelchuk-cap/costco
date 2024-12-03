import React from 'react';
import './Sidebar.css';
import '../common/Button.css'; // Import button styles

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close button-secondary" onClick={toggleSidebar}>×</button>
      <nav className="menu">
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          {/* <li><a href="/outline">Outline</a></li> */}
          {/* <li><a href="/direct-cost-old">Direct Costs Old</a></li> */}
          <li><a href="/direct-costs">Direct Costs</a></li>
          <li><a href="/indirect-costs">Indirect Costs</a></li>
          <li><a href="/monthly-reports">Monthly Reports</a></li>
          {/* <li><a href="/enter-team-spend">Enter Team Spend</a></li> */}
          <li><a href="/login">Login</a></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;