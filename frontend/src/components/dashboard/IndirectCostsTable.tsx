import React from 'react';
import indirectCostData from '../../data/indirect-costs.json';

const IndirectCostsTable: React.FC = () => {
  const periodsCount = 13; // Number of periods (P1 to P13)

  const calculateTotal = (periods: number[]) => periods.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
  const calculateAverage = (periods: number[]) => (calculateTotal(periods) / periods.length).toFixed(2);

  return (
    <div className="indirect-costs-table">
      <h3>Indirect Costs (Year 1)</h3>
      <table>
        <thead>
          <tr>
            <th>Cost Type</th>
            {Array.from({ length: periodsCount }, (_, i) => (
              <th key={i}>P{i + 1}</th>
            ))}
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {/* {indirectCostData.categories.map((category) => {
            const periods = category.lineItems.length
              ? category.lineItems.reduce((acc, item) => {
                  return acc.map((sum, i) => sum + (isNaN(item.periods[i]) ? 0 : item.periods[i]));
                }, Array(periodsCount).fill(0))
              : Array(periodsCount).fill(0);

            return (
              <tr key={category.name}>
                <td>{category.name}</td>
                {periods.map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
                <td>{calculateTotal(periods)}</td>
                <td>{calculateAverage(periods)}</td>
              </tr>
            );
          })} */}
        </tbody>
      </table>
    </div>
  );
};

export default IndirectCostsTable; 