import React from 'react';
import { Bar } from 'react-chartjs-2';
import './BottomCharts.css';

const BottomCharts: React.FC<{ directCostsData: any; indirectCostsData: any }> = ({ directCostsData, indirectCostsData }) => {
  // Update directCostsData with red colors
  const updatedDirectCostsData = {
    ...directCostsData,
    datasets: directCostsData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: 'rgba(220, 53, 69, 0.2)', // Light red fill color
      borderColor: '#dc3545', // Red border color
      borderWidth: 1, // Ensure border is visible
    })),
  };

  // Update indirectCostsData with light blue colors
  const updatedIndirectCostsData = {
    ...indirectCostsData,
    datasets: indirectCostsData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: '#cce5ff', // Light blue bar color
      borderColor: '#007bff', // Blue border color
      borderWidth: 1, // Ensure border is visible
    })),
  };

  return (
    <div className="bottom-charts">
      <div className="chart">
        <h3>Average $ Spend Direct Costs (Year 1)</h3>
        <Bar data={updatedDirectCostsData} />
      </div>
      <div className="chart">
        <h3>Average $ Spend Indirect Costs (Year 1)</h3>
        <Bar data={updatedIndirectCostsData} />
      </div>
    </div>
  );
};

export default BottomCharts; 