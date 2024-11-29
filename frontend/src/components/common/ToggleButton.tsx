import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ToggleButton.css';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../../store/slices/costTypesSlice';

const ToggleButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirect, setIsDirect] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsDirect(location.pathname === '/direct-costs');
  }, [location.pathname]);

  const handleClick = () => {
    setIsDirect(!isDirect);
    const newPath = isDirect ? '/indirect-costs' : '/direct-costs';
    navigate(newPath);
    dispatch(fetchCostTypeByAliasAsync(newPath === '/direct-costs' ? 'direct_costs' : 'indirect_costs'));
  };

  return (
    <button className="toggle-page" onClick={handleClick}>
      <span className={`toggle-option ${isDirect ? 'active' : 'inactive'}`}>Direct Costs</span>
      <span className={`toggle-option ${!isDirect ? 'active' : 'inactive'}`}>Indirect Costs</span>
    </button>
  );
};

export default ToggleButton; 