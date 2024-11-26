import axios from 'axios';
import { Project } from './programService';

// Define the base URL for your API
const API_BASE_URL = 'http://localhost:3000/projects';

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await axios.get<Project[]>(API_BASE_URL);
  return response.data;
};

// Fetch a single project by ID
export const fetchProjectById = async (id: number): Promise<Project> => {
  const response = await axios.get<Project>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// Create a new project
export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const response = await axios.post<Project>(API_BASE_URL, project);
  return response.data;
};

// Update an existing project
export const updateProject = async (id: number, project: Partial<Project>): Promise<Project> => {
  const response = await axios.put<Project>(`${API_BASE_URL}/${id}`, project);
  return response.data;
};

// Delete a project
export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};

// Clone a project
export const cloneProject = async (id: number, programId?: number): Promise<Project> => {
  const response = await axios.post<Project>(
    `${API_BASE_URL}/${id}/clone`,
    programId ? { programId } : {}
  );
  return response.data;
}; 