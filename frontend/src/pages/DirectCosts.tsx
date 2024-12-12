import React from 'react';
import CostTypePage from '../components/CostTypePage';
import { RootState } from '../store';

const DirectCosts: React.FC = () => {
  return (
    <CostTypePage 
      currentPage="direct_costs"
    />
  );
};

export default DirectCosts;