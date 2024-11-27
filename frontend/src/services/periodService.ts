import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface Period {
  id: number;
  name: string;
  number: number;
  month: string | null;
  isFrozen: boolean;
}

export const periodService = {
  async getAllPeriods(): Promise<Period[]> {
    const response = await axios.get(`${API_BASE_URL}/periods`);
    return response.data;
  },

  async isPeriodFrozen(periodNumber: number): Promise<boolean> {
    const response = await axios.get(`${API_BASE_URL}/periods/frozen/${periodNumber}`);
    return response.data;
  }
}; 