import React from 'react';
import { Bar } from 'react-chartjs-2';
import { CostType } from '../../types/program'; // Import CostType
import './BottomCharts.css';

interface BottomChartsProps {
  indirectCostsData: CostType;
}

const BottomCharts: React.FC<BottomChartsProps> = ({ indirectCostsData }) => {
  const periodsCount = 13; // Number of periods (P1 to P13)

  const calculateAverageCosts = (costsData: CostType) => {
    const categoryAverages: { label: string; average: number }[] = [];
    costsData.programs.forEach((program) => {
      program.projects.forEach((project) => {
        project.categories.forEach((category) => {
          const totalCosts = Array(periodsCount).fill(0);
          let itemCount = 0;
          category.items.forEach((item) => {
            item.costs.forEach((cost, index) => {
              if (index < periodsCount) {
                const value = typeof cost.value === 'string' ? parseFloat(cost.value) : cost.value;
                if (!isNaN(value)) {
                  totalCosts[index] += value;
                }
              }
            });
            itemCount++;
          });
          const average = totalCosts.reduce((acc, val) => acc + val, 0) / itemCount;
          categoryAverages.push({ label: category.name, average });
        });
      });
    });
    return categoryAverages;
  };

  const categoryAverages = calculateAverageCosts(indirectCostsData);

  const barData = {
    labels: categoryAverages.map((category) => category.label),
    datasets: [
      {
        label: 'Average $ Spend Indirect Costs (Year 1)',
        data: categoryAverages.map((category) => category.average),
        backgroundColor: '#cce5ff', // Light blue bar color
        borderColor: '#007bff', // Blue border color
        borderWidth: 1, // Ensure border is visible
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to stretch
    scales: {
      x: {
        beginAtZero: true,
      },
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
    <div className="bottom-charts">
      <div className="chart">
        <h3>Average $ Spend Indirect Costs (Year 1)</h3>
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

export default BottomCharts; 