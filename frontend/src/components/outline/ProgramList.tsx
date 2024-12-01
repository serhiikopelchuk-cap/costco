import React from 'react';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Program } from '../../types/program';
import DetailsButton from '../buttons/DetailsButton';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProgramAsync } from '../../store/slices/costTypesSlice';
import { setProgramId } from '../../store/slices/selectionSlice';

type ProgramListProps = {
  selectedProgramId: number | null;
  onProgramToggle: (programId: number) => void;
  onDetailsClick: (type: 'program', id: number) => void;
  programSearch: string;
  setProgramSearch: (search: string) => void;
  showAddProgramInput: boolean;
  setShowAddProgramInput: (show: boolean) => void;
};

const ProgramList: React.FC<ProgramListProps> = ({
  selectedProgramId,
  onProgramToggle,
  onDetailsClick,
  programSearch,
  setProgramSearch,
  showAddProgramInput,
  setShowAddProgramInput
}) => {
  const dispatch = useAppDispatch();
  const costTypes = useAppSelector(state => state.costTypes);
  const programs = useAppSelector(state => costTypes.item?.programs || []);

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

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(programSearch.toLowerCase())
  );

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Programs</h3>
        <button
          className={`add-toggle-button ${showAddProgramInput ? 'active' : ''}`}
          onClick={() => setShowAddProgramInput(!showAddProgramInput)}
        >
          {showAddProgramInput ? '×' : '+'}
        </button>
      </div>
      <SearchInput
        placeholder="Search Programs"
        value={programSearch}
        onChange={setProgramSearch}
      />
      {showAddProgramInput && <AddItemInput onAdd={handleAddProgram} />}
      {filteredPrograms.map(program => (
        <div
          key={program.id}
          className={`program-item ${selectedProgramId === program.id ? 'selected' : ''}`}
          onClick={() => program.id && onProgramToggle(program.id)}
        >
          <span>{program.name}</span>
          <DetailsButton
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick('program', program.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgramList; 