import React, { useEffect, useState } from 'react';
import './DetailsComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faSpinner, faCheck, faTable, faCog } from '@fortawesome/free-solid-svg-icons';
import { cloneProgram, deleteProgram } from '../services/programService';
import { cloneProject, deleteProject } from '../services/projectService';
import { Category, Project } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateProgram, updateProject, deleteProgram as deleteProgramAction, deleteProject as deleteProjectAction } from '../store/slices/programsSlice';
import DeleteButton from './buttons/DeleteButton';
import { fetchCostTypeByAliasAsync, fetchProgramAsync, updateProgramNameAsync, updateProjectNameAsync } from '../store/slices/costTypesSlice';
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import { setProgramId, setProjectId } from '../store/slices/selectionSlice';
import { SummaryTab, SettingsTab } from './details-component';

interface DetailsComponentProps {
  type: 'program' | 'project';
  id: number;
  programId?: number;
}

const DetailsComponent: React.FC<DetailsComponentProps> = ({ type, id, programId }) => {
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  const [sums, setSums] = useState<Record<number, { periodSums: number[], totalSum: number, averageSum: number }>>({});
  const [overallSums, setOverallSums] = useState<number[]>(Array(numberOfPeriods).fill(0));
  const [overallTotalSum, setOverallTotalSum] = useState<number>(0);
  const [overallAverageSum, setOverallAverageSum] = useState<number>(0);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'settings'>('summary');

  const dispatch = useAppDispatch();
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);

  // Get programs and projects from Redux state
  const programs = useAppSelector(state => state.costTypes.item?.programs || []);

  useEffect(() => {
    if (!programId && programs.length > 0) {
      // Select the first available program if none is selected
      const firstProgram = programs[0];
      dispatch(setProgramId(firstProgram.id));

      if (type === 'project' && firstProgram.projects.length > 0) {
        // Select the first available project if none is selected
        const firstProject = firstProgram.projects[0];
        dispatch(setProjectId(firstProject.id));
      }
    }
  }, [programId, programs, dispatch, type]);

  // Get program/project name from Redux state
  const name = useAppSelector(state => {
    if (type === 'program') {
      const program = state.costTypes.item?.programs.find(p => p.id === id);
      return program ? program.name : '';
    } else {
      const program = state.costTypes.item?.programs.find(p => p.id === programId);
      const project = program?.projects.find(p => p.id === id);
      return project ? project.name : '';
    }
  });

  // Get projects or categories from Redux state
  const data = useAppSelector(state => {
    if (type === 'program') {
      const program = state.costTypes.item?.programs.find(p => p.id === id);
      return program ? program.projects : [];
    } else {
      const program = state.costTypes.item?.programs.find(p => p.id === programId);
      const project = program?.projects.find(p => p.id === id);
      return project ? project.categories : [];
    }
  });

  const [editingName, setEditingName] = useState<string>(name);

  useEffect(() => {
    setEditingName(name);
  }, [name]);

  useEffect(() => {
    if (type === 'program' && data.length === 0) {
      // No projects in the program
      setSums({});
      setOverallSums(Array(numberOfPeriods).fill(0));
      setOverallTotalSum(0);
      setOverallAverageSum(0);
      return;
    }

    if (type === 'project' && (data as Category[]).every((category) => category.items.length === 0)) {
      // No categories in the project
      setSums({});
      setOverallSums(Array(numberOfPeriods).fill(0));
      setOverallTotalSum(0);
      setOverallAverageSum(0);
      return;
    }

    const calculateSums = (data: (Project | Category)[]) => {
      const sums: Record<number, { periodSums: number[], totalSum: number, averageSum: number }> = {};
      const overallSums = Array(numberOfPeriods).fill(0);
      let overallTotalSum = 0;

      data.forEach(item => {
        const periodSums = Array(numberOfPeriods).fill(0);
        let totalSum = 0;

        const items = type === 'program' ? (item as Project).categories.flatMap(category => category.items) : (item as Category).items;

        items.forEach(item => {
          item.costs.forEach(({ value }, index) => {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
              periodSums[index] += numericValue;
              overallSums[index] += numericValue;
            }
          });
          totalSum += item.costs.reduce((sum, { value }) => {
            const numericValue = Number(value);
            return !isNaN(numericValue) ? sum + numericValue : sum;
          }, 0);
        });

        const averageSum = items.length > 0 ? totalSum / (items.length * numberOfPeriods) : 0;
        const itemId = type === 'program' ? (item as Project).id : (item as Category).id;
        sums[itemId] = { periodSums, totalSum, averageSum };
        overallTotalSum += totalSum;
      });

      const overallAverageSum = overallTotalSum / (data.flatMap(item => type === 'program' ? (item as Project).categories.flatMap(category => category.items) : (item as Category).items).length * numberOfPeriods);

      return { sums, overallSums, overallTotalSum, overallAverageSum };
    };

    const { sums, overallSums, overallTotalSum, overallAverageSum } = calculateSums(data);
    setSums(sums);
    setOverallSums(overallSums);
    setOverallTotalSum(overallTotalSum);
    setOverallAverageSum(overallAverageSum);
  }, [data, type]);

  const handleClone = async () => {
    setIsCloning(true);
    setCloneSuccess(false);
    try {
      if (type === 'program') {
        const clonedProgram = await cloneProgram(id);
        console.log('Program cloned successfully:', clonedProgram);
        dispatch(updateProgram(clonedProgram));

        dispatch(fetchCostTypeByAliasAsync(currentPage === 'direct_costs' ? 'direct_costs' : 'indirect_costs'));
      } else {
        if (programId === undefined) {
          console.error('Program ID is required to clone a project');
          return;
        }
        const clonedProject = await cloneProject(id, programId);
        console.log('Project cloned successfully:', clonedProject);
        dispatch(updateProject({ programId, project: clonedProject }));

        await dispatch(fetchProgramAsync(programId)).unwrap();
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
    try {
      if (type === 'program') {
        await deleteProgram(id);
        console.log('Program deleted successfully');
        dispatch(deleteProgramAction(id));

        dispatch(fetchCostTypeByAliasAsync(currentPage === 'direct_costs' ? 'direct_costs' : 'indirect_costs'));
      } else {
        await deleteProject(id);
        console.log('Project deleted successfully');
        if (programId !== undefined) {
          dispatch(deleteProjectAction({ programId, projectId: id }));

          await dispatch(fetchProgramAsync(programId)).unwrap();
        }
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = async () => {
    if (type === 'program') {
      try {
        // Update program name in backend
        await dispatch(updateProgramNameAsync({ programId: id, name: editingName })).unwrap();
      } catch (error) {
        console.error('Failed to update program name:', error);
      }
    } else if (type === 'project' && programId !== undefined) {
      try {
        // Update project name in backend
        await dispatch(updateProjectNameAsync({ projectId: id, programId, name: editingName })).unwrap();
      } catch (error) {
        console.error('Failed to update project name:', error);
      }
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
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FontAwesomeIcon icon={faCog} /> Settings
        </button>
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
      {activeTab === 'summary' ? (
        <SummaryTab
          type={type}
          editingName={editingName}
          handleNameChange={handleNameChange}
          handleNameBlur={handleNameBlur}
          data={data}
          columns={columns}
          overallSums={overallSums}
          overallTotalSum={overallTotalSum}
          overallAverageSum={overallAverageSum}
          sums={sums}
        />
      ) : (
        <SettingsTab type={type} />
      )}
    </div>
  );
};

export default DetailsComponent; 