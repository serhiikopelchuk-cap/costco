import React, { useEffect, useState } from 'react';
import './DetailsComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faSpinner, faCheck, faTable, faCog, faMoneyBillTrendUp } from '@fortawesome/free-solid-svg-icons';
import { cloneProgram, deleteProgram } from '../services/programService';
import { cloneProject, deleteProject } from '../services/projectService';
import { Category, Project } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateProgram, updateProject } from '../store/slices/programsSlice';
import DeleteButton from './buttons/DeleteButton';
import { 
  fetchCostTypeByAliasAsync, 
  fetchProgramAsync, 
  updateProgramNameAsync, 
  updateProjectNameAsync,
  deleteProjectAction,
  deleteProgramAction,
  fetchProgramsAsync,
  fetchProjectAsync
} from '../store/slices/costTypesSlice';
import { setProgramId, setProjectId, updateSelections } from '../store/slices/selectionSlice';
import { SummaryTab, SettingsTab } from './details-component';
import { setDetails } from '../store/slices/uiSlice';


const DetailsComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const details = useAppSelector(state => state.ui.details);
  const currentPage = useAppSelector(state => state.ui.currentPage);
  const { selectedProjectId } = useAppSelector(state => state.selection);
  const programs = useAppSelector(state => state.costTypes.item?.programs || []);
  
  const itemData = useAppSelector(state => {
    if (!details?.id) return [];
    if (details.type === 'program') {
      const program = programs.find(p => p.id === details.id);
      return program ? program.projects : [];
    } else if (details.type === 'project' && details.parentProgramId) {
      const program = programs.find(p => p.id === details.parentProgramId);
      const project = program?.projects.find(p => p.id === details.id);
      return project ? project.categories : [];
    }
    return [];
  });
  
  const [sums, setSums] = useState<Record<number, { periodSums: number[], totalSum: number, averageSum: number }>>({});
  const [overallSums, setOverallSums] = useState<number[]>(Array(13).fill(0));
  const [overallTotalSum, setOverallTotalSum] = useState<number>(0);
  const [overallAverageSum, setOverallAverageSum] = useState<number>(0);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'settings'>('summary');
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!details) return;
    if (!details.id || !details.type) return;
    
    const { type, id, parentProgramId } = details;
    if (type === 'program' && typeof id === 'number') {
      dispatch(fetchProgramAsync(id));
    } else if (type === 'project' && typeof id === 'number' && typeof parentProgramId === 'number') {
      dispatch(fetchProjectAsync({ projectId: id, programId: parentProgramId }));
    }
  }, [details, dispatch]);

  useEffect(() => {
    if (!details?.name) return;
    setEditingName(details.name);
  }, [details?.name]);

  useEffect(() => {
    if (!details) return;
    calculateAndSetSums();
  }, [itemData, details?.type]);

  useEffect(() => {
    if (!details) return;
    if (details.type === 'program') {
      setActiveTab(details.activeTab || 'summary');
    } else {
      setActiveTab('summary');
    }
  }, [details]);

  if (!details?.id || !details.type) return null;
  const { type, id, name, isPinned, parentProgramId } = details;

  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  const calculateAndSetSums = () => {
    const sums: Record<number, { periodSums: number[], totalSum: number, averageSum: number }> = {};
    const overallSums = Array(numberOfPeriods).fill(0);
    let overallTotalSum = 0;

    itemData.forEach(item => {
      const periodSums = Array(numberOfPeriods).fill(0);
      let totalSum = 0;

      const items = type === 'program' 
        ? (item as Project).categories.flatMap(category => category.items) 
        : (item as Category).items;

      items.forEach(item => {
        item.costs.forEach(({ value }, index) => {
          const numericValue = Number(value);
          if (!isNaN(numericValue)) {
            periodSums[index] += numericValue;
            overallSums[index] += numericValue;
          }
        });
      });

      totalSum = periodSums.reduce((sum, value) => sum + value, 0);
      
      const averageSum = totalSum / numberOfPeriods;

      const itemId = type === 'program' ? (item as Project).id : (item as Category).id;
      sums[itemId] = { periodSums, totalSum, averageSum };
      overallTotalSum += totalSum;
    });

    const overallAverageSum = overallTotalSum / numberOfPeriods;

    setSums(sums);
    setOverallSums(overallSums);
    setOverallTotalSum(overallTotalSum);
    setOverallAverageSum(overallAverageSum);
  };

  const handleClone = async () => {
    if (!id) return;
    setIsCloning(true);
    setCloneSuccess(false);
    
    try {
      if (type === 'program') {
        const clonedProgram = await cloneProgram(id);
        dispatch(updateProgram(clonedProgram));
        dispatch(fetchCostTypeByAliasAsync(currentPage || 'direct_costs'));
      } else if (parentProgramId) {
        const clonedProject = await cloneProject(id, parentProgramId);
        dispatch(updateProject({ programId: parentProgramId, project: clonedProject }));
        await dispatch(fetchProgramAsync(parentProgramId)).unwrap();
      }

      setCloneSuccess(true);
      setTimeout(() => setCloneSuccess(false), 3000);
    } catch (error) {
      console.error(`Error cloning ${type}:`, error);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async () => {
    if (typeof id !== 'number') return;

    try {
      if (type === 'program') {
        dispatch(setDetails(null));
        await deleteProgram(id);
        dispatch(deleteProgramAction(id));
        await dispatch(fetchProgramsAsync()).unwrap();
      } else if (type === 'project' && typeof parentProgramId === 'number') {
        if (selectedProjectId === id) {
          dispatch(updateSelections({
            selectedProjectId: null,
            selectedCategoryId: null,
            selectedLineItems: []
          }));
        }

        dispatch(setDetails(null));
        await deleteProject(id);
        dispatch(deleteProjectAction({ 
          programId: parentProgramId, 
          projectId: id 
        }));

        if (currentPage) {
          await dispatch(fetchCostTypeByAliasAsync(currentPage)).unwrap();
        }
        await dispatch(fetchProgramsAsync()).unwrap();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = async () => {
    if (typeof id !== 'number') return;

    if (type === 'program') {
      await dispatch(updateProgramNameAsync({ 
        programId: id, 
        name: editingName 
      }));
    } else if (type === 'project' && typeof parentProgramId === 'number') {
      await dispatch(updateProjectNameAsync({ 
        projectId: id, 
        programId: parentProgramId, 
        name: editingName 
      }));
    }
  };

  return (
    <div className="container details-container">
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <FontAwesomeIcon icon={faTable} /> Summary
        </button>
        {type === 'program' && (
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FontAwesomeIcon icon={faMoneyBillTrendUp} /> Investment
          </button>
        )}
      </div>
      <div className="header-with-clone">
        <h4>{type === 'program' ? 'Program Details' : 'Project Details'}</h4>
        <div className="clone-status-wrapper">
          <button 
            className={`clone-button details-clone ${isCloning ? 'cloning' : ''} ${cloneSuccess ? 'success' : ''}`}
            onClick={handleClone}
            title={`Clone ${type}`}
            disabled={isCloning}
          >
            <FontAwesomeIcon 
              icon={isCloning ? faSpinner : cloneSuccess ? faCheck : faClone} 
              className={isCloning ? 'fa-spin' : ''}
            />
          </button>
          {cloneSuccess && (
            <span className="clone-success-message">
              {type === 'program' ? 'Program' : 'Project'} cloned successfully!
            </span>
          )}
          <DeleteButton
            onClick={handleDelete}
            title={`Delete ${type}`}
          />
        </div>
      </div>

      {activeTab === 'summary' && type && (
        <SummaryTab 
          type={type}
          editingName={editingName}
          handleNameChange={handleNameChange}
          handleNameBlur={handleNameBlur}
          data={itemData}
          columns={columns}
          sums={sums}
          overallSums={overallSums}
          overallTotalSum={overallTotalSum}
          overallAverageSum={overallAverageSum}
        />
      )}
      {activeTab === 'settings' && type === 'program' && (
        <SettingsTab type={type} />
      )}
    </div>
  );
};

export default DetailsComponent; 