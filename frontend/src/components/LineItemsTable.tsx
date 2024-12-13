import React, { useState, useEffect, useMemo } from 'react';
import './LineItemsTable.css';
import ActionButtons from './ActionButtons';
import { cloneCategory, updateCategory as updateCategoryService } from '../services/categoryService';
import { periodService } from '../services/periodService';
import { Program, Item, Cost, Category } from '../types/program';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateCategory, deleteCategoryAsync, fetchCategoryAsync, createLineItemAsync, deleteLineItemAsync, updateItemCostsAsync, fetchProjectAsync, updateCategoryNameAsync, updateLineItemInCostType } from '../store/slices/costTypesSlice';
import CloneButton from './buttons/CloneButton';
import DeleteButton from './buttons/DeleteButton';
import { setLineItems as setLineItemsAction, setCategoryId } from '../store/slices/selectionSlice';
import CloudProviderChips from './common/CloudProviderChips';
import { RootState } from '../store';
import { ItemsTable } from './tables/items';

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
  const programs = useAppSelector((state: RootState) => state.costTypes.item?.programs || []);
  
  // Find the selected category by traversing programs and projects
  const selectedCategory = programs
    .flatMap(program => program.projects)
    .flatMap(project => project.categories)
    .find((category: Category) => category.id === selectedCategoryId);

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

  const [frozenPeriods, setFrozenPeriods] = useState<{ [key: number]: boolean }>({
    1: true, // Default to frozen
    2: true, // Default to frozen
  });
  const [isCloningCategory, setIsCloningCategory] = useState(false);
  const [cloneCategorySuccess, setCloneCategorySuccess] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<number | null>(selectedCategoryId);

  useEffect(() => {
    setCurrentCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    const loadFrozenPeriods = async () => {
      const periods = await periodService.getAllPeriods();
      if (periods.length > 0) {
        const frozenStatus = periods.reduce((acc, period) => ({
          ...acc,
          [period.number]: period.isFrozen
        }), {});
        setFrozenPeriods(frozenStatus);
      }
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

  const handleDeselectAll = () => {
    dispatch(setLineItemsAction([]));
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

  const handleItemUpdate = (updatedItem: Item) => {
    console.log('LineItemsTable - handleItemUpdate:', updatedItem);
    
    // Update local state
    dispatch(updateLineItemInCostType({
      programId: selectedProgramId!,
      projectId: selectedProjectId!,
      categoryId: selectedCategoryId!,
      lineItem: updatedItem
    }));

    // Update selected items if needed
    if (selectedLineItems.some(item => item.id === updatedItem.id)) {
      const updatedSelectedItems = selectedLineItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      dispatch(setLineItemsAction(updatedSelectedItems));
    }

    handleLineItemUpdate(updatedItem);
  };

  // Define available providers with IDs
  const availableProviders = [
    { id: 1, name: 'Azure' },
    { id: 2, name: 'GCP' }
  ];

  const handleProviderAdd = async (providerName: string) => {
    if (!selectedCategory || !selectedProgramId || !selectedProjectId) return;

    try {
      // Find provider by name to get its ID
      const provider = availableProviders.find(p => p.name === providerName);
      if (!provider) return;

      const updatedProviders = [
        ...(selectedCategory.cloudProviders || []),
        { id: provider.id, name: provider.name }
      ];

      // Update on backend first
      await updateCategoryService(selectedCategory.id, {
        cloudProviders: updatedProviders
      });

      // Then update Redux store
      dispatch(updateCategory({
        programId: selectedProgramId,
        projectId: selectedProjectId,
        category: {
          ...selectedCategory,
          cloudProviders: updatedProviders
        }
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleProviderRemove = async (providerName: string) => {
    if (!selectedCategory || !selectedProgramId || !selectedProjectId) return;

    try {
      const updatedProviders = selectedCategory.cloudProviders?.filter(
        p => p.name !== providerName
      ) || [];

      // Update on backend first
      await updateCategoryService(selectedCategory.id, {
        cloudProviders: updatedProviders
      });

      // Then update Redux store
      dispatch(updateCategory({
        programId: selectedProgramId,
        projectId: selectedProjectId,
        category: {
          ...selectedCategory,
          cloudProviders: updatedProviders
        }
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  return (
    <div className="line-items-table">
      <div className="table-header">
        <h3 className="category-name">
          {selectedCategory && selectedProgramId && selectedProjectId && (
            <CloudProviderChips
              availableProviders={availableProviders.map(p => p.name)} // Pass only names to keep interface simple
              selectedProviders={selectedCategory.cloudProviders || []}
              onProviderAdd={handleProviderAdd}
              onProviderRemove={handleProviderRemove}
            />
          )}
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

        <div className="action-buttons-container">
          
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
      </div>
      <ItemsTable
        items={lineItems}
        selectedItems={selectedLineItems}
        selectedProgramId={selectedProgramId}
        selectedProjectId={selectedProjectId}
        selectedCategoryId={selectedCategoryId}
        frozenPeriods={frozenPeriods}
        onItemUpdate={handleItemUpdate}
      />
    </div>
  );
}

export default LineItemsTable;
