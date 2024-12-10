import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProjectAsync } from '../../store/slices/programsSlice';
import { setProjectId, clearCategoryId } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Project } from '../../types/program';

const ProjectList: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector(state => state.selection.selectedProjectId);
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);
  const projects = useAppSelector(state => {
    const selectedProgram = state.costTypes.item?.programs.find(p => p.id === selectedProgramId);
    return selectedProgram ? selectedProgram.projects : [];
  });

  // UI state from Redux
  const showAddProjectInput = useAppSelector(state => state.ui.addInputVisibility.project);
  const projectSearch = useAppSelector(state => state.ui.search.project);

  const handleProjectToggle = (projectId: number) => {
    if (selectedProjectId === projectId) {
      dispatch(setProjectId(null));
    } else {
      dispatch(setProjectId(projectId));
    }
  };

  const handleDetailsClick = (type: string, id: number) => {
    dispatch(setDetails({ type, id, name: projects.find(p => p.id === id)?.name || '' }));
    dispatch(clearCategoryId());
  };

  const handleAddProject = (projectName: string) => {
    if (selectedProgramId !== null) {
      const newProject: Partial<Project> = { name: projectName, categories: [] };
      dispatch(createProjectAsync({ programId: selectedProgramId, project: newProject })).unwrap();
    }
  };

  return (
    <GenericList
      title="Projects"
      type="project"
      items={projects.map((project) => ({
        id: project.id,
        name: project.name,
      }))}
      selectedItemIds={selectedProjectId ? [selectedProjectId] : []}
      onItemToggle={handleProjectToggle}
      onAddItem={handleAddProject}
      onDetailsClick={handleDetailsClick}
      itemSearch={projectSearch}
      setItemSearch={(value: string) => dispatch(setSearch({ type: 'project', value }))}
      showAddItemInput={showAddProjectInput}
      setShowAddItemInput={(show) => dispatch(setAddInputVisibility({ type: 'project', value: show }))}
      renderItem={(project) => <span>{project.name}</span>}
    />
  );
};

export default ProjectList; 