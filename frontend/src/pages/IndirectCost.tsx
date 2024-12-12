import React from 'react';
import CostTypePage from '../components/CostTypePage';
import { RootState } from '../store';

const IndirectCost: React.FC = () => {
  return (
    <CostTypePage 
      currentPage="indirect_costs"
    />
  );
};

export default IndirectCost; 