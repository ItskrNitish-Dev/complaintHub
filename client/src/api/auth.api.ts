import apiClient from './axios';
import { ApiResponse, LoginResponseData, User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
};
