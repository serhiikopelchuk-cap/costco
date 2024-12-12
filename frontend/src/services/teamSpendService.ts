import axios from 'axios';

const API_URL = process.env.API_URL + '/team-spend' || 'http://localhost:3000/team-spend';
// const API_URL = 'http://localhost:3000/team-spend';
export const getTeamSpends = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getTeamSpendById = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createTeamSpend = async (teamSpend: { vpName: string; teamName: string; budget: number }) => {
  const response = await axios.post(API_URL, teamSpend);
  return response.data;
};

export const updateTeamSpend = async (id: number, teamSpend: { vpName: string; teamName: string; budget: number }) => {
  const response = await axios.put(`${API_URL}/${id}`, teamSpend);
  return response.data;
};

export const deleteTeamSpend = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}; 