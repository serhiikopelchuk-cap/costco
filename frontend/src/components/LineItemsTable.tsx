import React, { SetStateAction, useState, useCallback, useEffect } from 'react';
import './LineItemsTable.css';
import { validateCellValue } from '../utils/validationUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faClone, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import ActionButtons from './ActionButtons';
import { cloneItem } from '../services/itemService';
import { cloneCategory } from '../services/categoryService';
import { periodService } from '../services/periodService';
import { Program, Item, Cost } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateLineItem, updateItemCostsAsync, createLineItemAsync, deleteLineItemAsync, updateItemNameAsync, updateCategory } from '../store/slices/programsSlice';

interface LineItemsTableProps {
  lineItems: Item[];
  setLineItems: (newLineItems: SetStateAction<Item[]>) => void;
  onLineItemAdd: (newLineItem: Item) => void;
  onDeselectAll: () => void;
  selectedLineItems: Item[];
  categoryName: string;
  cloudProviders: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  tableData: Program[];
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedCategoryId: number | null;
}

const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems = [],
  setLineItems,
  onLineItemAdd,
  onDeselectAll,
  selectedLineItems,
  // categoryName,
  cloudProviders,
  selectedProvider,
  onProviderChange,
  tableData,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
}) => {
  const dispatch = useAppDispatch();
  const programsState = useAppSelector(state => state.programs);
  const categoryName = tableData
    .find(program => program.id === selectedProgramId)
    ?.projects.find(project => project.id === selectedProjectId)
    ?.categories.find(category => category.id === selectedCategoryId)
    ?.name ?? '';
  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfCosts = 13;

  // Calculate totals for each cost and overall
  const costTotals = Array(numberOfCosts).fill(0);
  let totalOfTotals = 0;

  (lineItems || []).forEach(item => {
    if (!item.costs || !Array.isArray(item.costs)) {
      console.warn(`LineItem with id ${item.id} has no costs array.`);
      item.costs = Array(numberOfCosts).fill({ value: 0 });
    }
    item.costs.forEach((cost: Cost, index: number) => {
      costTotals[index] += Number(cost.value) || 0;
    });
    totalOfTotals += item.costs.reduce((sum: number, cost: Cost) => sum + (Number(cost.value) || 0), 0);
  });

  const averageOfAverages = lineItems.length > 0 ? totalOfTotals / (lineItems.length * numberOfCosts) : 0;

  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});
  const [frozenPeriods, setFrozenPeriods] = useState<{ [key: number]: boolean }>({});
  const [editingName, setEditingName] = useState<{ [key: number]: string }>({});
  const [isCloningCategory, setIsCloningCategory] = useState(false);
  const [cloneCategorySuccess, setCloneCategorySuccess] = useState(false);
  const [cloningLineItems, setCloningLineItems] = useState<{ [key: number]: boolean }>({});
  const [cloneLineItemSuccess, setCloneLineItemSuccess] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadFrozenPeriods = async () => {
      const periods = await periodService.getAllPeriods();
      const frozenStatus = periods.reduce((acc, period) => ({
        ...acc,
        [period.number]: period.isFrozen
      }), {});
      setFrozenPeriods(frozenStatus);
    };

    loadFrozenPeriods();
  }, []);

  const handleAddLineItem = async () => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for adding line item');
      return;
    }

    try {
      const newItem: Partial<Item> = {
        name: 'New Line Item',
        costs: Array(13).fill({ value: 0 })
      };

      await dispatch(createLineItemAsync({
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: selectedCategoryId,
        item: newItem
      })).unwrap();
    } catch (error) {
      console.error('Failed to create line item:', error);
    }
  };

  const handleNameChange = (itemId: number, value: string) => {
    setEditingName(prev => ({ ...prev, [itemId]: value }));
  };

  const handleNameBlur = async (itemId: number) => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for update');
      return;
    }

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

        const updatedName = response.item.name;

        // Update local state
        setLineItems(prevItems => 
          prevItems.map(item => item.id === itemId ? { ...item, name: updatedName } : item)
        );

        // Update Redux state
        dispatch(updateLineItem({
          programId: selectedProgramId,
          projectId: selectedProjectId,
          categoryId: selectedCategoryId,
          lineItem: { ...response.item, name: updatedName }
        }));

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

  const handleUpdateValue = async (itemId: number, field: string, value: string, costIndex?: number) => {
    const currentItem = lineItems.find(item => item.id === itemId);
    if (!currentItem) return;

    // First update local state for immediate UI feedback
    if (field === 'cost' && costIndex !== undefined) {
      const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;
      const newCosts = [...currentItem.costs];
      newCosts[costIndex] = {
        ...newCosts[costIndex],
        value: numericValue
      };

        const updatedItem = {
          ...currentItem,
          costs: newCosts
        };

      // Update local state immediately
      setLineItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );

      // Then update backend if we have all required IDs
      if (selectedProgramId && selectedProjectId && selectedCategoryId) {
        try {
          await dispatch(updateItemCostsAsync({
            itemId,
            updatedItem,
            programId: selectedProgramId,
            projectId: selectedProjectId,
            categoryId: selectedCategoryId
          })).unwrap();
        } catch (error) {
          console.error('Failed to update item costs:', error);
          // Optionally revert the local state on error
        }
      }
    }
  };

  const handleRemoveLastLineItem = async () => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for removing line item');
      return;
    }

    if (lineItems.length === 0) return;

    const lastItem = lineItems[lineItems.length - 1];
    try {
      await dispatch(deleteLineItemAsync({
        itemId: lastItem.id!,
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: selectedCategoryId
      })).unwrap();
    } catch (error) {
      console.error('Failed to delete line item:', error);
    }
  };

  const handleDeselectAll = () => {
    onDeselectAll();
  };

  const handleCloneLineItem = async (item: Item) => {
    console.log('Cloning line item:', item);
    setCloningLineItems(prev => ({ ...prev, [item.id!]: true }));
    setCloneLineItemSuccess(prev => ({ ...prev, [item.id!]: false }));
    try {
      const response = await cloneItem(item.id!, selectedCategoryId || undefined);
      console.log('Response:', response);
      const clonedItem: Item = {
        id: response.item.id,
        name: response.item.name,
        costs: response.item.costs,
      };

      // Update local state
      setLineItems(prevItems => [...prevItems, clonedItem]);

      // Ensure IDs are not null before dispatching
      if (selectedProgramId !== null && selectedProjectId !== null && selectedCategoryId !== null) {
        // Dispatch an action to update Redux
        dispatch(updateLineItem({
          programId: selectedProgramId,
          projectId: selectedProjectId,
          categoryId: selectedCategoryId,
          lineItem: clonedItem
        }));
      } else {
        console.error('Cannot update Redux: Missing required IDs');
      }

      setCloneLineItemSuccess(prev => ({ ...prev, [item.id!]: true }));
      setTimeout(() => setCloneLineItemSuccess(prev => ({ ...prev, [item.id!]: false })), 3000);
    } catch (error) {
      console.error('Error cloning line item:', error);
    } finally {
      setCloningLineItems(prev => ({ ...prev, [item.id!]: false }));
    }
  };

  const handleCloneCategory = async () => {
    if (!selectedCategoryId) return;

    setIsCloningCategory(true);
    setCloneCategorySuccess(false);
    try {
      const clonedCategory = await cloneCategory(selectedCategoryId, selectedProjectId || undefined);
      console.log('Category cloned successfully:', clonedCategory);

      // Dispatch an action to update Redux
      if (selectedProgramId !== null && selectedProjectId !== null) {
        dispatch(updateCategory({
          programId: selectedProgramId,
          projectId: selectedProjectId,
          category: clonedCategory
        }));
      } else {
        console.error('Cannot update Redux: Missing required IDs');
      }

      setCloneCategorySuccess(true);
      setTimeout(() => setCloneCategorySuccess(false), 3000);
    } catch (error) {
      console.error('Error cloning category:', error);
    } finally {
      setIsCloningCategory(false);
    }
  };

  return (
    <div className="line-items-table">
      <div className="table-header">
        <h3 className="category-name">
          {categoryName}
          <button 
            className={`clone-button category-clone ${isCloningCategory ? 'cloning' : ''} ${cloneCategorySuccess ? 'success' : ''}`}
            onClick={handleCloneCategory}
            title="Clone category"
            disabled={isCloningCategory}
          >
            <FontAwesomeIcon 
              icon={isCloningCategory ? faSpinner : cloneCategorySuccess ? faCheck : faClone} 
              className={isCloningCategory ? 'fa-spin' : ''}
            />
          </button>
        </h3>
        <ActionButtons
          handleDeselectAll={handleDeselectAll}
          handleAddLineItem={handleAddLineItem}
          selectedLineItemsCount={selectedLineItems.length}
          cloudProviders={cloudProviders}
          selectedProvider={selectedProvider}
          onProviderChange={onProviderChange}
          selectedProgramId={selectedProgramId}
          selectedProjectId={selectedProjectId}
          selectedCategoryId={selectedCategoryId}
          lineItems={lineItems}
        />
      </div>
      <table className="line-items-table">
        <thead>
          <tr className="header-row">
            {columns.map((col, index) => (
              <th key={index} className="header-cell">
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
          {lineItems.map((item) => {
            const itemTotal = item.costs.reduce((sum: number, cost: Cost) => {
              return sum + (Number(cost.value) || 0);
            }, 0);
            
            const itemAverage = itemTotal / numberOfCosts;

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
                    <button 
                      className={`clone-button ${cloningLineItems[item.id!] ? 'cloning' : ''} ${cloneLineItemSuccess[item.id!] ? 'success' : ''}`}
                      onClick={() => handleCloneLineItem(item)}
                      title="Clone line item"
                      disabled={cloningLineItems[item.id!]}
                    >
                      <FontAwesomeIcon 
                        icon={cloningLineItems[item.id!] ? faSpinner : cloneLineItemSuccess[item.id!] ? faCheck : faClone} 
                        className={cloningLineItems[item.id!] ? 'fa-spin' : ''}
                      />
                    </button>
                  </td>
                </tr>
                <tr>
                  {item.costs.map((cost, costIndex) => (
                    <td key={costIndex} className="line-item-cell">
                      <input
                        type="text"
                        value={`${cost.value}$`}
                        onChange={(e) => handleUpdateValue(item.id!, 'cost', e.target.value, costIndex)}
                        className="cost-input"
                        disabled={frozenPeriods[costIndex + 1]}
                      />
                    </td>
                  ))}
                  <td className="line-item-cell">{Number(itemTotal).toFixed(2)}$</td>
                  <td className="line-item-cell">{Number(itemAverage).toFixed(2)}$</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LineItemsTable;
