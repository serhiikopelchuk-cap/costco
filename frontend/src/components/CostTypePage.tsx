import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync } from '../store/slices/costTypesSlice';
import { updateSelections, setCostType } from '../store/slices/selectionSlice';
import Outline from './outline/Outline';

interface CostTypePageProps {
  currentPage: 'direct_costs' | 'indirect_costs';
}

const CostTypePage: React.FC<CostTypePageProps> = ({ currentPage }) => {
  const dispatch = useAppDispatch();
  const programs = useAppSelector(state => {
    const costTypeId = currentPage === 'direct_costs' ? 1 : 2;
    return state.costTypes.item?.programs.map(program => ({
      ...program,
      projects: program.projects.map(project => ({
        ...project,
        categories: project.categories.filter(category => 
          !category.costType || 
          !category.cloudProviders?.length ||
          category.costType?.id === costTypeId
        )
      }))
    })) || [];
  });

  // Set initial cost type based on URL/page
  useEffect(() => {
    if (currentPage) {
      dispatch(updateSelections({
        selectedCostType: currentPage
      }));
    }
  }, [dispatch, currentPage]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // First clear selections except costType
        dispatch(updateSelections({
          selectedProgramId: null,
          selectedProjectId: null,
          selectedCategoryId: null,
          selectedLineItems: [],
        }));

        // Then fetch data for the current cost type
        await dispatch(fetchCostTypeByAliasAsync(currentPage)).unwrap();
      } catch (error) {
        console.error('Error loading cost type data:', error);
      }
    };

    loadData();
  }, [dispatch, currentPage]);

  return <Outline data={programs} />;
};

export default CostTypePage; 