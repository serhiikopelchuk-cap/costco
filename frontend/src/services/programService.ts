// import { Program } from '../types/program';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Program, Project } from '../types/program';

// Define the base URL for your API
const PROGRAMS_URL = `${API_BASE_URL}/programs`;

// Fetch all programs
export const fetchPrograms = async (): Promise<Program[]> => {
  const response = await axios.get<Program[]>(PROGRAMS_URL);
  return response.data;
};

// Fetch a single program by ID
export const fetchProgramById = async (id: number): Promise<Program> => {
  const response = await axios.get<Program>(`${PROGRAMS_URL}/${id}`);
  return response.data;
};

// Add clone function
export const cloneProgram = async (id: number): Promise<Program> => {
  const response = await axios.post<Program>(`${PROGRAMS_URL}/${id}/clone`);
  return response.data;
};

// Delete a program
export const deleteProgram = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/programs/${id}`);
};

// Create a program
export const createProgram = async (program: Partial<Program>, costTypeId: number): Promise<Program> => {
  const response = await axios.post<Program>(PROGRAMS_URL, {
    ...program,
    costType: { id: costTypeId } // Include costTypeId in the program data
  });
  return response.data;
};
