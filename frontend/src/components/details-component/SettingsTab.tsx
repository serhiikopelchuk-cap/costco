import React, { useState, useEffect } from 'react';
import './SettingsTab.css';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { updateProjectSettingsAsync } from '../../store/slices/costTypesSlice';
import { selectSelectedProgramId, selectSelectedProjectId } from '../../store/slices/selectionSlice';
import { selectProjectById } from '../../store/slices/costTypesSlice';

interface SettingsTabProps {
  type: 'program' | 'project';
}

const SettingsTab: React.FC<SettingsTabProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const projectId = useAppSelector(selectSelectedProjectId);
  const programId = useAppSelector(selectSelectedProgramId);
  const project = useAppSelector((state) => selectProjectById(state, projectId!));

  const [teamName, setTeamName] = useState<string>('');
  const [preparedBy, setPreparedBy] = useState<string>('');
  const [directInvestment, setDirectInvestment] = useState<number>(0);
  const [indirectInvestment, setIndirectInvestment] = useState<number>(0);
  const [directGrowthRates, setDirectGrowthRates] = useState<number[]>(Array(5).fill(0));
  const [indirectGrowthRates, setIndirectGrowthRates] = useState<number[]>(Array(5).fill(0));
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (project && project.settings) {
      setTeamName(project.settings.teamName || '');
      setPreparedBy(project.settings.preparedBy || '');
      setDirectInvestment(project.settings.directInvestment || 0);
      setIndirectInvestment(project.settings.indirectInvestment || 0);
      setDirectGrowthRates(project.settings.directGrowthRates || Array(5).fill(0));
      setIndirectGrowthRates(project.settings.indirectGrowthRates || Array(5).fill(0));
    }
  }, [project]);

  const handleSave = async () => {
    if (projectId === null || programId === null) {
      setStatusMessage('Please select a project and program.');
      return;
    }

    const settings = {
      teamName,
      preparedBy,
      directInvestment,
      indirectInvestment,
      directGrowthRates,
      indirectGrowthRates,
    };

    try {
      await dispatch(updateProjectSettingsAsync({ projectId, programId, settings })).unwrap();
      setStatusMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatusMessage('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="settings-container">
      <h4>{type === 'program' ? 'Program Settings' : 'Project Settings'}</h4>
      
      {/* Team Information Section */}
      <h5>Complete your {'>>'} Team Information</h5>
      <div className="input-group">
        <label>
          Team Name & Dept #:
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter Team Name & Dept #"
          />
        </label>
        <span className="instruction">Enter your Project & Department to the bolded cell at left e.g. "Sample Project D635"</span>
      </div>
      <div className="input-group">
        <label>
          Prepared by:
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            placeholder="Enter your name"
          />
        </label>
        <span className="instruction">Enter your own full Name to the bolded cell at left</span>
      </div>

      {type === 'project' && (
        <>
          <h5>Complete your {'>>'} Starting Cost and Initial Investment</h5>
          <div className="input-group">
            <label>
              Direct Initial Investment $:
              <input
                type="number"
                value={directInvestment}
                onChange={(e) => setDirectInvestment(Number(e.target.value))}
                placeholder="$0"
              />
            </label>
            <span className="instruction">Enter Costs (If any) incurred before the start of Year 1, Period 1.</span>
          </div>
          <div className="input-group">
            <label>
              Indirect Initial Investment $:
              <input
                type="number"
                value={indirectInvestment}
                onChange={(e) => setIndirectInvestment(Number(e.target.value))}
                placeholder="$0"
              />
            </label>
            <span className="instruction">e.g. if you incurred prior costs related to cloud infrastructure (Direct), software licenses (Indirect), talent (Indirect), etc.</span>
          </div>
          <h5>Complete your {'>>'} Cost Growth Rate</h5>
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
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => {
                        const newRates = [...directGrowthRates];
                        newRates[index] = Number(e.target.value);
                        setDirectGrowthRates(newRates);
                      }}
                      placeholder="e.g. 3%"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Indirect Costs Growth Rate %</td>
                {indirectGrowthRates.map((rate, index) => (
                  <td key={index}>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => {
                        const newRates = [...indirectGrowthRates];
                        newRates[index] = Number(e.target.value);
                        setIndirectGrowthRates(newRates);
                      }}
                      placeholder="e.g. 3%"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <span className="instruction">Enter your Average Annual Growth over 5 years. e.g. If you will use 10% more compute in year 2 enter 10%</span>
        </>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleSave} className="save-button">Save Settings</button>
        {statusMessage && (
          <span style={{ color: statusMessage.includes('successfully') ? 'green' : 'red', marginLeft: '10px' }}>
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default SettingsTab; 