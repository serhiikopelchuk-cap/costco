import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GenericList from '../common/GenericList';
import { selectCategories } from '../../store/selectors';
import { RootState, AppDispatch } from '../../store';
import { setCategoryId, setLineItems } from '../../store/slices/selectionSlice';
import { setSearch, setAddInputVisibility, setDetails } from '../../store/slices/uiSlice';
import { createCategoryAsync, fetchProjectAsync } from '../../store/slices/costTypesSlice';
import { Category } from '../../types/program';

const CategoryList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedCloudProviders = useSelector((state: RootState) => state.selection.selectedCloudProviders);
  const selectedCategoryId = useSelector((state: RootState) => state.selection.selectedCategoryId);
  const selectedProjectId = useSelector((state: RootState) => state.selection.selectedProjectId);
  const selectedProgramId = useSelector((state: RootState) => state.selection.selectedProgramId);
  const costType = useSelector((state: RootState) => state.selection.selectedCostType);

  // UI state from Redux
  const showAddCategoryInput = useSelector((state: RootState) => state.ui.addInputVisibility.category);
  const categorySearch = useSelector((state: RootState) => state.ui.search.category);

  // Add new selector to get current costType from store
  const currentCostType = useSelector((state: RootState) => state.costTypes.item);

  useEffect(() => {
    if (selectedProjectId && selectedProgramId) {
      dispatch(fetchProjectAsync({
        projectId: selectedProjectId,
        programId: selectedProgramId
      })).unwrap().catch(error => {
        console.error('Error fetching project:', error);
      });
    }
  }, [dispatch, selectedProjectId, selectedProgramId]);

  const filteredCategories = categories.filter(category => {
    if (selectedCloudProviders.length === 0) {
      return true;
    }

    if (!category.cloudProviders || category.cloudProviders.length === 0) {
      return true;
    }

    return category.cloudProviders.some(provider => 
      selectedCloudProviders.includes(provider.name)
    );
  });

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      dispatch(setCategoryId(null));
    } else {
      dispatch(setCategoryId(categoryId));
      dispatch(setDetails(null));
      dispatch(setLineItems([]));
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    if (!selectedProjectId || !selectedProgramId || !costType || !currentCostType) {
      console.error('Missing required data for category creation:', {
        selectedProjectId,
        selectedProgramId,
        costType,
        currentCostType
      });
      return;
    }

    const newCategory: Partial<Category> = { 
      name: categoryName, 
      items: [], 
      project: { id: selectedProjectId },
      costType: {
        id: currentCostType.id,
        name: currentCostType.name,
        alias: currentCostType.alias,
        programs: []
      }
    };

    try {
      console.log('Creating category with data:', {
        category: newCategory,
        programId: selectedProgramId,
        projectId: selectedProjectId,
        costType: currentCostType
      });

      const response = await dispatch(createCategoryAsync({ 
        category: newCategory,
        programId: selectedProgramId,
        projectId: selectedProjectId
      })).unwrap();

      console.log('Category created:', response);

      dispatch(setCategoryId(response.category.id));
      await dispatch(fetchProjectAsync({
        projectId: selectedProjectId,
        programId: selectedProgramId
      })).unwrap();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  return (
    <GenericList
      title="Categories"
      type="category"
      items={filteredCategories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
      selectedItemIds={selectedCategoryId ? [selectedCategoryId] : []}
      onItemToggle={handleCategoryToggle}
      onAddItem={handleAddCategory}
      itemSearch={categorySearch}
      setItemSearch={(value: string) => dispatch(setSearch({ type: 'category', value }))}
      showAddItemInput={showAddCategoryInput}
      setShowAddItemInput={(show) => dispatch(setAddInputVisibility({ type: 'category', value: show }))}
      renderItem={(category) => <span>{category.name}</span>}
      showDetailsButton={false}
    />
  );
};

export default CategoryList; 