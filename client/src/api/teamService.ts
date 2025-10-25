import apiClient from './apiClient';
import { Team, InsertTeam } from '@shared/schema';

export const teamService = {
  getAllTeams: async () => {
    const response = await apiClient.get('/teams');
    return response.data;
  },

  createTeam: async (data: InsertTeam) => {
    const response = await apiClient.post('/teams', data);
    return response.data;
  }
};
