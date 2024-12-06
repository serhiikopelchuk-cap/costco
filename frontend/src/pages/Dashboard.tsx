import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import './Dashboard.css';
import ForecastTable from '../components/dashboard/ForecastTable';
import TotalCostsTable from '../components/dashboard/TotalCostsTable';
import DirectCostsTable from '../components/dashboard/DirectCostsTable';
import IndirectCostsTable from '../components/dashboard/IndirectCostsTable';
import TopCharts from '../components/dashboard/TopCharts';
import BottomCharts from '../components/dashboard/BottomCharts';
import { fetchCostTypeByAlias } from '../services/costTypeService';
import { CostType } from '../types/program';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Dashboard() {
  const [directCostsData, setDirectCostsData] = useState<CostType | null>(null);
  const [indirectCostsData, setIndirectCostsData] = useState<CostType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const directCosts = await fetchCostTypeByAlias('direct_costs');
        const indirectCosts = await fetchCostTypeByAlias('indirect_costs');
        setDirectCostsData(directCosts);
        setIndirectCostsData(indirectCosts);
      } catch (error) {
        console.error('Error fetching cost types:', error);
      }
    };

    fetchData();
  }, []);

  // Ensure data is available before rendering components
  if (!directCostsData || !indirectCostsData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="top-section">
        <div className="forecast-table">
          <ForecastTable directCostsData={directCostsData} indirectCostsData={indirectCostsData} />
        </div>
        <div className="top-charts-section">
          <TopCharts directCostsData={directCostsData} indirectCostsData={indirectCostsData} />
        </div>
      </div>
      <div className="tables">
        <div className="dashboard-section">
          <TotalCostsTable directCostsData={directCostsData} indirectCostsData={indirectCostsData} />
        </div>
        <div className="dashboard-section">
          <DirectCostsTable directCostsData={directCostsData} />
        </div>
        <div className="dashboard-section">
          <BottomCharts indirectCostsData={indirectCostsData} />
        </div>
        <div className="dashboard-section">
          <IndirectCostsTable indirectCostsData={indirectCostsData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;