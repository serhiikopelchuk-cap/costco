import React from 'react';
import { useDispatch } from 'react-redux';
import MiniGenericList from '../common/MiniGenericList';
import { Program } from '../../types/program';
import { updateSelections } from '../../store/slices/selectionSlice';
import { setDetails } from '../../store/slices/uiSlice';

interface MiniProgramListProps {
  programs: Program[];
  selectedProgramId: number | null;
}

const MiniProgramList: React.FC<MiniProgramListProps> = ({
  programs,
  selectedProgramId,
}) => {
  const dispatch = useDispatch();

  const handleExpand = () => {
    dispatch(updateSelections({ selectedCategoryId: null }));
  };

  const handleDetailsClick = (program: Program) => {
    console.log('MiniProgramList - handleDetailsClick:', program);
    dispatch(updateSelections({ selectedCategoryId: null }));
    dispatch(setDetails({
      type: 'program',
      id: program.id,
      name: program.name,
      isPinned: true,
      activeTab: 'summary'
    }));
  };

  return (
    <MiniGenericList
      title="Program"
      items={programs}
      selectedItemIds={selectedProgramId ? [selectedProgramId] : []}
      renderItem={(program) => <span>{program.name}</span>}
      onExpand={handleExpand}
      onDetailsClick={handleDetailsClick}
    />
  );
};

export default MiniProgramList; 