import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Project } from '../types/program';

// Define the base URL for your API
const PROJECTS_URL = `${API_BASE_URL}/projects`;

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await axios.get<Project[]>(PROJECTS_URL);
  return response.data;
};

// Fetch a single project by ID
export const fetchProjectById = async (id: number): Promise<Project> => {
  const response = await axios.get<Project>(`${PROJECTS_URL}/${id}`);
  return response.data;
};

// Create a new project
export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const response = await axios.post<Project>(PROJECTS_URL, project);
  return response.data;
};

// Update an existing project
export const updateProject = async (id: number, project: Partial<Project>): Promise<Project> => {
  const response = await axios.put<Project>(`${PROJECTS_URL}/${id}`, project);
  return response.data;
};

// Delete a project
export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`${PROJECTS_URL}/${id}`);
};

// Clone a project
export const cloneProject = async (id: number, programId: number): Promise<Project> => {
  const response = await axios.post<Project>(
    `${PROJECTS_URL}/${id}/clone`,
    { programId }
  );
  return response.data;
}; 