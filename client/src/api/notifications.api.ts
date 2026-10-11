import apiClient from './axios';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: async (): Promise<ApiResponse<NotificationItem[]>> => {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<NotificationItem>> => {
    const response = await apiClient.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.patch<ApiResponse<{ count: number }>>('/notifications/read-all');
    return response.data;
  },
};
