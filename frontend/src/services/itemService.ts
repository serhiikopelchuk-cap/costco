import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Item } from '../types/program';

// Define the base URL for your API
const ITEMS_URL = `${API_BASE_URL}/items`;

// Fetch all items
export const fetchItems = async (): Promise<Item[]> => {
  const response = await axios.get<Item[]>(ITEMS_URL);
  return response.data;
};

// Fetch a single item by ID
export const fetchItemById = async (id: number): Promise<Item> => {
  const response = await axios.get<Item>(`${ITEMS_URL}/${id}`);
  return response.data;
};

// Create a new item
export const createItem = async (item: Partial<Item>): Promise<Item> => {
  const response = await axios.post<Item>(ITEMS_URL, item);
  return response.data;
};

// Update an existing item
export const updateItem = async (id: number, item: Partial<Item>): Promise<Item> => {
  const response = await axios.put<Item>(`${ITEMS_URL}/${id}`, item);
  return response.data;
};

// Delete an item
export const deleteItem = async (id: number): Promise<void> => {
  await axios.delete(`${ITEMS_URL}/${id}`);
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
    `${ITEMS_URL}/${id}/clone`,
    categoryId ? { categoryId } : {}
  );
  return response.data;
};

export const updateItemCosts = async (itemId: number, updatedItem: Partial<Item>): Promise<Item> => {
  const response = await axios.put<Item>(`${API_BASE_URL}/items/${itemId}`, updatedItem);
  return response.data;
};

// Create a new line item
export const createLineItem = async (
  categoryId: number,
  item: Partial<Item>
): Promise<Item> => {
  const response = await axios.post<Item>(`${API_BASE_URL}/items`, {
    ...item,
    categoryId
  });
  return response.data;
};

// Delete a line item
export const deleteLineItem = async (
  itemId: number
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/items/${itemId}`);
};

export const updateItemName = async (
  itemId: number,
  name: string
): Promise<Item> => {
  const response = await axios.put<Item>(`${API_BASE_URL}/items/${itemId}`, { name });
  return response.data;
}; 