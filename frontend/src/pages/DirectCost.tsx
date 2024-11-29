import React, { useEffect } from 'react';
import Outline from '../components/outline/Outline';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { setCurrentPage } from '../store/slices/uiSlice';

const DirectCosts: React.FC = () => {
  console.log('DirectCosts component rendered');

  const dispatch = useAppDispatch();
  const { directCosts: costType, status, error } = useAppSelector(state => state.costTypes);

  console.log('Direct Costs:', costType);
  useEffect(() => {
    dispatch(fetchCostTypeByAliasAsync('direct_costs'));
  }, [dispatch]);

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