import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ToggleButton.css';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../../store/slices/costTypesSlice';
import { setProgramId, setProjectId, setCategoryId, setLineItems } from '../../store/slices/selectionSlice';

const ToggleButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirect, setIsDirect] = useState(true);
  const dispatch = useAppDispatch();
  const costTypes = useAppSelector(state => state.costTypes);

  useEffect(() => {
    setIsDirect(location.pathname === '/direct-costs');
  }, [location.pathname]);

  const handleClick = async () => {
    setIsDirect(!isDirect);
    const newPath = isDirect ? '/indirect-costs' : '/direct-costs';
    navigate(newPath);

    const alias = newPath === '/direct-costs' ? 'direct_costs' : 'indirect_costs';
    await dispatch(fetchCostTypeByAliasAsync(alias));

    // Select the first available Program, Project, Category, and Item
    const costType = alias === 'direct_costs' ? costTypes.directCosts : costTypes.indirectCosts;
    if (costType && costType.programs.length > 0) {
      const firstProgram = costType.programs[0];
      if (firstProgram.projects.length > 0) {
        const firstProject = firstProgram.projects[0];
        if (firstProject.categories.length > 0) {
          const firstCategory = firstProject.categories[0];
          const firstItem = firstCategory.items.length > 0 ? firstCategory.items[0] : null;

          dispatch(setProgramId(firstProgram.id));
          dispatch(setProjectId(firstProject.id));
          dispatch(setCategoryId(firstCategory.id));
          dispatch(setLineItems(firstItem ? [firstItem] : []));
        }
      }
    }
  };

  return (
    <button className="toggle-page" onClick={handleClick}>
      <span className={`toggle-option ${isDirect ? 'active' : 'inactive'}`}>Direct Costs</span>
      <span className={`toggle-option ${!isDirect ? 'active' : 'inactive'}`}>Indirect Costs</span>
    </button>
  );
};

export default ToggleButton; 