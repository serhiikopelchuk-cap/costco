import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ToggleButton.css';


const ToggleButton: React.FC = () => {
  const [isDirect, setIsDirect] = useState(true);
  const navigate = useNavigate();

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