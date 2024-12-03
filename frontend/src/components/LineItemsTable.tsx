import React, { useState, useEffect, useMemo } from 'react';
import './LineItemsTable.css';
import ActionButtons from './ActionButtons';
import { cloneItem } from '../services/itemService';
import { cloneCategory } from '../services/categoryService';
import { periodService } from '../services/periodService';
import { Program, Item, Cost } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateLineItemInCostType, updateItemNameAsync, updateCategory, deleteCategoryAsync, fetchCategoryAsync, createLineItemAsync, deleteLineItemAsync, updateItemCostsAsync, fetchProjectAsync, updateCategoryNameAsync } from '../store/slices/costTypesSlice';
import CloneButton from './buttons/CloneButton';
import DeleteButton from './buttons/DeleteButton';
import { setLineItems as setLineItemsAction, setCategoryId } from '../store/slices/selectionSlice';

interface LineItemsTableProps {
  onLineItemAdd: (newLineItem: Item) => void;
  onDeselectAll: () => void;
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
  cloudProviders,
  selectedProvider,
  onProviderChange,
  selectedProgramId,
  selectedProjectId,
  selectedCategoryId,
  handleLineItemUpdate,
}) => {
  const dispatch = useAppDispatch();

  // Get category name from Redux state
  const categoryName = useAppSelector(state => {
    const category = state.costTypes.item?.programs
      .flatMap(program => program.projects)
      .flatMap(project => project.categories)
      .find(category => category.id === selectedCategoryId);
    return category ? category.name : '';
  });

  const [editingCategoryName, setEditingCategoryName] = useState<string>(categoryName);

  useEffect(() => {
    setEditingCategoryName(categoryName);
  }, [categoryName]);

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingCategoryName(e.target.value);
  };

  const handleCategoryNameBlur = async () => {
    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for update');
      return;
    }

    try {
      // Update category name in backend
      await dispatch(updateCategoryNameAsync({
        categoryId: selectedCategoryId,
        name: editingCategoryName,
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();

      // Optionally, refetch the category or update the local state
      await dispatch(fetchCategoryAsync({
        categoryId: selectedCategoryId,
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();
    } catch (error) {
      console.error('Failed to update category name:', error);
    }
  };

  const columns = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'Total', 'Average'];
  const numberOfCosts = 13;

  // Calculate totals for each cost and overall
  const costTotals = Array(numberOfCosts).fill(0);
  let totalOfTotals = 0;

  // Get lineItems from Redux state
  const lineItems = useAppSelector(state => {
    const selectedCategoryId = state.selection.selectedCategoryId;
    const category = state.costTypes.item?.programs
      .flatMap(program => program.projects)
      .flatMap(project => project.categories)
      .find(category => category.id === selectedCategoryId);
    return category ? category.items : [];
  });

  // Get selectedLineItems from Redux state
  const selectedLineItems = useAppSelector(state => state.selection.selectedLineItems);

  // Use useMemo to determine which items to display
  const itemsToDisplay = useMemo(() => {
    return selectedLineItems.length > 0 ? selectedLineItems : lineItems;
  }, [selectedLineItems, lineItems]);

  // Calculate totals and averages
  itemsToDisplay.forEach(item => {
    if (!item.costs || !Array.isArray(item.costs)) {
      console.warn(`LineItem with id ${item.id} has no costs array.`);
      item.costs = Array(numberOfCosts).fill({ value: 0 });
    }
    
    // Sort costs once
    const sortedCosts = item.costs.slice().sort((a, b) => (a.id || 0) - (b.id || 0));
    
    sortedCosts.forEach((cost: Cost, index: number) => {
      costTotals[index] += Number(cost.value) || 0;
    });
    totalOfTotals += sortedCosts.reduce((sum: number, cost: Cost) => sum + (Number(cost.value) || 0), 0);
  });

  const averageOfAverages = itemsToDisplay.length > 0 ? totalOfTotals / (itemsToDisplay.length * numberOfCosts) : 0;

  const [errorMessages, setErrorMessages] = useState<{ [key: number]: string }>({});
  const [frozenPeriods, setFrozenPeriods] = useState<{ [key: number]: boolean }>({});
  const [editingName, setEditingName] = useState<{ [key: number]: string }>({});
  const [isCloningCategory, setIsCloningCategory] = useState(false);
  const [cloneCategorySuccess, setCloneCategorySuccess] = useState(false);
  const [cloningLineItems, setCloningLineItems] = useState<{ [key: number]: boolean }>({});
  const [cloneLineItemSuccess, setCloneLineItemSuccess] = useState<{ [key: number]: boolean }>({});
  const [currentCategory, setCurrentCategory] = useState<number | null>(selectedCategoryId);
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});

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

  const handleInputChange = (itemId: number, costId: number, value: string) => {
    const key = `${itemId}-${costId}`;
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputBlur = (itemId: number, costId: number, value: string) => {
    const key = `${itemId}-${costId}`;
    // Clear editing state
    setEditingValues(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    // Update value
    handleUpdateValue(itemId, costId, value);
  };

  const handleUpdateValue = async (itemId: number, costId: number, value: string) => {
    const numericValue = parseFloat(value.replace(/\$/g, '')) || 0;

    if (!selectedProgramId || !selectedProjectId || !selectedCategoryId) {
      console.error('Missing required IDs for update');
      return;
    }

    // Find the item from the full list of items
    const updatedItem = lineItems.find(item => item.id === itemId);
    if (!updatedItem) return;

    const updatedItemWithNewCost = {
      ...updatedItem,
      costs: updatedItem.costs.map((cost) =>
        cost.id === costId ? { ...cost, value: numericValue } : cost
      )
    };

    try {
      // Set loading state for the specific cost item
      const loadingKey = `${itemId}-${costId}`;
      setLoadingItems(prev => ({ ...prev, [loadingKey]: true }));

      // Store current category ID
      const currentCategoryId = selectedCategoryId;

      // Update in backend
      const response = await dispatch(updateItemCostsAsync({ 
        itemId, 
        updatedItem: { costs: updatedItemWithNewCost.costs },
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: currentCategoryId
      })).unwrap();

      console.log('Update response:', response);

      // Update the cost type state directly
      dispatch(updateLineItemInCostType({
        programId: selectedProgramId,
        projectId: selectedProjectId,
        categoryId: currentCategoryId,
        lineItem: updatedItemWithNewCost
      }));

      // Ensure category stays selected
      dispatch(setCategoryId(currentCategoryId));

      // Update selected items while maintaining selection
      const updatedSelectedItems = selectedLineItems.map(item =>
        item.id === itemId ? updatedItemWithNewCost : item
      );
      dispatch(setLineItemsAction(updatedSelectedItems));

    } catch (error) {
      console.error('Failed to update item costs:', error);
    } finally {
      // Clear loading state for the specific cost item
      const loadingKey = `${itemId}-${costId}`;
      setLoadingItems(prev => ({ ...prev, [loadingKey]: false }));
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
    dispatch(setLineItemsAction([]));
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

      handleLineItemUpdate(clonedItem);

      if (selectedProgramId !== null && selectedProjectId !== null && selectedCategoryId !== null) {
        await dispatch(fetchCategoryAsync({
          categoryId: selectedCategoryId,
          programId: selectedProgramId,
          projectId: selectedProjectId
        })).unwrap();
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

        // Refetch only the current project
        await dispatch(fetchProjectAsync({
          projectId: selectedProjectId,
          programId: selectedProgramId
        })).unwrap();
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

      // Refetch only the current project
      await dispatch(fetchProjectAsync({
        projectId: selectedProjectId,
        programId: selectedProgramId
      })).unwrap();

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
          <input
            type="text"
            value={editingCategoryName}
            onChange={handleCategoryNameChange}
            onBlur={handleCategoryNameBlur}
            className="category-name-input"
          />
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
          {itemsToDisplay.map((item) => {
            const itemTotal = item.costs.reduce((sum: number, cost: Cost) => {
              return sum + (Number(cost.value) || 0);
            }, 0);
            
            const itemAverage = itemTotal / numberOfCosts;

            // Use sorted costs for rendering
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
                  {sortedCosts.map((cost, index) => {
                    const loadingKey = `${item.id!}-${cost.id}`;
                    return (
                      <td key={cost.id} className="line-item-cell">
                        <div className="input-container">
                          <input
                            type="text"
                            value={
                              editingValues[loadingKey] !== undefined
                                ? editingValues[loadingKey]
                                : `${cost.value}$`
                            }
                            onChange={(e) => handleInputChange(item.id!, cost.id!, e.target.value)}
                            onBlur={(e) => handleInputBlur(item.id!, cost.id!, e.target.value)}
                            className="cost-input"
                            disabled={frozenPeriods[index + 1] || loadingItems[loadingKey]}
                          />
                          {loadingItems[loadingKey] && <span className="spinner"></span>}
                        </div>
                      </td>
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
    </div>
  );
}

export default LineItemsTable;
