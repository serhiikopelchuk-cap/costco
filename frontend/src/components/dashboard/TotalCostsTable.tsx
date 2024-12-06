import React from 'react';
import { Line } from 'react-chartjs-2';
import { CostType } from '../../types/program'; // Import CostType
import './TotalCostsTable.css';

interface TotalCostsTableProps {
  directCostsData: CostType;
  indirectCostsData: CostType;
}

const TotalCostsTable: React.FC<TotalCostsTableProps> = ({ directCostsData, indirectCostsData }) => {
  const periodsCount = 13; // Number of periods (P1 to P13)

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

  const calculateAverage = (costs: number[]) => costs.reduce((acc, val) => acc + val, 0) / costs.length;

  const lineData = {
    labels: Array.from({ length: periodsCount }, (_, i) => `P${i + 1}`),
    datasets: [
      {
        label: 'Direct Costs',
        data: directTotal,
        borderColor: 'red',
        backgroundColor: 'rgba(220, 53, 69, 0.2)', // Light red fill color
        fill: '+1', // Fill to the next dataset
      },
      {
        label: 'Indirect Costs',
        data: indirectTotal,
        borderColor: '#007bff',
        backgroundColor: 'rgba(173, 216, 230, 0.5)', // Less transparent light blue fill color
        fill: true, // Fill to the next dataset
      },
      {
        label: 'Total Costs',
        data: totalCosts,
        borderColor: 'gray',
        backgroundColor: 'rgba(128, 128, 128, 0.2)', // Light gray fill color
        fill: 'origin', // Fill to the origin
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
    <div className="total-costs-section">
      <div className="chart">
        <h3>Total Costs (Year 1)</h3>
        <Line data={lineData} options={options} />
      </div>
      <div className="total-costs-table">
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
            <tr>
              <td>Direct Costs</td>
              {directTotal.map((value, index) => (
                <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              ))}
              <td>{directTotal.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              <td>{calculateAverage(directTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            </tr>
            <tr>
              <td>Indirect Costs</td>
              {indirectTotal.map((value, index) => (
                <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              ))}
              <td>{indirectTotal.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              <td>{calculateAverage(indirectTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            </tr>
            <tr>
              <td>Total Costs</td>
              {totalCosts.map((value, index) => (
                <td key={index}>{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              ))}
              <td>{totalCosts.reduce((acc, val) => acc + val, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
              <td>{calculateAverage(totalCosts).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TotalCostsTable;