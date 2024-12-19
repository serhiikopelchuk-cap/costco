import React, { createContext, useState, useEffect, useMemo } from 'react';
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
  const rangeSelector = useMemo(() => new SelectionManager(items, frozenPeriods), [items, frozenPeriods]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);

  useEffect(() => {
    const updateSelectedCells = () => {
      const newSelectedCells = rangeSelector.getSelectedCells();
      setSelectedCells(newSelectedCells);
    };

    rangeSelector.subscribe(updateSelectedCells);
    return () => rangeSelector.unsubscribe(updateSelectedCells);
  }, [rangeSelector]);

  const contextValue = useMemo(() => ({
    rangeSelector,
    isSelecting,
    setIsSelecting,
    selectedCells,
    setSelectedCells
  }), [rangeSelector, isSelecting, selectedCells]);

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
};