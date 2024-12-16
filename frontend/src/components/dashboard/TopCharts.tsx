import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { CostType, Program } from '../../types/program';
// import './TopCharts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TopChartsProps {
  settings: {
    directInvestment: number;
    indirectInvestment: number;
    directGrowthRates: number[];
    indirectGrowthRates: number[];
  };
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const TopCharts: React.FC<TopChartsProps> = ({ settings, directCostsData, indirectCostsData }) => {
  const periodsCount = 6;

  const calculateCosts = (isDirectCost: boolean) => {
    const investment = isDirectCost 
      ? settings?.directInvestment || 0 
      : settings?.indirectInvestment || 0;
    const growthRates = isDirectCost 
      ? settings?.directGrowthRates || Array(periodsCount - 1).fill(0)
      : settings?.indirectGrowthRates || Array(periodsCount - 1).fill(0);
    
    const costs = [investment];
    let currentValue = investment;
    
    for (let i = 0; i < periodsCount - 1; i++) {
      const growthRate = (growthRates[i] || 0) / 100;
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

