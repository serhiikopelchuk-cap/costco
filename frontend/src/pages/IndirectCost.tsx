import React, { useEffect } from 'react';
import Outline from '../components/outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';

const IndirectCost: React.FC = () => {
  const dispatch = useAppDispatch();
  const { item: costType, status, error } = useAppSelector(state => state.costTypes);

  useEffect(() => {
    // Fetch CostType by alias
    if (status === 'idle') {
      dispatch(fetchCostTypeByAliasAsync('indirect_costs'));
    }
  }, [status, dispatch]);

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