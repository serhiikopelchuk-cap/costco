import React, { useEffect } from 'react';
import Outline from '../components/outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { setProgramId, setProjectId, setCategoryId, setLineItems } from '../store/slices/selectionSlice';
import { setCurrentPage } from '../store/slices/uiSlice';

const IndirectCost: React.FC = () => {
  const dispatch = useAppDispatch();
  const { item: costType, status, error } = useAppSelector(state => state.costTypes);

  useEffect(() => {
    // Fetch CostType by alias
    dispatch(fetchCostTypeByAliasAsync('indirect_costs'));
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
    dispatch(setCurrentPage('indirect_costs'));
  }, [dispatch]);

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

export default IndirectCost; 