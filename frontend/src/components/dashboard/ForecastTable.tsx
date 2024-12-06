import React from 'react';
import { CostType } from '../../types/program'; // Import CostType
// import './ForecastTable.css';

interface ForecastTableProps {
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ directCostsData, indirectCostsData }) => {
  const periodsCount = 6; // Number of periods (Initial Investment + Year 1 to Year 5)
  const growthRates = [0, 0.06, 0.06, 0.06, 0.10]; // Growth rates for Year 2-5

  const calculateTotalCosts = (costsData: CostType) => {
    const totalCosts = Array(periodsCount).fill(0);
    costsData.programs.forEach((program) => {
      program.projects.forEach((project) => {
        project.categories.forEach((category) => {
          category.items.forEach((item) => {
            item.costs.forEach((cost, index) => {
              if (index < periodsCount) {
                const value = typeof cost.value === 'string' ? parseFloat(cost.value) : cost.value;
                if (!isNaN(value)) {
                  totalCosts[index] += value;
                }
              }
            });
          });
        });
      });
    });
    return totalCosts;
  };

  const directTotal = calculateTotalCosts(directCostsData);
  const indirectTotal = calculateTotalCosts(indirectCostsData);
  const totalCosts = directTotal.map((value, index) => value + indirectTotal[index]);

  const cumulativeCosts = totalCosts.reduce((acc, value, index) => {
    acc.push((acc[index - 1] || 0) + value);
    return acc;
  }, [] as number[]);

  return (
    <div className="forecast-table">
      <h3>Forecast</h3>
      <table>
        <thead>
          <tr>
            <th>Cost Type</th>
            <th>Initial Investment</th>
            {Array.from({ length: periodsCount - 1 }, (_, i) => (
              <th key={i}>Year {i + 1}</th>
            ))}
            <th>Total</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Direct Costs</td>
            {directTotal.map((value, index) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td>{directTotal.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            <td>{(directTotal.reduce((acc, val) => acc + val, 0) / (periodsCount - 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Indirect Costs</td>
            {indirectTotal.map((value, index) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td>{indirectTotal.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            <td>{(indirectTotal.reduce((acc, val) => acc + val, 0) / (periodsCount - 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Total Costs</td>
            {totalCosts.map((value, index) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td>{totalCosts.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            <td>{(totalCosts.reduce((acc, val) => acc + val, 0) / (periodsCount - 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Cumulative Costs</td>
            {cumulativeCosts.map((value: number, index: number) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td>Avg Cost Growth Rate</td>
            <td>base year</td>
            {growthRates.map((rate, index) => (
              <td key={index}>+ {rate * 100}%</td>
            ))}
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ForecastTable; 