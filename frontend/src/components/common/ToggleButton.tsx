import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ToggleButton.css';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchProgramsAsync } from '../../store/slices/costTypesSlice';
import { updateSelections, setCostType } from '../../store/slices/selectionSlice';
import { setDetails } from '../../store/slices/uiSlice';

const ToggleButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirect, setIsDirect] = useState(true);
  const dispatch = useAppDispatch();
  const programs = useAppSelector(state => state.costTypes.item?.programs || []);

  useEffect(() => {
    setIsDirect(location.pathname === '/direct-costs');
  }, [location.pathname]);

  const handleClick = async () => {
    const newPath = isDirect ? '/indirect-costs' : '/direct-costs';
    const alias = newPath === '/direct-costs' ? 'direct_costs' : 'indirect_costs';

    // First update the UI state
    setIsDirect(!isDirect);
    navigate(newPath);
    
    // Reset all selections and details
    dispatch(updateSelections({
      selectedProgramId: null,
      selectedProjectId: null,
      selectedCategoryId: null,
      selectedLineItems: []
    }));
    dispatch(setDetails(null));
    
    // Update cost type and fetch fresh data
    dispatch(setCostType(alias));
    await dispatch(fetchProgramsAsync());

    // After data is loaded, set initial selections if available
    const filteredPrograms = programs.filter(program => 
      program.projects.some(project => 
        project.categories.some(category => 
          category.costType?.id === (alias === 'direct_costs' ? 1 : 2)
        )
      )
    );

    if (filteredPrograms.length > 0) {
      const firstProgram = filteredPrograms[0];
      const firstProject = firstProgram.projects.find(project => 
        project.categories.some(category => 
          category.costType?.id === (alias === 'direct_costs' ? 1 : 2)
        )
      );
      
      if (firstProgram && firstProject) {
        dispatch(updateSelections({
          selectedProgramId: firstProgram.id,
          selectedProjectId: firstProject.id,
          selectedCategoryId: null,
          selectedLineItems: []
        }));
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