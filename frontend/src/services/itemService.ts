import axios from 'axios';
import { Item } from './categoryService';

// Define the base URL for your API
// const API_BASE_URL = process.env.API_URL + '/items' || 'http://localhost:3000/items';
const API_BASE_URL = 'http://localhost:3000/items';

// Fetch all items
export const fetchItems = async (): Promise<Item[]> => {
  const response = await axios.get<Item[]>(API_BASE_URL);
  return response.data;
};

// Fetch a single item by ID
export const fetchItemById = async (id: number): Promise<Item> => {
  const response = await axios.get<Item>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Create a new item
export const createItem = async (item: Partial<Item>): Promise<Item> => {
  const response = await axios.post<Item>(API_BASE_URL, item);
  return response.data;
};

// Update an existing item
export const updateItem = async (id: number, item: Partial<Item>): Promise<Item> => {
  const response = await axios.put<Item>(`${API_BASE_URL}/${id}`, item);
  return response.data;
};

// Delete an item
export const deleteItem = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};

// Add this interface
export interface ClonedItemResponse {
  item: Item;
  categoryId: number;
  costIds: number[];
}

// Add this new function
export const cloneItem = async (id: number, categoryId?: number): Promise<ClonedItemResponse> => {
  const response = await axios.post<ClonedItemResponse>(
    `${API_BASE_URL}/${id}/clone`,
    categoryId ? { categoryId } : {}
  );
  return response.data;
}; 