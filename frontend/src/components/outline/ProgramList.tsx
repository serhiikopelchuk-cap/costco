import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProgramAsync, fetchProgramsAsync } from '../../store/slices/costTypesSlice';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails, unpinDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Program } from '../../types/program';

const ProgramList: React.FC = () => {
  const dispatch = useAppDispatch();
  const programs = useAppSelector(state => {
    console.log('ProgramList selector:', state.costTypes.item?.programs);
    return state.costTypes.item?.programs || [];
  });
  // console.log('programs:', programs);
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

    // When clicking details of another program, unpin current details first
    dispatch(unpinDetails());
    
    dispatch(updateSelections({
      selectedProgramId: id,
      selectedProjectId: null,
      selectedCategoryId: null,
      selectedLineItems: []
    }));
    
    dispatch(setDetails({ 
      type, 
      id, 
      name: program.name,
      isPinned: false
    }));
  };

  const handleAddProgram = async (programName: string) => {
    const newProgram: Partial<Program> = { 
      name: programName, 
      projects: [] 
    };

    try {
      // Create new program and store its ID
      const createdProgram = await dispatch(createProgramAsync({ program: newProgram })).unwrap();
      const newProgramId = createdProgram.id;
      
      // First select the new program
      dispatch(updateSelections({
        selectedProgramId: newProgramId,
        selectedProjectId: null,
        selectedCategoryId: null,
        selectedLineItems: []
      }));

      // Set pinned details
      dispatch(setDetails({ 
        type: 'program', 
        id: newProgramId, 
        name: programName,
        activeTab: 'settings' as const,
        isPinned: true
      }));
    } catch (error) {
      console.error('Failed to create program:', error);
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