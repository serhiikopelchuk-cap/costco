import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProgramAsync } from '../../store/slices/costTypesSlice';
import { setProgramId, updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Program } from '../../types/program';

const ProgramList: React.FC = () => {
  const dispatch = useAppDispatch();
  const costTypes = useAppSelector(state => state.costTypes);
  const programs = useAppSelector(state => costTypes.item?.programs || []);
  
  // Selection state from Redux
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);

  // UI state from Redux
  const showAddProgramInput = useAppSelector(state => state.ui.addInputVisibility.program);
  const programSearch = useAppSelector(state => state.ui.search.program);

  const handleProgramToggle = (programId: number) => {
    if (selectedProgramId === programId) {
      dispatch(updateSelections({ programId: null }));
    } else {
      const program = programs.find(p => p.id === programId);
      if (program) {
        dispatch(updateSelections({
          programId,
          projectId: program.projects.length > 0 ? program.projects[0].id : null,
          categoryId: null,
          lineItems: []
        }));
      }
    }
  };

  const handleDetailsClick = (type: string, id: number) => {
    dispatch(setDetails({ type, id, name: programs.find(p => p.id === id)?.name || '' }));
  };

  const handleAddProgram = (programName: string) => {
    const costTypeId = costTypes.item?.id;
    if (!costTypeId) return;

    const newProgram: Partial<Program> = { name: programName, projects: [] };
    dispatch(createProgramAsync({ program: newProgram, costTypeId }))
      .unwrap()
      .then((createdProgram: Program) => {
        dispatch(setProgramId(createdProgram.id));
      })
      .catch((error: any) => {
        console.error('Failed to create program:', error);
      });
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