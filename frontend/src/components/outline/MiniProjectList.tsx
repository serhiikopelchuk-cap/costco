import React from 'react';
import { useDispatch } from 'react-redux';
import MiniGenericList from '../common/MiniGenericList';
import { Project } from '../../types/program';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setDetails } from '../../store/slices/uiSlice';

interface MiniProjectListProps {
  projects: Project[];
  selectedProjectId: number | null;
}

const MiniProjectList: React.FC<MiniProjectListProps> = ({
  projects,
  selectedProjectId,
}) => {
  const dispatch = useDispatch();

  const handleExpand = () => {
    dispatch(updateSelections({ selectedCategoryId: null }));
  };

  const handleDetailsClick = (project: Project) => {
    console.log('MiniProjectList - handleDetailsClick:', project);
    dispatch(updateSelections({ selectedCategoryId: null }));
    dispatch(setDetails({
      type: 'project',
      id: project.id,
      name: project.name,
      isPinned: true,
      activeTab: 'summary'
    }));
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