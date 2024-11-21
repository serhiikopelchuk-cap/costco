import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import './TopCharts.css';

const TopCharts: React.FC<{ lineData: any; barData: any }> = ({ lineData, barData }) => {
  // Update lineData with red colors
  const updatedLineData = {
    ...lineData,
    datasets: lineData.datasets.map((dataset: any) => ({
      ...dataset,
      borderColor: '#dc3545', // Red line color
      backgroundColor: 'rgba(220, 53, 69, 0.2)', // Light red fill color
      pointBackgroundColor: '#dc3545', // Red point color
      pointBorderColor: '#dc3545', // Red point border color
    })),
  };

  // Update barData with light blue colors
  const updatedBarData = {
    ...barData,
    datasets: barData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: '#cce5ff', // Light blue bar color
      borderColor: '#007bff', // Blue border color
      borderWidth: 1, // Ensure border is visible
    })),
  };

  return (
    <div className="charts">
      <div className="chart">
        <h3>Annual and Cumulative Costs</h3>
        <Line data={updatedLineData} />
      </div>
      <div className="chart">
        <h3>Total Costs (Year 1)</h3>
        <Bar data={updatedBarData} />
      </div>
    </div>
  );
};

export default TopCharts; 