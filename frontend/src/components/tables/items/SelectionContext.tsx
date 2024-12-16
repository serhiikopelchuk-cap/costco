import React, { createContext, useState, useEffect } from 'react';
import { Item } from '../../../types/program';
import { SelectionManager, CellPosition } from './SelectionManager';

interface SelectionContextType {
  rangeSelector: SelectionManager;
  isSelecting: boolean;
  setIsSelecting: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCells: CellPosition[];
  setSelectedCells: (cells: CellPosition[]) => void;
}

export const SelectionContext = createContext<SelectionContextType>({} as SelectionContextType);

export const SelectionProvider: React.FC<{
  items: Item[];
  frozenPeriods: { [key: number]: boolean };
  children: React.ReactNode;
}> = ({ items, frozenPeriods, children }) => {
  const [rangeSelector] = useState(() => new SelectionManager(items, frozenPeriods));
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);

  useEffect(() => {
    const updateSelectedCells = () => {
      console.log('Updating selected cells');
      setSelectedCells(rangeSelector.getSelectedCells());
    };

    rangeSelector.subscribe(updateSelectedCells);
    return () => rangeSelector.unsubscribe(updateSelectedCells);
  }, [rangeSelector]);

  useEffect(() => {
    const handleMouseUp = () => {
      console.log('Mouse up, isSelecting:', isSelecting);
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isSelecting]);

  return (
    <SelectionContext.Provider value={{ 
      rangeSelector, 
      isSelecting, 
      setIsSelecting,
      selectedCells,
      setSelectedCells 
    }}>
      {children}
    </SelectionContext.Provider>
  );
};