import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProgramAsync, fetchProgramsAsync } from '../../store/slices/costTypesSlice';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails, unpinDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Program } from '../../types/program';
import { DetailsState } from '../../store/slices/uiSlice';

const ProgramList: React.FC = () => {
  const dispatch = useAppDispatch();
  const programs = useAppSelector(state => {
    return state.costTypes.item?.programs || [];
  });
  // Selection state from Redux
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);

  // UI state from Redux
  const showAddProgramInput = useAppSelector(state => state.ui.addInputVisibility.program);
  const programSearch = useAppSelector(state => state.ui.search.program);
  const details = useAppSelector(state => state.ui.details);

  const handleProgramToggle = (programId: number) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      // Only clear details if they're not pinned
      if (!details?.isPinned) {
        dispatch(setDetails(null));
      }
      
      dispatch(updateSelections({
        selectedProgramId: programId,
        selectedProjectId: program.projects.length > 0 ? program.projects[0].id : null,
        selectedCategoryId: null,
        selectedLineItems: []
      }));
    }
  };

  const handleDetailsClick = (type: string, id: number) => {
    const program = programs.find(p => p.id === id);
    if (!program) return;

    dispatch(unpinDetails());
    
    const detailsState: DetailsState = {
      type: 'program',
      id,
      name: program.name,
      isPinned: false,
      activeTab: 'summary'
    };
    
    dispatch(setDetails(detailsState));
    
    // Update selections after setting details
    dispatch(updateSelections({
      selectedProgramId: id,
      selectedProjectId: null,
      selectedCategoryId: null,
      selectedLineItems: []
    }));
  };

  const handleAddProgram = async (programName: string) => {
    try {
      const createdProgram = await dispatch(createProgramAsync({ 
        program: { name: programName, projects: [] } 
      })).unwrap();

      const detailsState: DetailsState = {
        type: 'program',
        id: createdProgram.id,
        name: programName,
        isPinned: true,
        activeTab: 'settings'
      };

      dispatch(setDetails(detailsState));
      
      dispatch(updateSelections({
        selectedProgramId: createdProgram.id,
        selectedProjectId: null,
        selectedCategoryId: null,
        selectedLineItems: []
      }));
    } catch (error) {
      console.error('Failed to create program:', error);
      // We might want to add a notification system to show this error to the user (aka toast)
      if (error instanceof Error) {
        alert(`Failed to create program: ${error.message}`);
      } else {
        alert('Failed to create program. Please try again.');
      }
    }
  };

  return (
    <GenericList
      title="Programs"
      type="program"
      items={programs.map((program) => ({
        id: program.id,
        name: program.name,
      }))}
      selectedItemIds={selectedProgramId ? [selectedProgramId] : []}
      onItemToggle={handleProgramToggle}
      onAddItem={handleAddProgram}
      onDetailsClick={handleDetailsClick}
      itemSearch={programSearch}
      setItemSearch={(value: string) => dispatch(setSearch({ type: 'program', value }))}
      showAddItemInput={showAddProgramInput}
      setShowAddItemInput={(show) => dispatch(setAddInputVisibility({ type: 'program', value: show }))}
      renderItem={(program) => <span>{program.name}</span>}
    />
  );
};

export default ProgramList; 