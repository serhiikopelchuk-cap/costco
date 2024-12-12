import React from 'react';
import CostTypePage from '../components/CostTypePage';
import { RootState } from '../store';

const DirectCosts: React.FC = () => {
  return (
    <CostTypePage 
      costTypeSelector={(state: RootState) => state.costTypes}
      // showAllPrograms={false}
    />
  );
};

export default DirectCosts;