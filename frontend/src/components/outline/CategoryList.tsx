import React from 'react';
import SearchInput from '../SearchInput';
import AddItemInput from '../AddItemInput';
import { Category } from '../../services/programService';

type CategoryListProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryToggle: (categoryId: number) => void;
  onAddCategory: (categoryName: string) => void;
  categorySearch: string;
  setCategorySearch: (search: string) => void;
  showAddCategoryInput: boolean;
  setShowAddCategoryInput: (show: boolean) => void;
};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onCategoryToggle,
  onAddCategory,
  categorySearch,
  setCategorySearch,
  showAddCategoryInput,
  setShowAddCategoryInput
}) => (
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
    {categories.map(category => (
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

export default CategoryList; 