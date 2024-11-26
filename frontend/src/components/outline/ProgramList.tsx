import React from 'react';
import SearchInput from '../SearchInput';
import AddItemInput from '../AddItemInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Program } from '../../services/programService';

type ProgramListProps = {
  programs: Program[];
  selectedProgramId: number | null;
  onProgramToggle: (programId: number) => void;
  onAddProgram: (programName: string) => void;
  onDetailsClick: (type: 'program', name: string) => void;
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
}) => (
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
    {showAddProgramInput && <AddItemInput onAdd={onAddProgram} />}
    {programs.map((program) => (
      <div
        key={program.id ?? `temp-${program.name}`}
        className={`program-item ${selectedProgramId === program.id ? 'selected' : ''}`}
        onClick={() => program.id && onProgramToggle(program.id)}
      >
        <span>{program.name}</span>
        <button
          className="icon-button"
          onClick={(e) => {
            e.stopPropagation();
            onDetailsClick('program', program.name);
          }}
        >
          <FontAwesomeIcon icon={faEllipsisV} className="edit-icon" />
        </button>
      </div>
    ))}
  </div>
);

export default ProgramList; 