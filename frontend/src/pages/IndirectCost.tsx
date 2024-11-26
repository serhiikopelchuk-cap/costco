import React from 'react';
import Outline from './Outline';
import indirectCosts from '../data/indirect-costs.json';

const IndirectCost: React.FC = () => {
  // Prepare the data structure
  const data = {
    Program1: {
      name: 'Program1',
      projects: [
        {
          name: 'Project1',
          categories: indirectCosts.categories.map(category => ({
            name: category.name,
            items: category.lineItems.map(item => ({
              id: Date.now() + Math.random(), // Ensure unique IDs
              name: item.name,
              costs: item.costs.map(cost => ({ value: cost }))
            }))
          }))
        }
      ]
    }
  };

  const transformedData = data ? Object.values(data) : [];

  return <Outline data={transformedData} />;
};

export default IndirectCost; 