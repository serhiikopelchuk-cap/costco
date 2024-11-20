import React from 'react';
import Outline from './Outline';
import indirectCosts from '../data/indirect-costs.json';

const IndirectCost: React.FC = () => {
  // Prepare the data structure
  const data = {
    Program1: {
      projects: {
        Project1: {
          categories: indirectCosts.categories.reduce((acc: Record<string, any>, category) => {
            acc[category.name] = category.lineItems.map(item => ({
              id: Date.now() + Math.random(), // Ensure unique IDs
              name: item.name,
              periods: item.periods
            }));
            return acc;
          }, {})
        }
      }
    }
  };

  return <Outline data={data} />;
};

export default IndirectCost; 