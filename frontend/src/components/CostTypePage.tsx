import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchCostTypeByAliasAsync, fetchProgramsAsync } from '../store/slices/costTypesSlice';
import { updateSelections, setCostType } from '../store/slices/selectionSlice';
import { setCurrentPage, setDetails, UiState } from '../store/slices/uiSlice';
import Outline from './outline/Outline';
// import './CostTypePage.css';

type CostTypeAlias = 'direct_costs' | 'indirect_costs';

const CostTypePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(state => state.ui.currentPage);
  const { selectedProgramId, selectedProjectId, selectedCategoryId } = useAppSelector(state => state.selection);
  const details = useAppSelector<UiState['details']>(state => state.ui.details);
  const programs = useAppSelector(state => state.costTypes.item?.programs || []);

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

        // Clear details
        dispatch(setDetails(null));

        // Then load data
        await dispatch(fetchProgramsAsync()).unwrap();
        if (currentPage) {
          await dispatch(fetchCostTypeByAliasAsync(currentPage as CostTypeAlias)).unwrap();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch, currentPage]);

  // Set initial selections if none exist and no details are open
  useEffect(() => {
    if (
      programs.length === 0 || 
      selectedProgramId || 
      details !== null
    ) {
      return;
    }

    const firstProgram = programs[0];
    const firstProject = firstProgram.projects[0] || null;
    const firstCategory = firstProject?.categories[0] || null;
    const firstItem = firstCategory?.items[0] || null;

    dispatch(updateSelections({
      selectedProgramId: firstProgram.id,
      selectedProjectId: firstProject?.id || null,
      selectedCategoryId: firstCategory?.id || null,
      selectedLineItems: firstItem ? [firstItem] : []
    }));
  }, [programs, selectedProgramId, details, dispatch]);

  return <Outline data={programs} />;
};

export default CostTypePage; 