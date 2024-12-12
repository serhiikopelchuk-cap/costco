import React from 'react';
import { CostType, Program } from '../../types/program';

interface ForecastTableProps {
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ directCostsData, indirectCostsData }) => {
  const periodsCount = 6; // Initial Investment + Year 1 to Year 5

  const calculateProgramCosts = (program: Program, isDirectCost: boolean) => {
    const settings = program.settings as {
      directInvestment: number;
      indirectInvestment: number;
      directGrowthRates: number[];
      indirectGrowthRates: number[];
    };

    const investment = isDirectCost ? settings.directInvestment : settings.indirectInvestment;
    const growthRates = isDirectCost ? settings.directGrowthRates : settings.indirectGrowthRates;
    
    // Initialize with investment value
    const costs = [investment];
    
    // Calculate costs for each year using growth rates
    let currentValue = investment;
    for (let i = 0; i < periodsCount - 1; i++) {
      const growthRate = (growthRates[i] || 0) / 100; // Convert percentage to decimal
      currentValue = currentValue * (1 + growthRate);
      costs.push(currentValue);
    }
    
    return costs;
  };

  const calculateTotalCosts = (costsData: CostType, isDirectCost: boolean) => {
    const totalCosts = Array(periodsCount).fill(0);
    
    costsData.programs.forEach(program => {
      const programCosts = calculateProgramCosts(program, isDirectCost);
      programCosts.forEach((cost, index) => {
        totalCosts[index] += cost;
      });
    });

    return totalCosts;
  };

  const directTotal = calculateTotalCosts(directCostsData, true);
  const indirectTotal = calculateTotalCosts(indirectCostsData, false);
  const totalCosts = directTotal.map((value, index) => value + indirectTotal[index]);

  const cumulativeCosts = totalCosts.reduce((acc, value, index) => {
    acc.push((acc[index - 1] || 0) + value);
    return acc;
  }, [] as number[]);

  const calculateAverageGrowthRates = (costsData: CostType, isDirectCost: boolean) => {
    const growthRates = Array(periodsCount - 1).fill(0);
    let programCount = 0;

    costsData.programs.forEach(program => {
      const settings = program.settings as {
        directGrowthRates: number[];
        indirectGrowthRates: number[];
      };
      const rates = isDirectCost ? settings.directGrowthRates : settings.indirectGrowthRates;
      
      if (rates) {
        rates.forEach((rate, index) => {
          growthRates[index] += rate; // rates are already in percentage
        });
        programCount++;
      }
    });

    return growthRates.map(total => programCount ? total / programCount : 0);
  };

  const directGrowthRates = calculateAverageGrowthRates(directCostsData, true);
  const indirectGrowthRates = calculateAverageGrowthRates(indirectCostsData, false);

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
            <td>{(directTotal.reduce((acc, val) => acc + val, 0) / periodsCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Indirect Costs</td>
            {indirectTotal.map((value, index) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td>{indirectTotal.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            <td>{(indirectTotal.reduce((acc, val) => acc + val, 0) / periodsCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Total Costs</td>
            {totalCosts.map((value, index) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td>{totalCosts.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            <td>{(totalCosts.reduce((acc, val) => acc + val, 0) / periodsCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
          </tr>
          <tr>
            <td>Cumulative Costs</td>
            {cumulativeCosts.map((value: number, index: number) => (
              <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            ))}
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td>Direct Growth Rate</td>
            <td>base year</td>
            {directGrowthRates.map((rate, index) => (
              <td key={index}>+ {rate.toFixed(1)}%</td>
            ))}
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td>Indirect Growth Rate</td>
            <td>base year</td>
            {indirectGrowthRates.map((rate, index) => (
              <td key={index}>+ {rate.toFixed(1)}%</td>
            ))}
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ForecastTable; 