import apiClient from './axios';
import { ApiResponse, Category } from '../types';

export const categoriesApi = {
  getCategories: async (params?: { activeOnly?: boolean; department?: string }): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories', { params });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.post<ApiResponse<{ category: Category }>>('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<{ category: Category }>> => {
    const response = await apiClient.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/categories/${id}`);
    return response.data;
  },
};
