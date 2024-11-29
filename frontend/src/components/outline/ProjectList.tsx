import React from 'react';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { RootState } from '../../store';
import { deleteProject } from '../../store/slices/programsSlice';
import DetailsButton from '../buttons/DetailsButton';
import { clearCategoryId } from '../../store/slices/selectionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { createProjectAsync } from '../../store/slices/programsSlice';
import { Project } from '../../types/program';

type ProjectListProps = {
  selectedProjectId: number | null;
  onProjectToggle: (projectId: number) => void;
  onAddProject: (projectName: string) => void;
  onDetailsClick: (type: 'project', id: number) => void;
  projectSearch: string;
  setProjectSearch: (search: string) => void;
  showAddProjectInput: boolean;
  setShowAddProjectInput: (show: boolean) => void;
};

const ProjectList: React.FC<ProjectListProps> = ({
  selectedProjectId,
  onProjectToggle,
  onAddProject,
  onDetailsClick,
  projectSearch,
  setProjectSearch,
  showAddProjectInput,
  setShowAddProjectInput
}) => {
  const dispatch = useAppDispatch();
  const projects = useSelector((state: RootState) => {
    const selectedProgram = state.programs.items.find(p => p.id === state.selection.selectedProgramId);
    return selectedProgram ? selectedProgram.projects : [];
  });

  const programId = useSelector((state: RootState) => state.selection.selectedProgramId);

  const handleAddProject = (projectName: string) => {
    if (programId !== null) {
      const newProject: Partial<Project> = { name: projectName, categories: [] };
      dispatch(createProjectAsync({ programId, project: newProject }));
    }
  };

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Projects</h3>
        <button
          className={`add-toggle-button ${showAddProjectInput ? 'active' : ''}`}
          onClick={() => setShowAddProjectInput(!showAddProjectInput)}
        >
          {showAddProjectInput ? '×' : '+'}
        </button>
      </div>
      <SearchInput
        placeholder="Search Projects"
        value={projectSearch}
        onChange={setProjectSearch}
      />
      {showAddProjectInput && <AddItemInput onAdd={handleAddProject} />}
      {projects.map(project => (
        <div
          key={project.id}
          className={`project-item ${selectedProjectId === project.id ? 'selected' : ''}`}
          onClick={() => project.id && onProjectToggle(project.id)}
        >
          <span>{project.name}</span>
          <DetailsButton
            onClick={(e) => {
              e.stopPropagation();
              dispatch(clearCategoryId());
              onDetailsClick('project', project.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 