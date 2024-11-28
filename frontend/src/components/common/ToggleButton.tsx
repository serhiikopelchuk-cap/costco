import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ToggleButton.css';

const ToggleButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirect, setIsDirect] = useState(true);

  useEffect(() => {
    setIsDirect(location.pathname === '/direct-costs');
  }, [location.pathname]);

  const handleClick = () => {
    setIsDirect(!isDirect);
    navigate(isDirect ? '/indirect-costs' : '/direct-costs');
  };

  return (
    <button className="toggle-page" onClick={handleClick}>
      <span className={`toggle-option ${isDirect ? 'active' : 'inactive'}`}>Direct Costs</span>
      <span className={`toggle-option ${!isDirect ? 'active' : 'inactive'}`}>Indirect Costs</span>
    </button>
  );
};

export default ToggleButton; 