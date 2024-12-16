import axios from 'axios';
import { CloudProvider } from '../types/program';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/cloud-providers`;

export const fetchCloudProviders = async (): Promise<CloudProvider[]> => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const createCloudProvider = async (name: string): Promise<CloudProvider> => {
  const response = await axios.post(BASE_URL, { name });
  return response.data;
};

export const updateCloudProvider = async (id: number, name: string): Promise<CloudProvider> => {
  const response = await axios.put(`${BASE_URL}/${id}`, { name });
  return response.data;
};

export const deleteCloudProvider = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
}; 