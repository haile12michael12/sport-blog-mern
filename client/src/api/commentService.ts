import apiClient from './apiClient';
import { Comment, InsertComment } from '@shared/schema';

export const commentService = {
  getComments: async (postId: string) => {
    const response = await apiClient.get(`/comments/${postId}`);
    return response.data;
  },

  createComment: async (postId: string, data: InsertComment) => {
    const response = await apiClient.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  deleteComment: async (id: string) => {
    const response = await apiClient.delete(`/comments/${id}`);
    return response.data;
  }
};
