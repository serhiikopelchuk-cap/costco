import React, { useEffect } from 'react';
import Outline from '../components/outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { setProgramId, setProjectId, setCategoryId, setLineItems } from '../store/slices/selectionSlice';
import { setCurrentPage } from '../store/slices/uiSlice';

const DirectCosts: React.FC = () => {
  console.log('DirectCosts component rendered');

  const dispatch = useAppDispatch();
  const { directCosts: costType, status, error } = useAppSelector(state => state.costTypes);

  useEffect(() => {
    dispatch(fetchCostTypeByAliasAsync('direct_costs'));
  }, [dispatch]);

  useEffect(() => {
    if (costType && costType.programs.length > 0) {
      const firstProgram = costType.programs[0];
      const firstProject = firstProgram.projects[0];
      const firstCategory = firstProject.categories[0];
      const firstItem = firstCategory.items[0];

      dispatch(setProgramId(firstProgram.id));
      dispatch(setProjectId(firstProject.id));
      dispatch(setCategoryId(firstCategory.id));
      dispatch(setLineItems(firstItem ? [firstItem] : []));
    }
  }, [costType, dispatch]);

  useEffect(() => {
    dispatch(setCurrentPage('direct_costs'));
  }, [dispatch]);

  useEffect(() => {
    console.log('Direct Costs:', costType);
  }, [costType]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  if (!costType || !costType.programs || costType.programs.length === 0) {
    return <div>No data available</div>;
  }

  return <Outline data={costType.programs} />;
};

export default DirectCosts;