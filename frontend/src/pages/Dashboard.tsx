import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import './Dashboard.css';
import ForecastTable from '../components/dashboard/ForecastTable';
import TotalCostsTable from '../components/dashboard/TotalCostsTable';
import DirectCostsTable from '../components/dashboard/DirectCostsTable';
import IndirectCostsTable from '../components/dashboard/IndirectCostsTable';
import TopCharts from '../components/dashboard/TopCharts';
import BottomCharts from '../components/dashboard/BottomCharts';
import { fetchProgramsAsync } from '../store/slices/costTypesSlice';
import { fetchCloudProvidersAsync } from '../store/slices/cloudProvidersSlice';
import { Program } from '../types/program';
import ProviderFilter from '../components/common/ProviderFilter';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { AppDispatch } from '../store';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');

  // Use programs directly from user object
  const programs = user?.programs || [];

  useEffect(() => {
    dispatch(fetchCloudProvidersAsync());
  }, [dispatch]);

  const filterProgramsByProvider = (programs: Program[], costTypeId: number) => {
    let filteredPrograms = programs
      .filter(program => !selectedProgramId || program.id === selectedProgramId)
      .map(program => ({
        ...program,
        settings: program.settings || {
          directInvestment: 0,
          indirectInvestment: 0,
          directGrowthRates: Array(5).fill(0),
          indirectGrowthRates: Array(5).fill(0)
        },
        projects: (program.projects || []).map(project => ({
          ...project,
          categories: (project.categories || []).filter(category => 
            category.costType?.id === costTypeId &&
            (!selectedProvider || category.cloudProviders?.some(cp => 
              cp.name.toLowerCase() === selectedProvider.toLowerCase()
            ))
          )
        })).filter(project => project.categories.length > 0)
      })).filter(program => program.projects.length > 0);

    return {
      id: costTypeId,
      name: costTypeId === 1 ? 'direct_costs' : 'indirect_costs',
      alias: costTypeId === 1 ? 'direct_costs' : 'indirect_costs',
      programs: filteredPrograms
    };
  };

  const directCostsData = filterProgramsByProvider(programs, 1);
  const indirectCostsData = filterProgramsByProvider(programs, 2);

  const getProgramSettings = (programId: number | '') => {
    if (!programId) {
      // If no program selected, combine all user's programs' settings
      return programs.reduce((acc, program) => ({
        directInvestment: (acc.directInvestment || 0) + (program.settings?.directInvestment || 0),
        indirectInvestment: (acc.indirectInvestment || 0) + (program.settings?.indirectInvestment || 0),
        directGrowthRates: program.settings?.directGrowthRates || Array(5).fill(0),
        indirectGrowthRates: program.settings?.indirectGrowthRates || Array(5).fill(0)
      }), {
        directInvestment: 0,
        indirectInvestment: 0,
        directGrowthRates: Array(5).fill(0),
        indirectGrowthRates: Array(5).fill(0)
      });
    }

    const program = programs.find(p => p.id === programId);
    return program?.settings || {
      directInvestment: 0,
      indirectInvestment: 0,
      directGrowthRates: Array(5).fill(0),
      indirectGrowthRates: Array(5).fill(0)
    };
  };

  const programSettings = getProgramSettings(selectedProgramId);

  if (!programs.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-filters">
          <ProviderFilter
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
          <select 
            value={selectedProgramId} 
            onChange={(e) => setSelectedProgramId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="top-section">
        <div className="forecast-table">
          <ForecastTable 
            settings={programSettings}
            directCostsData={directCostsData} 
            indirectCostsData={indirectCostsData} 
          />
        </div>
        <div className="top-charts-section">
          <TopCharts 
            settings={programSettings}
            directCostsData={directCostsData} 
            indirectCostsData={indirectCostsData} 
          />
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