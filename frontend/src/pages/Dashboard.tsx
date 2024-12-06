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
import ProviderFilter from '../components/common/ProviderFilter';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Dashboard() {
  const [directCostsData, setDirectCostsData] = useState<CostType | null>(null);
  const [indirectCostsData, setIndirectCostsData] = useState<CostType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const cloudProviders = ['azure', 'gcp'];

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

  const filterCategoriesByProvider = (costsData: CostType | null) => {
    if (!costsData) return null;
    if (!selectedProvider) return costsData;

    return {
      ...costsData,
      programs: costsData.programs.map(program => ({
        ...program,
        projects: program.projects.map(project => ({
          ...project,
          categories: project.categories.filter(category =>
            category.cloudProvider?.includes(selectedProvider)
          ),
        })),
      })),
    };
  };

  const filteredDirectCostsData = filterCategoriesByProvider(directCostsData);
  const filteredIndirectCostsData = filterCategoriesByProvider(indirectCostsData);

  if (!filteredDirectCostsData || !filteredIndirectCostsData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <ProviderFilter
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          cloudProviders={cloudProviders}
        />
      </div>
      <div className="top-section">
        <div className="forecast-table">
          <ForecastTable directCostsData={filteredDirectCostsData} indirectCostsData={filteredIndirectCostsData} />
        </div>
        <div className="top-charts-section">
          <TopCharts directCostsData={filteredDirectCostsData} indirectCostsData={filteredIndirectCostsData} />
        </div>
      </div>
      <div className="tables">
        <div className="dashboard-section">
          <TotalCostsTable directCostsData={filteredDirectCostsData} indirectCostsData={filteredIndirectCostsData} />
        </div>
        <div className="dashboard-section">
          <DirectCostsTable directCostsData={filteredDirectCostsData} />
        </div>
        <div className="dashboard-section">
          <BottomCharts indirectCostsData={filteredIndirectCostsData} />
        </div>
        <div className="dashboard-section">
          <IndirectCostsTable indirectCostsData={filteredIndirectCostsData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;