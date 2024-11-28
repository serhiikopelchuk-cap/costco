import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import './Dashboard.css';
import ForecastTable from '../components/dashboard/ForecastTable';
import TotalCostsTable from '../components/dashboard/TotalCostsTable';
import DirectCostsTable from '../components/dashboard/DirectCostsTable';
import IndirectCostsTable from '../components/dashboard/IndirectCostsTable';
import TopCharts from '../components/dashboard/TopCharts';
import BottomCharts from '../components/dashboard/BottomCharts';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Dashboard() {
  const lineData = {
    labels: ['Initial Investment', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Cumulative Costs',
        data: [40, 0, 0, 0, 0, 0], // Update with actual data
        borderColor: 'gray',
        fill: false,
      },
    ],
  };

  const barData = {
    labels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13'],
    datasets: [
      {
        label: 'Total Costs (Year 1)',
        data: [0, 200, 200, 225, 225, 225, 225, 225, 265, 265, 265, 290], // Update with actual data
        backgroundColor: 'gray',
      },
    ],
  };

  const directCostsData = {
    labels: ['Compute Costs', 'Storage Costs', 'Network Costs', 'Database Costs', 'Analytics Costs', 'Integration Costs', 'Security Costs', 'Monitoring and...', 'Application...', 'Third-Party Service...', 'Other 1', 'Other 2', 'Other 3', 'Other 4'],
    datasets: [
      {
        label: 'Average $ Spend Direct Costs (Year 1)',
        data: [16, 18, 66, 10, 10, 0, 10, 10, 10, 0, 0, 0, 0, 0],
        backgroundColor: 'red',
      },
    ],
  };

  const indirectCostsData = {
    labels: ['Talent Costs', 'Professional Services Costs', 'Licensing Costs', 'Operational Costs', 'Data Transfer Costs', 'Compliance Costs', 'Risk Management Costs', 'Incident Costs', 'Backup and Recovery Costs', 'Downtime Costs', 'Other 5', 'Other 6', 'Other 7', 'Other 8'],
    datasets: [
      {
        label: 'Average $ Spend Indirect Costs (Year 1)',
        data: [40, 0, 18, 0, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'blue',
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="top-section">
        <div className="forecast-table">
          <ForecastTable />
        </div>
        <div className="top-charts">
          <TopCharts lineData={lineData} barData={barData} />
        </div>
      </div>
      <div className="tables">
        <TotalCostsTable />
        <DirectCostsTable directCostsData={directCostsData} />
        <IndirectCostsTable />
      </div>
      <BottomCharts directCostsData={directCostsData} indirectCostsData={indirectCostsData} />
    </div>
  );
}

export default Dashboard;