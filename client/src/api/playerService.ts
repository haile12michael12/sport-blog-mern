import apiClient from './apiClient';
import { Player, InsertPlayer } from '@shared/schema';

export const playerService = {
  getAllPlayers: async () => {
    const response = await apiClient.get('/players');
    return response.data;
  },

  createPlayer: async (data: InsertPlayer) => {
    const response = await apiClient.post('/players', data);
    return response.data;
  }
};
