import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Category } from '../../types/program';
import { setSearch, setAddInputVisibility } from '../../store/slices/uiSlice';
import { setCategoryId } from '../../store/slices/selectionSlice';
import { createCategoryAsync, fetchCostTypeByAliasAsync } from '../../store/slices/costTypesSlice';
import { useLocation } from 'react-router-dom';

type CategoryListProps = {
  selectedCategoryId: number | null;
  onCategoryToggle: (categoryId: number) => void;
  categorySearch: string;
  showAddCategoryInput: boolean;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
  selectedProvider: string;
};

const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategoryId,
  onCategoryToggle,
  categorySearch,
  showAddCategoryInput,
  selectedProgramId,
  selectedProjectId,
  selectedProvider
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isDirect = location.pathname === '/direct-costs';

  const categories = useAppSelector(state => {
    const project = state.costTypes.item?.programs
      .flatMap(program => program.projects)
      .find(p => p.id === selectedProjectId);
    return project ? project.categories : [];
  });

  const handleSearchChange = (value: string) => {
    dispatch(setSearch({ type: 'category', value }));
  };

  const handleAddInputVisibility = (value: boolean) => {
    dispatch(setAddInputVisibility({ type: 'category', value }));
  };

  const handleAddCategory = async (categoryName: string) => {
    if (selectedProjectId && selectedProgramId) {
      const newCategory: Partial<Category> = { 
        name: categoryName, 
        items: [], 
        project: { id: selectedProjectId } 
      };

      try {
        const response = await dispatch(createCategoryAsync({ 
          category: newCategory,
          programId: selectedProgramId,
          projectId: selectedProjectId
        })).unwrap();

        dispatch(setCategoryId(response.category.id));

        await dispatch(fetchCostTypeByAliasAsync(
          isDirect ? 'direct_costs' : 'indirect_costs'
        )).unwrap();
      } catch (error) {
        console.error('Failed to create category:', error);
      }
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    onCategoryToggle(categoryId);
  };

  const filteredCategories = React.useMemo(() => {
    return categories
      .filter(category => 
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
      .filter(category => {
        if (!selectedProvider) return true;
        return category.cloudProvider?.includes(selectedProvider);
      });
  }, [categories, categorySearch, selectedProvider]);

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Categories</h3>
        <button
          className={`add-toggle-button ${showAddCategoryInput ? 'active' : ''}`}
          onClick={() => handleAddInputVisibility(!showAddCategoryInput)}
        >
          {showAddCategoryInput ? '×' : '+'}
        </button>
      </div>
      <SearchInput
        placeholder="Search Categories"
        value={categorySearch}
        onChange={handleSearchChange}
      />
      {showAddCategoryInput && <AddItemInput onAdd={handleAddCategory} />}
      {filteredCategories.map(category => (
        <div
          key={category.id}
          className={`category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default CategoryList; 