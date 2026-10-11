import apiClient from './axios';
import { ApiResponse, User } from '../types';

export const usersApi = {
  getMyProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data;
  },

  updateMyProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>('/users/me', data);
    return response.data;
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data;
  },

  updateUserRole: async (
    id: string,
    data: { role: string; department?: string | null }
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${id}/role`, data);
    return response.data;
  },

  updateUserStatus: async (
    id: string,
    data: { isActive: boolean }
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${id}/status`, data);
    return response.data;
  },
};
