import React from 'react';
import { useDispatch } from 'react-redux';
import MiniGenericList from '../common/MiniGenericList';
import { Project } from '../../types/program';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setDetails, unpinDetails } from '../../store/slices/uiSlice';
import { useAppSelector } from '../../hooks/reduxHooks';

interface MiniProjectListProps {
  projects: Project[];
  selectedProjectId: number | null;
}

const MiniProjectList: React.FC<MiniProjectListProps> = ({
  projects,
  selectedProjectId,
}) => {
  const dispatch = useDispatch();
  const selectedProgramId = useAppSelector(state => state.selection.selectedProgramId);

  const handleExpand = () => {
    dispatch(updateSelections({ selectedCategoryId: null }));
  };

  const handleDetailsClick = (project: Project) => {
    if (!selectedProgramId) return;

    // Unpin any existing details first
    dispatch(unpinDetails());

    // Set new details with parent program ID
    dispatch(setDetails({
      type: 'project',
      id: project.id,
      name: project.name,
      isPinned: true,
      activeTab: 'summary',
      parentProgramId: selectedProgramId
    }));

    // Clear category selection
    dispatch(updateSelections({ selectedCategoryId: null }));
  };

  return (
    <MiniGenericList
      title="Project"
      items={projects}
      selectedItemIds={selectedProjectId ? [selectedProjectId] : []}
      renderItem={(project) => <span>{project.name}</span>}
      onExpand={handleExpand}
      onDetailsClick={handleDetailsClick}
    />
  );
};

export default MiniProjectList; 