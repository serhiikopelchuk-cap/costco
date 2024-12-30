import React from 'react';
import { CostType, Program } from '../../types/program';

interface ForecastTableProps {
  settings: {
    directInvestment: number;
    indirectInvestment: number;
    directGrowthRates: number[];
    indirectGrowthRates: number[];
  };
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const ForecastTable: React.FC<ForecastTableProps> = ({ settings, directCostsData, indirectCostsData }) => {
  const periodsCount = 6;
  console.log("settings", settings, "directCostsData", directCostsData, "indirectCostsData", indirectCostsData);
  const calculateCosts = (isDirectCost: boolean) => {
    const investment = isDirectCost 
      ? settings?.directInvestment || 0 
      : settings?.indirectInvestment || 0;
    const growthRates = isDirectCost 
      ? settings?.directGrowthRates || Array(periodsCount - 1).fill(0)
      : settings?.indirectGrowthRates || Array(periodsCount - 1).fill(0);
    
    const sortedGrowthRates = growthRates.slice().sort((a, b) => a - b);
    
    const costs = [investment];
    let currentValue = investment;
    
    for (let i = 0; i < periodsCount - 1; i++) {
      const growthRate = (sortedGrowthRates[i] || 0) / 100;
      currentValue = currentValue * (1 + growthRate);
      costs.push(currentValue);
    }
    
    return costs;
  };

  const directTotal = calculateCosts(true);
  const indirectTotal = calculateCosts(false);
  const totalCosts = directTotal.map((value, index) => value + indirectTotal[index]);

  const cumulativeCosts = totalCosts.reduce((acc, value, index) => {
    acc.push((acc[index - 1] || 0) + value);
    return acc;
  }, [] as number[]);

  const calculateAverageGrowthRates = (costsData: CostType, isDirectCost: boolean) => {
    if (!costsData || !costsData.programs) {
      console.warn('Cost data is missing for growth rates:', costsData);
      return Array(periodsCount - 1).fill(0);
    }

    const growthRates = Array(periodsCount - 1).fill(0);
    let programCount = 0;

    costsData.programs.forEach(program => {
      if (!program.settings) return;

      const settings = program.settings as {
        directGrowthRates: number[];
        indirectGrowthRates: number[];
      };

      const rates = isDirectCost ? settings.directGrowthRates : settings.indirectGrowthRates;
      
      if (rates) {
        const sortedRates = rates.slice().sort((a, b) => a - b);
        sortedRates.forEach((rate, index) => {
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
            {settings.directGrowthRates.map((rate, index) => (
              <td key={index}>+{rate.toFixed(1)}%</td>
            ))}
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td>Indirect Growth Rate</td>
            <td>base year</td>
            {settings.indirectGrowthRates.map((rate, index) => (
              <td key={index}>+{rate.toFixed(1)}%</td>
            ))}
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ForecastTable; 