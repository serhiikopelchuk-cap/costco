import React from 'react';
import SearchInput from '../SearchInput';
import AddItemInput from '../AddItemInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Project } from '../../services/programService';

type ProjectListProps = {
  projects: Project[];
  selectedProjectId: number | null;
  onProjectToggle: (projectId: number) => void;
  onAddProject: (projectName: string) => void;
  onDetailsClick: (type: 'project', name: string) => void;
  projectSearch: string;
  setProjectSearch: (search: string) => void;
  showAddProjectInput: boolean;
  setShowAddProjectInput: (show: boolean) => void;
};

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onProjectToggle,
  onAddProject,
  onDetailsClick,
  projectSearch,
  setProjectSearch,
  showAddProjectInput,
  setShowAddProjectInput
}) => (
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
    {showAddProjectInput && <AddItemInput onAdd={onAddProject} />}
    {projects.map(project => (
      <div
        key={project.id}
        className={`project-item ${selectedProjectId === project.id ? 'selected' : ''}`}
        onClick={() => project.id && onProjectToggle(project.id)}
      >
        <span>{project.name}</span>
        <button
          className="icon-button"
          onClick={(e) => {
            e.stopPropagation();
            onDetailsClick('project', project.name);
          }}
        >
          <FontAwesomeIcon icon={faEllipsisV} className="edit-icon" />
        </button>
      </div>
    ))}
  </div>
);

export default ProjectList; 