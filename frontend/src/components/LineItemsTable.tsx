import React, { SetStateAction, useState, useCallback, useEffect } from 'react';
import './LineItemsTable.css';
import ActionButtons from './ActionButtons';
import { cloneItem } from '../services/itemService';
import { cloneCategory } from '../services/categoryService';
import { periodService } from '../services/periodService';
import { Program, Item, Cost } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateLineItemInCostType, updateItemNameAsync, updateCategory, deleteCategoryAsync, fetchCostTypeByAliasAsync, fetchCategoryAsync, createLineItemAsync, deleteLineItemAsync, updateItemCostsAsync } from '../store/slices/costTypesSlice';
import CloneButton from './buttons/CloneButton';
import DeleteButton from './buttons/DeleteButton';
import { updateLineItemCosts, setLineItems as setLineItemsAction, removeItemFromSelection, setCategoryId } from '../store/slices/selectionSlice';
import { useLocation } from 'react-router-dom';


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
  handleLineItemUpdate: (updatedItem: Item) => void;
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
  handleLineItemUpdate,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isDirect = location.pathname === '/direct-costs';
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

  // Add local state for category
  const [currentCategory, setCurrentCategory] = useState<number | null>(selectedCategoryId);

  // Update local state when prop changes
  useEffect(() => {
    setCurrentCategory(selectedCategoryId);
  }, [selectedCategoryId]);

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
    if (!selectedCategoryId || !selectedProgramId || !selectedProjectId) {
      console.error('Missing required IDs for adding line item');
      return;
    }

    try {
      // Store current selections and category
      const currentSelectedItems = [...selectedLineItems];
      const currentCategoryId = selectedCategoryId;  // Store current category ID

      // Create new item
      const newItem: Partial<Item> = {
        name: 'New Line Item',
        costs: Array(13).fill({ value: 0 })
      };

      // Add to backend
      const response = await dispatch(createLineItemAsync({
        categoryId: currentCategoryId,  // Use stored category ID
        item: newItem,
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();

      // Update local state
      setLineItems(prevItems => [...prevItems, response.item]);

      // Fetch updated category data
      await dispatch(fetchCategoryAsync({
        categoryId: currentCategoryId,  // Use stored category ID
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();

      // Ensure category stays selected
      dispatch(setCategoryId(currentCategoryId));

      // Restore previous selections AND add the new item to selection
      dispatch(setLineItemsAction([...currentSelectedItems, response.item]));

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
        // Store current category and selections
        const currentCategoryId = selectedCategoryId;
        const currentSelectedItems = [...selectedLineItems];

        // Update name in backend
        const response = await dispatch(updateItemNameAsync({
          itemId,
          name: newName,
          programId: selectedProgramId,
          projectId: selectedProjectId,
          categoryId: currentCategoryId
        })).unwrap();

        const updatedName = response.item.name;

        // Update local state
        setLineItems(prevItems => 
          prevItems.map(item => item.id === itemId ? { ...item, name: updatedName } : item)
        );

        // Explicitly set category selection before any other updates
        dispatch(setCategoryId(currentCategoryId));

        // Update selected items while maintaining selection
        const updatedSelectedItems = currentSelectedItems.map(item =>
          item.id === itemId ? { ...item, name: updatedName } : item
        );
        dispatch(setLineItemsAction(updatedSelectedItems));

        // Clear editing state
        setEditingName(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });

      } catch (error) {
        console.error('Failed to update item name:', error);
        // Restore category selection in case of error
        dispatch(setCategoryId(selectedCategoryId));
      }
    }
  };

  const handleUpdateValue = async (itemId: number, costIndex: number, value: string) => {
    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for update');
      return;
    }

    const updatedItem = lineItems.find(item => item.id === itemId);
    if (!updatedItem) return;

    const updatedItemWithNewCost = {
      ...updatedItem,
      costs: updatedItem.costs.map((cost, index) =>
        index === costIndex ? { ...cost, value: numericValue } : cost
      )
    };

    try {
      // Update backend and local state
      await dispatch(updateItemCostsAsync({ 
        itemId, 
        updatedItem: { costs: updatedItemWithNewCost.costs },
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: selectedCategoryId
      })).unwrap();

      // Update local state
      setLineItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? updatedItemWithNewCost : item
        )
      );

      // Update selected items if needed
      if (selectedLineItems.some(item => item.id === itemId)) {
        handleLineItemUpdate(updatedItemWithNewCost);
      }
    } catch (error) {
      console.error('Failed to update item costs:', error);
    }
  };

  const handleRemoveLastLineItem = async () => {
    if (lineItems.length === 0 || !selectedProgramId || !selectedProjectId || !selectedCategoryId) return;

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

      setLineItems(prevItems => [...prevItems, clonedItem]);

      handleLineItemUpdate(clonedItem);

      if (selectedProgramId !== null && selectedProjectId !== null && selectedCategoryId !== null) {
        await dispatch(fetchCostTypeByAliasAsync(
          isDirect ? 'direct_costs' : 'indirect_costs'
        )).unwrap();
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

  const handleRemoveCategory = async () => {
    if (!selectedCategoryId || !selectedProgramId || !selectedProjectId) {
      console.error('Missing required IDs for removing category');
      return;
    }

    setIsCloningCategory(true);
    setCloneCategorySuccess(false);
    try {
      // Call the API to delete the category
      await dispatch(deleteCategoryAsync(selectedCategoryId)).unwrap();

      // Update Redux state
      dispatch(updateCategory({
        programId: selectedProgramId,
        projectId: selectedProjectId,
        category: { id: selectedCategoryId, name: '', items: [] } // Provide a valid empty category
      }));

      // Update data through fetchCostTypeByAliasAsync
      await dispatch(fetchCostTypeByAliasAsync(
        isDirect ? 'direct_costs' : 'indirect_costs'
      )).unwrap();

      setCloneCategorySuccess(true);
      setTimeout(() => setCloneCategorySuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsCloningCategory(false);
    }
  };

  const handleRemoveLineItem = async (itemId: number) => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for removing line item');
      return;
    }

    try {
      // Store current selections and category
      const currentSelectedItems = [...selectedLineItems].filter(item => item.id !== itemId);
      const currentCategoryId = selectedCategoryId;

      // Delete from backend
      await dispatch(deleteLineItemAsync({
        itemId,
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: currentCategoryId
      })).unwrap();

      // Update local state
      setLineItems(prevItems => prevItems.filter(item => item.id !== itemId));

      // Explicitly set category selection before fetching updated data
      dispatch(setCategoryId(currentCategoryId));

      // Fetch updated category data
      await dispatch(fetchCategoryAsync({
        categoryId: currentCategoryId,
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();

      // Ensure category stays selected and restore selections
      dispatch(setCategoryId(currentCategoryId));
      dispatch(setLineItemsAction(currentSelectedItems));

    } catch (error) {
      console.error('Failed to delete line item:', error);
      // Restore category selection in case of error
      dispatch(setCategoryId(selectedCategoryId));
    }
  };

  return (
    <div className="line-items-table">
      <div className="table-header">
        <h3 className="category-name">
          {categoryName}
          <CloneButton
            isCloning={isCloningCategory}
            cloneSuccess={cloneCategorySuccess}
            onClick={handleCloneCategory}
            title="Clone category"
          />
          <DeleteButton
            onClick={handleRemoveCategory}
            title="Delete category"
            disabled={isCloningCategory}
          />
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
                    <CloneButton
                      isCloning={cloningLineItems[item.id!]}
                      cloneSuccess={cloneLineItemSuccess[item.id!]}
                      onClick={() => handleCloneLineItem(item)}
                      title="Clone line item"
                    />
                    <DeleteButton
                      onClick={() => handleRemoveLineItem(item.id!)}
                      title="Delete line item"
                      disabled={cloningLineItems[item.id!]}
                    />
                  </td>
                </tr>
                <tr>
                  {item.costs.map((cost, costIndex) => (
                    <td key={costIndex} className="line-item-cell">
                      <input
                        type="text"
                        value={`${cost.value}$`}
                        onChange={(e) => handleUpdateValue(item.id!, costIndex, e.target.value)}
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
