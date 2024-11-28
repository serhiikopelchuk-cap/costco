import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Category } from '../types/program';

// Define the base URL for your API
const CATEGORIES_URL = `${API_BASE_URL}/categories`;

// Define the types for Category, Item, and Cost
// export interface Cost {
//   id?: number;
//   value: number;
// }

// export interface Item {
//   id?: number;
//   name: string;
//   category: Category;
//   costs: Cost[];
// }

// export interface Category {
//   id?: number;
//   name: string;
//   description: string;
//   note: string;
//   items: Item[];
// }

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get<Category[]>(CATEGORIES_URL);
  return response.data;
};

// Fetch a single category by ID
export const fetchCategoryById = async (id: number): Promise<Category> => {
  const response = await axios.get<Category>(`${CATEGORIES_URL}/${id}`);
  return response.data;
};

// Create a new category
export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const response = await axios.post<Category>(CATEGORIES_URL, category);
  return response.data;
};

// Update an existing category
export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  const response = await axios.put<Category>(`${CATEGORIES_URL}/${id}`, category);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`${CATEGORIES_URL}/${id}`);
};

// Add this function to categoryService.ts
export const cloneCategory = async (categoryId: number, projectId?: number): Promise<Category> => {
  const response = await axios.post<Category>(`${API_BASE_URL}/categories/${categoryId}/clone`, { projectId });
  return response.data;
}; 