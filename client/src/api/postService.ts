import apiClient from './apiClient';
import { Post, InsertPost } from '@shared/schema';

export const postService = {
  getAllPosts: async () => {
    const response = await apiClient.get('/posts');
    return response.data;
  },

  getFeaturedPosts: async () => {
    const response = await apiClient.get('/posts/featured');
    return response.data;
  },

  getTrendingPosts: async () => {
    const response = await apiClient.get('/posts/trending');
    return response.data;
  },

  searchPosts: async (query: string) => {
    const response = await apiClient.get(`/posts/search?q=${query}`);
    return response.data;
  },

  getMyPosts: async () => {
    const response = await apiClient.get('/posts/my-posts');
    return response.data;
  },

  getPostStats: async () => {
    const response = await apiClient.get('/posts/stats');
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await apiClient.get(`/posts/${slug}`);
    return response.data;
  },

  createPost: async (data: InsertPost) => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: Partial<Post>) => {
    const response = await apiClient.patch(`/posts/${id}`, data);
    return response.data;
  },

  updatePostStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/posts/${id}/status`, { status });
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id: string) => {
    const response = await apiClient.post(`/posts/${id}/like`);
    return response.data;
  }
};