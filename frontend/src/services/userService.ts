import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Program, User } from '../types/program';
import { User as UserType } from '../types/program';

const USERS_URL = `${API_BASE_URL}/users`;

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`);
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await axios.get(USERS_URL);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserType> => {
    const response = await axios.get(`${USERS_URL}/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${USERS_URL}/${id}`, userData);
    return response.data;
  },

  // Add program to user
  addProgramToUser: async (userId: number, programId: number): Promise<User> => {
    const response = await axios.post(`${USERS_URL}/${userId}/programs/${programId}`);
    return response.data;
  },

  // Remove program from user
  removeProgramFromUser: async (userId: number, programId: number): Promise<User> => {
    const response = await axios.delete(`${USERS_URL}/${userId}/programs/${programId}`);
    return response.data;
  },

  // Get user's programs
  getUserPrograms: async (userId: number): Promise<Program[]> => {
    const user = await userService.getUserById(userId);
    return user.programs;
  }
}; 