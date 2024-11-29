import React, { useEffect, useState } from 'react';
import './DetailsComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { cloneProgram, deleteProgram } from '../services/programService';
import { cloneProject, deleteProject } from '../services/projectService';
import { Item } from '../types/program';
import { useAppDispatch } from '../hooks/reduxHooks';
import { updateProgram, updateProject, deleteProgram as deleteProgramAction, deleteProject as deleteProjectAction } from '../store/slices/programsSlice';
import DeleteButton from './buttons/DeleteButton';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

interface DetailsComponentProps {
  type: 'program' | 'project';
  name: string;
  id: number;
  programId?: number;
  categories: Record<string, Item[]>;
}

const DetailsComponent: React.FC<DetailsComponentProps> = ({ type, name, id, programId, categories }) => {
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfPeriods = 13;

  const [sums, setSums] = useState<Record<string, { periodSums: number[], totalSum: number, averageSum: number }>>({});
  const [overallSums, setOverallSums] = useState<number[]>(Array(numberOfPeriods).fill(0));
  const [overallTotalSum, setOverallTotalSum] = useState<number>(0);
  const [overallAverageSum, setOverallAverageSum] = useState<number>(0);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);

  useEffect(() => {
    const calculateSums = (items: Record<string, Item[]>) => {
      const sums: Record<string, { periodSums: number[], totalSum: number, averageSum: number }> = {};
      const overallSums = Array(numberOfPeriods).fill(0);
      let overallTotalSum = 0;

      Object.entries(items).forEach(([itemName, lineItems]) => {
        const periodSums = Array(numberOfPeriods).fill(0);
        let totalSum = 0;

        lineItems.forEach(item => {
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

        const averageSum = lineItems.length > 0 ? totalSum / (lineItems.length * numberOfPeriods) : 0;
        sums[itemName] = { periodSums, totalSum, averageSum };
        overallTotalSum += totalSum;
      });

      const overallAverageSum = overallTotalSum / (Object.values(items).flat().length * numberOfPeriods);

      return { sums, overallSums, overallTotalSum, overallAverageSum };
    };

    const { sums, overallSums, overallTotalSum, overallAverageSum } = calculateSums(categories);
    setSums(sums);
    setOverallSums(overallSums);
    setOverallTotalSum(overallTotalSum);
    setOverallAverageSum(overallAverageSum);
  }, [categories]);

  const handleClone = async () => {
    setIsCloning(true);
    setCloneSuccess(false);
    try {
      if (type === 'program') {
        const clonedProgram = await cloneProgram(id);
        console.log('Program cloned successfully:', clonedProgram);
        dispatch(updateProgram(clonedProgram));
      } else {
        if (programId === undefined) {
          console.error('Program ID is required to clone a project');
          return;
        }
        const clonedProject = await cloneProject(id, programId);
        console.log('Project cloned successfully:', clonedProject);
        dispatch(updateProject({ programId, project: clonedProject }));
      }

      setCloneSuccess(true);
      setTimeout(() => setCloneSuccess(false), 3000);
      dispatch(fetchCostTypeByAliasAsync(currentPage === 'direct_costs' ? 'direct_costs' : 'indirect_costs'));
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
      } else {
        await deleteProject(id);
        console.log('Project deleted successfully');
        if (programId !== undefined) {
          dispatch(deleteProjectAction({ programId, projectId: id }));
        }
      }
      dispatch(fetchCostTypeByAliasAsync(currentPage === 'direct_costs' ? 'direct_costs' : 'indirect_costs'));
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="container details-container">
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
      <p>Details for {type === 'program' ? 'Program' : 'Project'}: {name}</p>
      <table>
        <thead>
          <tr>
            <th>{type === 'program' ? 'Project' : 'Category'}</th>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Overall</strong></td>
            {overallSums.map((sum, index) => (
              <td key={index}><strong>{Number(sum).toFixed(0)}$</strong></td>
            ))}
            <td><strong>{Number(overallTotalSum).toFixed(2)}$</strong></td>
            <td><strong>{Number(overallAverageSum).toFixed(2)}$</strong></td>
          </tr>
          {Object.entries(sums).map(([itemName, { periodSums, totalSum, averageSum }]) => (
            <tr key={itemName}>
              <td>{itemName}</td>
              {periodSums.map((sum, index) => (
                <td key={index}>{Number(sum).toFixed(0)}$</td>
              ))}
              <td>{Number(totalSum).toFixed(2)}$</td>
              <td>{Number(averageSum).toFixed(2)}$</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailsComponent; 