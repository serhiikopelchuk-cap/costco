import axios from 'axios';
import { API_BASE_URL } from '../config';
import { CostType } from '../types/program';
// Define the base URL for your API
const COST_TYPES_URL = `${API_BASE_URL}/cost-types`;

// Fetch a CostType by alias
export const fetchCostTypeByAlias = async (alias: string): Promise<CostType> => {
  const response = await axios.get<CostType>(`${COST_TYPES_URL}/alias/${alias}`);
  return response.data;
}; 