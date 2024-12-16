import React, { useContext } from 'react';
import { SelectionContext } from './SelectionContext';

interface CellSelectionProps {
  itemId: number;
  costId: number;
  index: number;
  isFrozen: boolean;
  isSelected: boolean;
  children: React.ReactNode;
}

const CellSelection: React.FC<CellSelectionProps> = ({
  itemId,
  costId,
  index,
  isFrozen,
  isSelected,
  children
}) => {
  const { rangeSelector, isSelecting, setIsSelecting } = useContext(SelectionContext);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) {
      return;
    }

    if (e.button !== 0 || isFrozen) return;
    
    e.preventDefault();
    setIsSelecting(true);
    rangeSelector.startNewRange({ itemId, costId });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!e.buttons || !isSelecting || isFrozen) return;
    rangeSelector.updateLastRange({ itemId, costId });
  };

  return (
    <td 
      className={`line-item-cell ${isSelected ? 'selected' : ''} ${isFrozen ? 'frozen' : ''}`}
      data-item-id={itemId}
      data-cost-id={costId}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {children}
    </td>
  );
};

export default CellSelection; 