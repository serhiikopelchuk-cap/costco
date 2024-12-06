import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { CostType } from '../../types/program'; // Import CostType

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TopChartsProps {
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const TopCharts: React.FC<TopChartsProps> = ({ directCostsData, indirectCostsData }) => {
  const periodsCount = 13; // Number of periods (P1 to P13)
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

  const lineData = {
    labels: ['Initial Investment', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Cumulative Costs',
        data: cumulativeCosts.slice(0, growthRates.length),
        borderColor: 'red',
        backgroundColor: 'rgba(220, 53, 69, 0.2)', // Light red fill color
        fill: false, // Fill to the x-axis
      },
      {
        label: 'Annual Costs',
        data: totalCosts.slice(0, growthRates.length),
        backgroundColor: '#cce5ff', // Light blue bar color
        borderColor: '#007bff', // Blue border color
        fill: false, // Fill to the x-axis
      },
    ],
  };

  const options = {
    // responsive: false,
    // maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return `${value}$`; // Add dollar sign to y-axis labels
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
              label += `${context.parsed.y}$`; // Add dollar sign to tooltip values
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

