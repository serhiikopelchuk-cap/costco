import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CostType } from '../../types/program'; // Import CostType
import './DirectCostsTable.css';

interface DirectCostsTableProps {
  directCostsData: CostType;
}

const DirectCostsTable: React.FC<DirectCostsTableProps> = ({ directCostsData }) => {
  const periodsCount = 13; // Number of periods (P1 to P13)
  const initialVisibleCategories = 5; // Number of categories to show initially
  const [visibleCategories, setVisibleCategories] = useState(initialVisibleCategories);

  const calculateCategoryCosts = (category: any) => {
    const totalCosts = Array(periodsCount).fill(0);
    category.items.forEach((item: any) => {
      item.costs.forEach((cost: any, index: number) => {
        if (index < periodsCount) {
          const value = typeof cost.value === 'string' ? parseFloat(cost.value) : cost.value;
          if (!isNaN(value)) {
            totalCosts[index] += value;
          }
        }
      });
    });
    return totalCosts;
  };

  const allCategories = directCostsData.programs.flatMap(program =>
    program.projects.flatMap(project => project.categories)
  );

  const handleLoadMore = () => {
    setVisibleCategories((prev) => prev + initialVisibleCategories);
  };

  const directTotal = allCategories.flatMap(category => calculateCategoryCosts(category));

  const barData = {
    labels: Array.from({ length: periodsCount }, (_, i) => `P${i + 1}`),
    datasets: [
      {
        label: 'Direct Costs (Year 1)',
        data: directTotal,
        backgroundColor: 'rgba(220, 53, 69, 0.2)', // Light red fill color
        borderColor: '#dc3545', // Red border color
        borderWidth: 1, // Ensure border is visible
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to stretch
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
    <div className="direct-costs-section">
      <div className="chart">
        <h3>Average $ spend Direct Costs (Year 1)</h3>
        <Bar data={barData} options={options} />
      </div>
      <div className="direct-costs-table">
        <h3>Direct Costs (Year 1)</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              {Array.from({ length: periodsCount }, (_, i) => (
                <th key={i}>P{i + 1}</th>
              ))}
              <th>Total</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.slice(0, visibleCategories).map((category) => {
              const categoryCosts = calculateCategoryCosts(category);
              const total = categoryCosts.reduce((acc, val) => acc + val, 0);
              const average = total / periodsCount;
              return (
                <tr key={category.name}>
                  <td>{category.name}</td>
                  {categoryCosts.map((value, index) => (
                    <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
                  ))}
                  <td>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
                  <td>{average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
                </tr>
              );
            })}
            {allCategories.length > visibleCategories && (
              <tr key="more" onClick={handleLoadMore} style={{ cursor: 'pointer' }}>
                <td colSpan={periodsCount + 3} style={{ textAlign: 'center' }}>Load more...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DirectCostsTable; 