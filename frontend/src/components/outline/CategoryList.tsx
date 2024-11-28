import React from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import SearchInput from '../common/SearchInput';
import AddItemInput from '../AddItemInput';
import { Category } from '../../types/program';
import { selectCategories } from '../../store/selectors';

type CategoryListProps = {
  selectedCategoryId: number | null;
  onCategoryToggle: (categoryId: number) => void;
  onAddCategory: (categoryName: string) => void;
  categorySearch: string;
  setCategorySearch: (search: string) => void;
  showAddCategoryInput: boolean;
  setShowAddCategoryInput: (show: boolean) => void;
  categories: Category[];
};

const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategoryId,
  onCategoryToggle,
  onAddCategory,
  categorySearch,
  setCategorySearch,
  showAddCategoryInput,
  setShowAddCategoryInput,
  categories
}) => {
  // const categories = useAppSelector(selectCategories);

  console.log('Categories:', categories);

  return (
    <div className="column minified">
      <div className="header-with-button">
        <h3>Categories</h3>
        <button
          className={`add-toggle-button ${showAddCategoryInput ? 'active' : ''}`}
          onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
        >
          {showAddCategoryInput ? '×' : '+'}
        </button>
      </div>
      <SearchInput
        placeholder="Search Categories"
        value={categorySearch}
        onChange={setCategorySearch}
      />
      {showAddCategoryInput && <AddItemInput onAdd={onAddCategory} />}
      {categories.map((category: Category) => (
        <div
          key={category.id}
          className={`category-item ${selectedCategoryId === category.id ? 'selected' : ''}`}
          onClick={() => category.id && onCategoryToggle(category.id)}
        >
          <span>{category.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryList; 