import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Category } from '../../types/program';
import { setSearch, setAddInputVisibility } from '../../store/slices/uiSlice';
import { createCategoryAsync, fetchProgramsAsync } from '../../store/slices/programsSlice';

type CategoryListProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryToggle: (categoryId: number) => void;
  categorySearch: string;
  showAddCategoryInput: boolean;
  selectedProgramId: number | null;
  selectedProjectId: number | null;
};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onCategoryToggle,
  categorySearch,
  showAddCategoryInput,
  selectedProgramId,
  selectedProjectId
}) => {
  const dispatch = useAppDispatch();

  const handleSearchChange = (value: string) => {
    dispatch(setSearch({ type: 'category', value }));
  };

  const handleAddInputVisibility = (value: boolean) => {
    dispatch(setAddInputVisibility({ type: 'category', value }));
  };

  const handleAddCategory = async (categoryName: string) => {
    if (selectedProjectId) {
      const newCategory: Partial<Category> = { name: categoryName, items: [], project: { id: selectedProjectId } };
      await dispatch(createCategoryAsync({ category: newCategory }));
      await dispatch(fetchProgramsAsync());
    }
  };

  const filteredCategories = React.useMemo(() => {
    console.log('Categories in component:', categories);
    return categories.filter(category => 
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

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
          onClick={() => onCategoryToggle(category.id)}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default CategoryList; 