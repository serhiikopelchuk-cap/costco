import React from 'react';
import Outline from './Outline';
import directCosts from '../data/direct-cost.json';

const DirectCosts: React.FC = () => {
  // Prepare the data structure
  const data = {
    Program1: {
      projects: {
        Project1: {
          categories: directCosts.categories.reduce((acc: Record<string, any>, category) => {
            acc[category.name] = category.lineItems.map(item => ({
              id: Date.now() + Math.random(), // Ensure unique IDs
              name: item.name,
              periods: item.periods
            }));
            return acc;
          }, {})
        },
        Project2: {
          categories: {
            Category2: [
              {
                id: 1,
                name: 'LINE ITEM-1 RELATED INFORMATION',
                periods: Array(13).fill(40),
              },
              {
                id: 2,
                name: 'LINE ITEM-2 RELATED INFORMATION',
                periods: Array(13).fill(50),
              },
            ],
          },
        },
      }
    }
  };

  return <Outline data={data} />;
};

export default DirectCosts; 