import apiClient from './axios';
import { ApiResponse, Department } from '../types';

export const departmentsApi = {
  getDepartments: async (params?: { activeOnly?: boolean }): Promise<ApiResponse<Department[]>> => {
    const response = await apiClient.get<ApiResponse<Department[]>>('/departments', { params });
    return response.data;
  },

  getDepartmentById: async (id: string): Promise<ApiResponse<{ department: Department }>> => {
    const response = await apiClient.get<ApiResponse<{ department: Department }>>(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: Partial<Department>): Promise<ApiResponse<{ department: Department }>> => {
    const response = await apiClient.post<ApiResponse<{ department: Department }>>('/departments', data);
    return response.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<ApiResponse<{ department: Department }>> => {
    const response = await apiClient.patch<ApiResponse<{ department: Department }>>(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/departments/${id}`);
    return response.data;
  },
};
