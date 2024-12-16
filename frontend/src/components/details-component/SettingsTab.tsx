import React, { useState, useEffect } from 'react';
import './SettingsTab.css';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { updateProjectSettingsAsync, updateProgramSettingsAsync } from '../../store/slices/costTypesSlice';
import { selectSelectedProgramId, selectSelectedProjectId } from '../../store/slices/selectionSlice';
import { selectProjectById } from '../../store/slices/costTypesSlice';
import CurrencyInput from '../common/CurrencyInput';
import PercentageInput from '../common/PercentageInput';

interface SettingsTabProps {
  type: 'program' | 'project';
}

const SettingsTab: React.FC<SettingsTabProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectSelectedProjectId);
  const programId = useAppSelector(selectSelectedProgramId);
  const project = useAppSelector((state) => selectProjectById(state, projectId!));
  const program = useAppSelector((state) => 
    state.costTypes.item?.programs.find(p => p.id === programId)
  );

  const [teamName, setTeamName] = useState<string>('');
  const [preparedBy, setPreparedBy] = useState<string>('');
  const [directInvestment, setDirectInvestment] = useState<number>(0);
  const [indirectInvestment, setIndirectInvestment] = useState<number>(0);
  const [directGrowthRates, setDirectGrowthRates] = useState<number[]>(Array(5).fill(0));
  const [indirectGrowthRates, setIndirectGrowthRates] = useState<number[]>(Array(5).fill(0));
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const settings = type === 'program' ? program?.settings : project?.settings;
    if (settings) {
      setTeamName(settings.teamName || '');
      setPreparedBy(settings.preparedBy || '');
      setDirectInvestment(settings.directInvestment || 0);
      setIndirectInvestment(settings.indirectInvestment || 0);
      setDirectGrowthRates(settings.directGrowthRates || Array(5).fill(0));
      setIndirectGrowthRates(settings.indirectGrowthRates || Array(5).fill(0));
    }
  }, [type, program, project]);

  const handleSave = async () => {
    const settings = {
      teamName,
      preparedBy,
      directInvestment,
      indirectInvestment,
      directGrowthRates,
      indirectGrowthRates,
    };

    try {
      if (type === 'program' && programId) {
        await dispatch(updateProgramSettingsAsync({ programId, settings })).unwrap();
      } else if (type === 'project' && projectId && programId) {
        await dispatch(updateProjectSettingsAsync({ projectId, programId, settings })).unwrap();
      }
      setStatusMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatusMessage('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Program Starting Cost and Initial Investment</h2>

      <section className="settings-section">
        <h3 className="section-title">Team Information</h3>
        
        <div className="input-group">
          <label>Team Name & Dept #</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Sample Project D635"
          />
        </div>

        <div className="input-group">
          <label>Prepared by</label>
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
      </section>

      <section className="settings-section">
        <h3 className="section-title">Starting Cost and Initial Investment</h3>
        
        <div className="input-group">
          <label>Direct Initial Investment</label>
          <CurrencyInput
            value={directInvestment}
            onChange={(value) => setDirectInvestment(Number(value.replace(/\$/g, '')) || 0)}
            onBlur={(value) => setDirectInvestment(Number(value.replace(/\$/g, '')) || 0)}
            placeholder="Enter costs incurred before Year 1, Period 1"
          />
        </div>

        <div className="input-group">
          <label>Indirect Initial Investment</label>
          <CurrencyInput
            value={indirectInvestment}
            onChange={(value) => setIndirectInvestment(Number(value.replace(/\$/g, '')) || 0)}
            onBlur={(value) => setIndirectInvestment(Number(value.replace(/\$/g, '')) || 0)}
            placeholder="e.g. cloud infrastructure, software licenses, talent"
          />
        </div>
      </section>

      <section className="settings-section">
        <h3 className="section-title">Cost Growth Rate</h3>
        
        <div className="growth-rate-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Year 1</th>
                <th>Year 2</th>
                <th>Year 3</th>
                <th>Year 4</th>
                <th>Year 5</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Direct Costs Growth Rate %</td>
                {directGrowthRates.map((rate, index) => (
                  <td key={index}>
                    <PercentageInput
                      value={rate}
                      onChange={(value) => {
                        const newRates = [...directGrowthRates];
                        newRates[index] = Number(value.replace(/%/g, '')) || 0;
                        setDirectGrowthRates(newRates);
                      }}
                      className="growth-rate-input"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Indirect Costs Growth Rate %</td>
                {indirectGrowthRates.map((rate, index) => (
                  <td key={index}>
                    <PercentageInput
                      value={rate}
                      onChange={(value) => {
                        const newRates = [...indirectGrowthRates];
                        newRates[index] = Number(value.replace(/%/g, '')) || 0;
                        setIndirectGrowthRates(newRates);
                      }}
                      className="growth-rate-input"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="table-hint">
            Enter your Average Annual Growth over 5 years. e.g. If you will use 10% more compute in year 2 enter 10%
          </p>
        </div>
      </section>

      <div className="settings-footer">
        <button onClick={handleSave} className="save-button">
          Save Settings
        </button>
        {statusMessage && (
          <span className={`status-message ${statusMessage.includes('successfully') ? 'success' : 'error'}`}>
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsTab; 