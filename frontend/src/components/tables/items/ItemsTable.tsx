import React, { useState, useEffect, useContext } from 'react';
import './ItemsTable.css';
import { Item, Cost, Category } from '../../../types/program';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { 
  updateItemNameAsync, 
  updateItemCostsAsync, 
  deleteLineItemAsync,
  updateCategory as updateCategoryInStore
} from '../../../store/slices/costTypesSlice';
import { setLineItems as setLineItemsAction } from '../../../store/slices/selectionSlice';
import CloneButton from '../../buttons/CloneButton';
import DeleteButton from '../../buttons/DeleteButton';
import { cloneItem } from '../../../services/itemService';
import { bulkUpdateItems } from '../../../services/itemService';
import CurrencyInput from '../../common/CurrencyInput';
import { SelectionProvider, SelectionContext } from './SelectionContext';
import CellSelection from './CellSelection';
import TestSelectionTable from './TestSelectionTable';

interface CellRange {
  cells: Array<{
    itemId: number;
    costId: number;
  }>;
}

interface ItemsTableProps {
  items: Item[];
  selectedItems: Item[];
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
  frozenPeriods: { [key: number]: boolean };
  onItemUpdate: (item: Item) => void;
  onBulkCellChange?: (cells: Array<{itemId: number, costId: number}>, value: string) => void;
}

interface CellPosition {
  itemId: number;
  costId: number;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  selectedItems,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
  frozenPeriods,
  onItemUpdate,
}) => {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector(state => 
    state.costTypes.item?.programs
      .flatMap(program => program.projects)
      .flatMap(project => project.categories)
      .find(category => category.id === selectedCategoryId)
  );
  const [editingName, setEditingName] = useState<{ [key: number]: string }>({});
  const [cloningItems, setCloningItems] = useState<{ [key: number]: boolean }>({});
  const [cloneItemSuccess, setCloneItemSuccess] = useState<{ [key: number]: boolean }>({});
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);

  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfCosts = 13;

  const itemsToDisplay = selectedItems.length > 0 ? selectedItems : items;
  const costTotals = Array(numberOfCosts).fill(0);
  let totalOfTotals = 0;

  itemsToDisplay.forEach(item => {
    if (!item.costs || !Array.isArray(item.costs)) {
      item.costs = Array(numberOfCosts).fill({ value: 0 });
    }
    
    const sortedCosts = item.costs.slice().sort((a, b) => (a.id || 0) - (b.id || 0));
    
    sortedCosts.forEach((cost: Cost, index: number) => {
      costTotals[index] += Number(cost.value) || 0;
    });
    totalOfTotals += sortedCosts.reduce((sum: number, cost: Cost) => sum + (Number(cost.value) || 0), 0);
  });

  const averageOfAverages = itemsToDisplay.length > 0 ? totalOfTotals / (itemsToDisplay.length * numberOfCosts) : 0;

  const handleNameChange = (itemId: number, value: string) => {
    setEditingName(prev => ({ ...prev, [itemId]: value }));
  };

  const handleNameBlur = async (itemId: number) => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) return;

    const newName = editingName[itemId];
    if (newName !== undefined) {
      try {
        const response = await dispatch(updateItemNameAsync({
          itemId,
          name: newName,
          programId: selectedProgramId,
          projectId: selectedProjectId,
          categoryId: selectedCategoryId
        })).unwrap();

        const updatedSelectedItems = selectedItems.map(item =>
          item.id === itemId ? { ...item, name: response.item.name } : item
        );
        dispatch(setLineItemsAction(updatedSelectedItems));

        setEditingName(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      } catch (error) {
        console.error('Failed to update item name:', error);
      }
    }
  };

  const handleInputChange = (itemId: number, costId: number, value: string) => {
    console.log('handleInputChange:', { itemId, costId, value, selectedCells });
    
    const sanitizedValue = value.replace(/[^0-9.$]/g, '');
    const numericValue = parseFloat(sanitizedValue.replace(/\$/g, ''));
    
    if (numericValue < 0) return;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      console.log('Updating multiple cells with value:', sanitizedValue);
      selectedCells.forEach(cell => {
        const key = `${cell.itemId}-${cell.costId}`;
        console.log('Setting value for cell:', { key, value: sanitizedValue });
        setEditingValues(prev => ({
          ...prev,
          [key]: sanitizedValue
        }));
      });
    } else {
      const key = `${itemId}-${costId}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: sanitizedValue
      }));
    }
  };

  const handleInputBlur = async (itemId: number, costId: number, value: string) => {
    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      // Multiple cells update logic
      const updatedItems = new Map<number, Item>();
      
      selectedCells.forEach(cell => {
        const itemToUpdate = items.find(item => item.id === cell.itemId);
        if (!itemToUpdate) return;

        if (!updatedItems.has(cell.itemId)) {
          updatedItems.set(cell.itemId, {
            id: itemToUpdate.id,
            name: itemToUpdate.name,
            costs: itemToUpdate.costs.map(cost => ({
              id: cost.id,
              value: Number(cost.value)
            }))
          } as Item);
        }

        const item = updatedItems.get(cell.itemId)!;
        const costIndex = item.costs.findIndex(cost => cost.id === cell.costId);
        if (costIndex !== -1) {
          item.costs[costIndex] = {
            id: item.costs[costIndex].id,
            value: numericValue
          };
        }
      });

      try {
        const itemsToUpdate = Array.from(updatedItems.values()).map(item => ({
          id: item.id!,
          costs: item.costs.map(cost => ({
            id: cost.id!,
            value: Number(cost.value)
          }))
        }));

        const response = await bulkUpdateItems(itemsToUpdate);
        
        dispatch(updateCategoryInStore({
          programId: selectedProgramId!,
          projectId: selectedProjectId!,
          category: {
            ...selectedCategory!,
            items: response
          }
        }));

        setEditingValues({});
      } catch (error) {
        console.error('Failed to update items:', error);
      }
    } else {
      // Single cell update logic
      const loadingKey = `${itemId}-${costId}`;
      setLoadingItems(prev => ({ ...prev, [loadingKey]: true }));

      try {
        const itemToUpdate = items.find(item => item.id === itemId);
        if (!itemToUpdate) return;

        const updatedItemWithNewCost = {
          ...itemToUpdate,
          costs: itemToUpdate.costs.map((cost) =>
            cost.id === costId ? { ...cost, value: numericValue } : cost
          )
        };

        await dispatch(updateItemCostsAsync({ 
          itemId, 
          updatedItem: { costs: updatedItemWithNewCost.costs },
          programId: selectedProgramId!,
          projectId: selectedProjectId!,
          categoryId: selectedCategoryId!
        })).unwrap();

        onItemUpdate(updatedItemWithNewCost);

        // Clear editing value after update is complete
        const key = `${itemId}-${costId}`;
        setEditingValues(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      } catch (error) {
        console.error('Failed to update item costs:', error);
      } finally {
        setLoadingItems(prev => ({ ...prev, [loadingKey]: false }));
      }
    }
  };

  const handleCloneItem = async (item: Item) => {
    if (!selectedCategoryId) return;

    setCloningItems(prev => ({ ...prev, [item.id!]: true }));
    setCloneItemSuccess(prev => ({ ...prev, [item.id!]: false }));
    
    try {
      const response = await cloneItem(item.id!, selectedCategoryId);
      const clonedItem: Item = {
        id: response.item.id,
        name: response.item.name,
        costs: response.item.costs,
      };

      onItemUpdate(clonedItem);
      setCloneItemSuccess(prev => ({ ...prev, [item.id!]: true }));
      setTimeout(() => setCloneItemSuccess(prev => ({ ...prev, [item.id!]: false })), 3000);
    } catch (error) {
      console.error('Error cloning item:', error);
    } finally {
      setCloningItems(prev => ({ ...prev, [item.id!]: false }));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) return;

    try {
      await dispatch(deleteLineItemAsync({
        itemId,
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: selectedCategoryId
      })).unwrap();

      dispatch(setLineItemsAction(selectedItems.filter(item => item.id !== itemId)));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const isCellFrozen = (index: number) => {
    return frozenPeriods[index + 1];
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const handleHeaderClick = (columnIndex: number) => {
    if (isCellFrozen(columnIndex)) return;

    const columnCells: CellPosition[] = [];
    itemsToDisplay.forEach(item => {
      const sortedCosts = [...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0));
      const cost = sortedCosts[columnIndex];
      
      if (cost?.id) {
        columnCells.push({ 
          itemId: item.id!, 
          costId: cost.id 
        });
      }
    });

    const allSelected = columnCells.every(cell => 
      selectedCells.some(selected => 
        selected.itemId === cell.itemId && selected.costId === cell.costId
      )
    );

    if (allSelected) {
      setSelectedCells(selectedCells.filter(selected => 
        !columnCells.some(cell => 
          cell.itemId === selected.itemId && cell.costId === selected.costId
        )
      ));
    } else {
      setSelectedCells([...selectedCells, ...columnCells]);
    }
  };

  const TableContent: React.FC = () => {
    const { selectedCells } = useContext(SelectionContext);

    return (
      <table className="items-table">
        <thead>
          <tr className="header-row">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`header-cell ${isCellFrozen(index) ? 'frozen' : ''}`}
                onClick={() => handleHeaderClick(index)}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="summary-row">
            {costTotals.map((total, index) => (
              <td key={index} className="summary-cell">{Number(total).toFixed(0)}$</td>
            ))}
            <td className="summary-cell">{Number(totalOfTotals).toFixed(2)}$</td>
            <td className="summary-cell">{Number(averageOfAverages).toFixed(2)}$</td>
          </tr>
          {itemsToDisplay.map((item) => {
            const itemTotal = item.costs.reduce((sum: number, cost: Cost) => 
              sum + (Number(cost.value) || 0), 0);
            const itemAverage = itemTotal / numberOfCosts;
            const sortedCosts = item.costs.slice().sort((a, b) => (a.id || 0) - (b.id || 0));

            return (
              <React.Fragment key={item.id}>
                <tr className="line-item-row">
                  <td className="line-item-label" colSpan={columns.length}>
                    <input
                      type="text"
                      value={editingName[item.id!] !== undefined ? editingName[item.id!] : item.name}
                      onChange={(e) => handleNameChange(item.id!, e.target.value)}
                      onBlur={() => handleNameBlur(item.id!)}
                      className="line-item-input"
                    />
                    <CloneButton
                      isCloning={cloningItems[item.id!]}
                      cloneSuccess={cloneItemSuccess[item.id!]}
                      onClick={() => handleCloneItem(item)}
                      title="Clone item"
                    />
                    <DeleteButton
                      onClick={() => handleRemoveItem(item.id!)}
                      title="Delete item"
                      disabled={cloningItems[item.id!]}
                    />
                  </td>
                </tr>
                <tr>
                  {sortedCosts.map((cost, index) => {
                    const loadingKey = `${item.id!}-${cost.id}`;
                    const isSelected = selectedCells.some(cell => 
                      cell.itemId === item.id! && 
                      cell.costId === cost.id!
                    );
                    const isFrozen = isCellFrozen(index);
                    
                    return (
                      <CellSelection
                        key={cost.id}
                        itemId={item.id!}
                        costId={cost.id!}
                        index={index}
                        isFrozen={isFrozen}
                        isSelected={isSelected}
                      >
                        <div className="input-container">
                          <CurrencyInput
                            value={editingValues[loadingKey] !== undefined ? editingValues[loadingKey] : cost.value}
                            onChange={(value) => handleInputChange(item.id!, cost.id!, value)}
                            onBlur={(value) => handleInputBlur(item.id!, cost.id!, value)}
                            disabled={isFrozen || loadingItems[loadingKey]}
                            className="cost-input"
                          />
                          {loadingItems[loadingKey] && <span className="spinner"></span>}
                        </div>
                      </CellSelection>
                    );
                  })}
                  <td className="line-item-cell">{Number(itemTotal).toFixed(2)}$</td>
                  <td className="line-item-cell">{Number(itemAverage).toFixed(2)}$</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <>
      <SelectionProvider items={itemsToDisplay} frozenPeriods={frozenPeriods}>
        <TableContent />
      </SelectionProvider>
      <TestSelectionTable />
    </>
  );
};

export default ItemsTable; 