import React from 'react';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Program } from '../../types/program';
import DetailsButton from '../buttons/DetailsButton';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { createProgramAsync } from '../../store/slices/programsSlice';

type ProgramListProps = {
  programs: Program[];
  selectedProgramId: number | null;
  onProgramToggle: (programId: number) => void;
  onAddProgram: (programName: string) => void;
  onDetailsClick: (type: 'program', id: number) => void;
  programSearch: string;
  setProgramSearch: (search: string) => void;
  showAddProgramInput: boolean;
  setShowAddProgramInput: (show: boolean) => void;
};

const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  selectedProgramId,
  onProgramToggle,
  onAddProgram,
  onDetailsClick,
  programSearch,
  setProgramSearch,
  showAddProgramInput,
  setShowAddProgramInput
}) => {
  // console.log('ProgramList programs:', programs);

  const dispatch = useAppDispatch();

  const handleAddProgram = (programName: string) => {
    const costTypeId = 1; // Replace with actual logic to determine costTypeId
    const newProgram: Partial<Program> = { name: programName, projects: [] };
    dispatch(createProgramAsync({ program: newProgram, costTypeId }));
  };

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
      {programs.map(program => (
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