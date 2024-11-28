import React, { useState } from 'react';
import './AddCategoryForm.css';
import { Category } from '../types/program';

interface AddCategoryFormProps {
  onAddCategory: (category: Partial<Category>) => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAddCategory }) => {
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    note: '',
    items: [],
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const addCategory = () => {
    onAddCategory(newCategory);
    setNewCategory({ name: '', description: '', note: '', items: [] });
  };

  return (
    <div className="add-category">
      <h2>Add New Category</h2>
      <input
        type="text"
        name="name"
        value={newCategory.name}
        onChange={handleCategoryChange}
        placeholder="Category Name"
        className="input-field"
      />
      <input
        type="text"
        name="description"
        value={newCategory.description}
        onChange={handleCategoryChange}
        placeholder="Description"
        className="input-field"
      />
      <input
        type="text"
        name="note"
        value={newCategory.note}
        onChange={handleCategoryChange}
        placeholder="Note"
        className="input-field"
      />
      <button onClick={addCategory} className="add-button">Add Category</button>
    </div>
  );
};

export default AddCategoryForm; 