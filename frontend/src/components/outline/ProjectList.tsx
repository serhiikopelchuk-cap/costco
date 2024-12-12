import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProjectAsync } from '../../store/slices/costTypesSlice';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails, unpinDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Project } from '../../types/program';

const ProjectList: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector(state => state.selection.selectedProjectId);
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);
  
  // Get projects from the current cost type and selected program
  const projects = useAppSelector(state => {
    if (!selectedProgramId) return [];
    
    // First try to get from current item
    const program = state.costTypes.item?.programs.find(p => p.id === selectedProgramId);
    if (program) return program.projects;
    
    // If not found in current item, try allPrograms
    const allProgram = state.costTypes.allPrograms.find(p => p.id === selectedProgramId);
    return allProgram ? allProgram.projects : [];
  });

  // UI state from Redux
  const showAddProjectInput = useAppSelector(state => state.ui.addInputVisibility.project);
  const projectSearch = useAppSelector(state => state.ui.search.project);
  const details = useAppSelector(state => state.ui.details);

  const handleProjectToggle = (projectId: number) => {
    // Only clear details if they're not pinned
    if (!details?.isPinned) {
      dispatch(setDetails(null));
    }

    dispatch(updateSelections({
      selectedProjectId: projectId,
      selectedCategoryId: null,
      selectedLineItems: []
    }));
  };

  const handleDetailsClick = (type: string, id: number) => {
    // Unpin any pinned details when viewing details of another item
    dispatch(unpinDetails());
    
    dispatch(updateSelections({ 
      selectedProjectId: id,
      selectedCategoryId: null,
      selectedLineItems: []
    }));
    
    dispatch(setDetails({ 
      type, 
      id, 
      name: projects.find(p => p.id === id)?.name || '',
      activeTab: 'settings' as const,
      isPinned: false
    }));
  };

  const handleAddProject = async (projectName: string) => {
    if (selectedProgramId !== null) {
      try {
        const newProject: Partial<Project> = { 
          name: projectName, 
          categories: [] 
        };

        // Create new project
        const result = await dispatch(createProjectAsync({ 
          programId: selectedProgramId, 
          project: newProject 
        })).unwrap();

        // Select the new project
        dispatch(updateSelections({
          selectedProjectId: result.project.id,
          selectedCategoryId: null,
          selectedLineItems: []
        }));

      } catch (error) {
        console.error('Failed to create project:', error);
      }
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