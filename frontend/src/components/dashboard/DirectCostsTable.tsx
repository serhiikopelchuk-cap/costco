import React from 'react';
import directCostData from '../../data/direct-cost.json';

const DirectCostsTable: React.FC = () => {
  const calculateTotal = (periods: number[]) => periods.reduce((acc, val) => acc + val, 0);
  const calculateAverage = (periods: number[]) => (calculateTotal(periods) / periods.length).toFixed(2);

  return (
    <div className="direct-costs-table">
      <h3>Direct Costs (Year 1)</h3>
      <table>
        <thead>
          <tr>
            <th>Cost Type</th>
            <th>P1</th>
            <th>P2</th>
            <th>P3</th>
            <th>P4</th>
            <th>P5</th>
            <th>P6</th>
            <th>P7</th>
            <th>P8</th>
            <th>P9</th>
            <th>P10</th>
            <th>P11</th>
            <th>P12</th>
            <th>P13</th>
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {directCostData.categories.map((category) => (
            <tr key={category.name}>
              <td>{category.name}</td>
              {category.lineItems[0].periods.map((_, index) => (
                <td key={index}>
                  {category.lineItems.reduce((sum, item) => sum + item.periods[index], 0)}
                </td>
              ))}
              <td>{calculateTotal(category.lineItems.flatMap(item => item.periods))}</td>
              <td>{calculateAverage(category.lineItems.flatMap(item => item.periods))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DirectCostsTable; 