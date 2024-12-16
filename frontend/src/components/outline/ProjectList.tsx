import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createProjectAsync, fetchProgramAsync } from '../../store/slices/costTypesSlice';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails, unpinDetails } from '../../store/slices/uiSlice';
import GenericList from '../common/GenericList';
import { Project } from '../../types/program';
import { DetailsState } from '../../store/slices/uiSlice';

const ProjectList: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedProjectId = useAppSelector(state => state.selection.selectedProjectId);
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);
  const details = useAppSelector(state => state.ui.details);
  
  // Get projects from the current cost type and selected program
  const projects = useAppSelector(state => {
    if (!selectedProgramId) return [];
    const costType = state.costTypes.item;
    if (!costType) return [];
    const program = costType.programs.find(p => p.id === selectedProgramId);
    return program?.projects || [];
  });

  // UI state from Redux
  const showAddProjectInput = useAppSelector(state => state.ui.addInputVisibility.project);
  const projectSearch = useAppSelector(state => state.ui.search.project);

  // Get project ID from details if it's a project AND belongs to current program
  const detailsProjectId = details?.type === 'project' && 
    details.parentProgramId === selectedProgramId 
      ? details.id 
      : null;

  // Fetch program data when program ID changes
  useEffect(() => {
    if (selectedProgramId) {
      dispatch(fetchProgramAsync(selectedProgramId));
    }
  }, [selectedProgramId, dispatch]);

  const handleProjectToggle = (projectId: number) => {
    // Only clear details if they're not pinned
    if (!details?.isPinned) {
      dispatch(setDetails(null));
    }

    // Find the project
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // If clicking the same project, deselect it
    if (selectedProjectId === projectId) {
      dispatch(updateSelections({
        selectedProjectId: null,
        selectedCategoryId: null,
        selectedLineItems: []
      }));
    } else {
      // Select the project and its first category if available
      dispatch(updateSelections({
        selectedProjectId: projectId,
        selectedCategoryId: project.categories.length > 0 ? project.categories[0].id : null,
        selectedLineItems: []
      }));
    }
  };

  const handleDetailsClick = (type: string, id: number) => {
    console.log('Details click:', {
      type,
      id,
      selectedProgramId,
      project: projects.find(p => p.id === id)
    });
    const project = projects.find(p => p.id === id);
    if (!project || !selectedProgramId) return;

    dispatch(unpinDetails());
    
    const detailsState: DetailsState = {
      type: 'project',
      id,
      name: project.name,
      isPinned: false,
      activeTab: 'summary',
      parentProgramId: selectedProgramId
    };
    
    dispatch(setDetails(detailsState));
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

        // Set details for the new project
        const detailsState: DetailsState = {
          type: 'project',
          id: result.project.id,
          name: projectName,
          isPinned: true,
          activeTab: 'summary',
          parentProgramId: selectedProgramId
        };
        
        dispatch(setDetails(detailsState));
        
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
      selectedItemIds={[
        ...(selectedProjectId ? [selectedProjectId] : []),
        ...(detailsProjectId ? [detailsProjectId] : [])
      ]}
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