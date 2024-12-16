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
import { updateCategory as updateCategoryService } from '../../../services/categoryService';
import { bulkUpdateItems } from '../../../services/itemService';
import CurrencyInput from '../../common/CurrencyInput';
import { SelectionProvider, SelectionContext } from './SelectionContext';
import CellSelection from './CellSelection';

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

interface FrozenPeriods {
  [key: number]: boolean;
}

const frozenTestPeriods: FrozenPeriods = {
  [1]: true,  // P1 заморожен
  [2]: false, // P2 не заморожен
  [3]: false,
  [4]: false,
  [5]: false
};

const TestSelectionTable: React.FC = () => {
  const testItems: Item[] = [
    {
      id: 1,
      name: "Test Item 1",
      costs: [
        { id: 101, value: 100 },
        { id: 102, value: 200 },
        { id: 103, value: 300 },
        { id: 104, value: 400 },
        { id: 105, value: 500 },
      ]
    },
    {
      id: 2,
      name: "Test Item 2",
      costs: [
        { id: 201, value: 150 },
        { id: 202, value: 250 },
        { id: 203, value: 350 },
        { id: 204, value: 450 },
        { id: 205, value: 550 },
      ]
    },
    {
      id: 3,
      name: "Test Item 3",
      costs: [
        { id: 301, value: 160 },
        { id: 302, value: 260 },
        { id: 303, value: 360 },
        { id: 304, value: 460 },
        { id: 305, value: 560 },
      ]
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3>Test Selection Table</h3>
      <SelectionProvider items={testItems} frozenPeriods={frozenTestPeriods}>
        <TestTableContent />
      </SelectionProvider>
    </div>
  );
};

const TestTableContent: React.FC = () => {
  const { selectedCells } = useContext(SelectionContext);
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [testItemsState, setTestItemsState] = useState<Item[]>([
    {
      id: 1,
      name: "Test Item 1",
      costs: [
        { id: 101, value: 100 },
        { id: 102, value: 200 },
        { id: 103, value: 300 },
        { id: 104, value: 400 },
        { id: 105, value: 500 },
      ]
    },
    {
      id: 2,
      name: "Test Item 2",
      costs: [
        { id: 201, value: 150 },
        { id: 202, value: 250 },
        { id: 203, value: 350 },
        { id: 204, value: 450 },
        { id: 205, value: 550 },
      ]
    },
    {
      id: 3,
      name: "Test Item 3",
      costs: [
        { id: 301, value: 160 },
        { id: 302, value: 260 },
        { id: 303, value: 360 },
        { id: 304, value: 460 },
        { id: 305, value: 560 },
      ]
    }
  ]);

  const handleInputChange = (itemId: number, costId: number, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.$]/g, '');
    const numericValue = parseFloat(sanitizedValue.replace(/\$/g, ''));
    
    if (numericValue < 0) return;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      // Обновляем все выделенные ячейки
      selectedCells.forEach(cell => {
        const key = `${cell.itemId}-${cell.costId}`;
        setEditingValues(prev => ({
          ...prev,
          [key]: sanitizedValue
        }));
      });
    } else {
      // Обновляем только текущую ячейку
      const key = `${itemId}-${costId}`;
      setEditingValues(prev => ({
        ...prev,
        [key]: sanitizedValue
      }));
    }
  };

  const handleInputBlur = (itemId: number, costId: number, value: string) => {
    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (selectedCells.some(cell => cell.itemId === itemId && cell.costId === costId)) {
      // Обновляем все выделенные ячейки
      const updatedItems = [...testItemsState];
      selectedCells.forEach(cell => {
        const itemIndex = updatedItems.findIndex(item => item.id === cell.itemId);
        if (itemIndex !== -1) {
          const costIndex = updatedItems[itemIndex].costs.findIndex(cost => cost.id === cell.costId);
          if (costIndex !== -1) {
            updatedItems[itemIndex].costs[costIndex].value = numericValue;
          }
        }
      });
      setTestItemsState(updatedItems);
    } else {
      // Обновляем только текущую ячейку
      setTestItemsState(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              costs: item.costs.map(cost => 
                cost.id === costId ? { ...cost, value: numericValue } : cost
              )
            };
          }
          return item;
        })
      );
    }
    setEditingValues({});
  };

  return (
    <table className="items-table">
      <thead>
        <tr>
          <th>Item Name</th>
          {['P1', 'P2', 'P3', 'P4', 'P5'].map((period, index) => (
            <th key={period} className={`header-cell ${frozenTestPeriods[index + 1] ? 'frozen' : ''}`}>
              {period}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {testItemsState.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            {[...item.costs].sort((a, b) => (a.id || 0) - (b.id || 0)).map((cost, index) => {
              const isSelected = selectedCells.some(cell => 
                cell.itemId === item.id! && 
                cell.costId === cost.id!
              );
              const isFrozen = frozenTestPeriods[index + 1];
              
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
                      value={editingValues[`${item.id!}-${cost.id}`] !== undefined 
                        ? editingValues[`${item.id!}-${cost.id}`] 
                        : cost.value?.toString() || ''}
                      onChange={(value) => handleInputChange(item.id!, cost.id!, value)}
                      onBlur={(value) => handleInputBlur(item.id!, cost.id!, value)}
                      disabled={isFrozen}
                      className="cost-input"
                    />
                  </div>
                </CellSelection>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  selectedItems,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
  frozenPeriods,
  onItemUpdate,
  onBulkCellChange
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

  const isCellSelected = (itemId: number, costId: number) => {
    // Проверяем выделение через selectedRange
    if (selectedRange) {
      return selectedRange.cells.some(
        (cell: {itemId: number, costId: number}) => 
          cell.itemId === itemId && cell.costId === costId
      );
    }
    
    // Проверяем выделение через selectedCells
    return selectedCells.some(cell => 
      cell.itemId === itemId && cell.costId === costId
    );
  };

  const isCellFrozen = (index: number) => {
    return frozenPeriods[index + 1];
  };

  const handleMouseDown = (itemId: number, costId: number, index: number, e: React.MouseEvent) => {
    if (e.button !== 0 || isCellFrozen(index)) return;
    
    const isSelected = selectedCells.some(cell => 
      cell.itemId === itemId && cell.costId === costId
    );

    if (isSelected) {
      setSelectedCells(selectedCells.filter(cell => 
        !(cell.itemId === itemId && cell.costId === costId)
      ));
    } else {
      setIsSelecting(true);
      setSelectionStart({ itemId, costId });
      setSelectedCells([...selectedCells, { itemId, costId }]);
    }
  };

  const handleMouseEnter = (itemId: number, costId: number, index: number) => {
    if (!isSelecting || !selectionStart || isCellFrozen(index)) return;

    const startItemIndex = itemsToDisplay.findIndex(item => item.id === selectionStart.itemId);
    const currentItemIndex = itemsToDisplay.findIndex(item => item.id === itemId);
    
    const startCostId = selectionStart.costId;
    const minItemIndex = Math.min(startItemIndex, currentItemIndex);
    const maxItemIndex = Math.max(startItemIndex, currentItemIndex);
    const minCostId = Math.min(startCostId, costId);
    const maxCostId = Math.max(startCostId, costId);

    const newSelection: CellPosition[] = [];
    for (let i = minItemIndex; i <= maxItemIndex; i++) {
      const item = itemsToDisplay[i];
      for (let j = minCostId; j <= maxCostId; j++) {
        if (!isCellFrozen(j - 1)) {
          newSelection.push({ itemId: item.id!, costId: j });
        }
      }
    }

    setSelectedCells(newSelection);
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

  const handleRangeSelect = (range: CellRange) => {
    setSelectedRange(range);
  };

  const handleBulkEdit = (value: string) => {
    if (selectedRange && onBulkCellChange) {
      onBulkCellChange(selectedRange.cells, value);
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