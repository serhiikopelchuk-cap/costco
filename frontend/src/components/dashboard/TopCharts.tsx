import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { CostType, Program } from '../../types/program';
// import './TopCharts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TopChartsProps {
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const TopCharts: React.FC<TopChartsProps> = ({ directCostsData, indirectCostsData }) => {
  const periodsCount = 6; // Initial Investment + Year 1 to Year 5

  // Calculate program costs using settings (similar to ForecastTable)
  const calculateProgramCosts = (program: Program, isDirectCost: boolean) => {
    if (!program.settings) {
      console.warn('Program settings are missing:', program);
      return Array(periodsCount).fill(0);
    }

    const settings = program.settings as {
      directInvestment: number;
      indirectInvestment: number;
      directGrowthRates: number[];
      indirectGrowthRates: number[];
    };

    const investment = isDirectCost ? (settings.directInvestment || 0) : (settings.indirectInvestment || 0);
    const growthRates = isDirectCost ? (settings.directGrowthRates || []) : (settings.indirectGrowthRates || []);
    
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

  // Calculate total costs for direct/indirect (similar to ForecastTable)
  const calculateTotalCosts = (costsData: CostType, isDirectCost: boolean) => {
    if (!costsData || !costsData.programs) {
      console.warn('Cost data is missing:', costsData);
      return Array(periodsCount).fill(0);
    }

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

  const lineData = {
    labels: ['Initial Investment', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Cumulative Costs',
        data: cumulativeCosts,
        borderColor: 'red',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        fill: false,
      },
      {
        label: 'Annual Costs',
        data: totalCosts,
        backgroundColor: '#cce5ff',
        borderColor: '#007bff',
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return `${value}$`;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="top-charts">
      <h3>Annual and Cumulative Costs</h3>
      <Line data={lineData} options={options} />
    </div>
  );
};

export default TopCharts; 

