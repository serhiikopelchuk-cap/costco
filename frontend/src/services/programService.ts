import axios from 'axios';

// Define the base URL for your API
const API_BASE_URL = 'http://localhost:3000/programs'; // Adjust the URL as needed

// Define the types for Program, Project, Category, Item, and Cost
export interface Cost {
  id?: number;
  value: number;
}

export interface Item {
  id?: number;
  name: string;
  costs: Cost[];
}

export interface Category {
  id?: number;
  name: string;
  items: Item[];
}

export interface Project {
  id?: number;
  name: string;
  categories: Category[];
}

export interface Program {
  id?: number;
  name: string;
  projects: Project[];
}

// Fetch all programs
export const fetchPrograms = async (): Promise<Program[]> => {
  const response = await axios.get<Program[]>(API_BASE_URL);
  return response.data;
};

// Fetch a single program by ID
export const fetchProgramById = async (id: number): Promise<Program> => {
  const response = await axios.get<Program>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Add clone function
export const cloneProgram = async (id: number): Promise<Program> => {
  const response = await axios.post<Program>(`${API_BASE_URL}/${id}/clone`);
  return response.data;
};