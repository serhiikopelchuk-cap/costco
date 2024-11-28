import React, { useState, useEffect } from 'react';
import './DirectCostOld.css';
import AddCategoryForm from '../components/AddCategoryForm';
import CostItemRow from '../components/CostItemRow';
import CategoryHeader from '../components/CategoryHeader';
import NoteEditor from '../components/common/NoteEditor';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { createItem, updateItem, deleteItem } from '../services/itemService';
import { Category, Cost, Item } from '../types/program';

const DirectCostOld: React.FC = () => {
  const [data, setData] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    costs: Array(13).fill({ value: 0 }),
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, name: e.target.value });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        setData(categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const addCategory = async (newCategory: Partial<Category>) => {
    try {
      if (!newCategory.name) {
        throw new Error('Category name is required');
      }
      const createdCategory = await createCategory(newCategory as Category);
      setData([...data, createdCategory]);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleCategorySave = async (index: number, updatedCategory: Partial<Category>) => {
    try {
      const category = data[index];
      const updated = await updateCategory(category.id!, updatedCategory);
      const updatedData = [...data];
      updatedData[index] = updated;
      setData(updatedData);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleCategoryDelete = async (categoryIndex: number) => {
    try {
      const category = data[categoryIndex];
      await deleteCategory(category.id!);
      const updatedData = [...data];
      updatedData.splice(categoryIndex, 1);
      setData(updatedData);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedCosts = [...newItem!.costs!];
    updatedCosts[index] = { value: parseFloat(e.target.value) || 0 };
    setNewItem({ ...newItem, costs: updatedCosts });
  };

  const addItem = async (categoryIndex: number) => {
    try {
      const category = data[categoryIndex];
      // const createdItem = await createItem({ ...newItem, category });
      const updatedData = [...data];
      // updatedData[categoryIndex].items.push(createdItem);
      setData(updatedData);
      setNewItem({ name: '', costs: Array(13).fill({ value: 0 }) });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleSave = async (categoryIndex: number, itemIndex: number, updatedItem: Partial<Item>) => {
    try {
      const item = data[categoryIndex].items[itemIndex];
      const updated = await updateItem(item.id!, updatedItem);
      const updatedData = [...data];
      // updatedData[categoryIndex].items[itemIndex] = updated;
      setData(updatedData);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async (categoryIndex: number, itemIndex: number) => {
    try {
      const item = data[categoryIndex].items[itemIndex];
      await deleteItem(item.id!);
      const updatedData = [...data];
      updatedData[categoryIndex].items.splice(itemIndex, 1);
      setData(updatedData);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div className="container">
      <h1>Annual Direct Cost</h1>
      {data.map((category, categoryIndex) => (
        <div key={categoryIndex} className="category">
          {/* <CategoryHeader
            name={category.name}
            description={category.description}
            onSave={(updatedCategory) => handleCategorySave(categoryIndex, updatedCategory)}
            onDelete={() => handleCategoryDelete(categoryIndex)}
          /> */}
          <table>
            <thead>
              <tr className="note-row">
                <th colSpan={15} className="note">
                  {/* <NoteEditor
                    initialNote={category.note}
                    onSave={(newNote) => handleCategorySave(categoryIndex, { note: newNote })}
                  /> */}
                </th>
              </tr>
              <tr>
                <th>Period totals:</th>
                {Array.from({ length: 13 }, (_, i) => <th key={i}>P{i + 1}</th>)}
                <th>Total</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {category.items.map((item, itemIndex) => (
                <CostItemRow
                  key={itemIndex}
                  item={item}
                  onSave={(updatedItem) => handleSave(categoryIndex, itemIndex, updatedItem)}
                  onDelete={() => handleDelete(categoryIndex, itemIndex)}
                />
              ))}
              <tr>
                <td>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={handleNameChange}
                    placeholder="New Item Name"
                  />
                </td>
                {newItem.costs?.map((cost, i) => (
                  <td key={i}>
                    <input
                      type="number"
                      value={cost.value}
                      onChange={(e) => handleInputChange(e, i)}
                      placeholder="0"
                    />
                  </td>
                ))}
                <td>${newItem?.costs!.reduce((acc: number, cost: Cost) => acc + cost.value, 0)}</td>
                <td>${(newItem?.costs!.reduce((acc: number, cost: Cost) => acc + cost.value, 0) / newItem!.costs!.length).toFixed(2)}</td>
                <td>
                  <button className="add-button" onClick={() => addItem(categoryIndex)}>Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      <AddCategoryForm onAddCategory={addCategory} />
    </div>
  );
};

export default DirectCostOld;