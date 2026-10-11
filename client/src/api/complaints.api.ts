import apiClient from './axios';
import { ApiResponse, Complaint, Comment } from '../types';

export interface ComplaintQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  createdBy?: string;
  assignedOfficer?: string;
  search?: string;
  sort?: string;
}

export interface NearbyQueryParams {
  lat: number;
  lng: number;
  radius?: number; // meters
}

export const complaintsApi = {
  getComplaints: async (params?: ComplaintQueryParams): Promise<ApiResponse<Complaint[]>> => {
    const response = await apiClient.get<ApiResponse<Complaint[]>>('/complaints', { params });
    return response.data;
  },

  getNearbyComplaints: async (params: NearbyQueryParams): Promise<ApiResponse<Complaint[]>> => {
    const response = await apiClient.get<ApiResponse<Complaint[]>>('/complaints/nearby', { params });
    return response.data;
  },

  getComplaintById: async (id: string): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (formData: FormData): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.post<ApiResponse<Complaint>>('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateComplaint: async (id: string, data: Partial<Complaint>): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.patch<ApiResponse<Complaint>>(`/complaints/${id}`, data);
    return response.data;
  },

  deleteComplaint: async (id: string): Promise<ApiResponse<{ id: string; complaintNumber: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ id: string; complaintNumber: string }>>(`/complaints/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: { status: string; note?: string }
  ): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, data);
    return response.data;
  },

  assignOfficer: async (
    id: string,
    data: { officerId: string; notes?: string }
  ): Promise<ApiResponse<Complaint>> => {
    const response = await apiClient.post<ApiResponse<Complaint>>(`/complaints/${id}/assign`, data);
    return response.data;
  },

  // Social interactions
  addComment: async (id: string, content: string): Promise<ApiResponse<{ comment: Comment }>> => {
    const response = await apiClient.post<ApiResponse<{ comment: Comment }>>(`/complaints/${id}/comments`, { content });
    return response.data;
  },

  vote: async (id: string): Promise<ApiResponse<{ upvoteCount: number; isUpvoted: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ upvoteCount: number; isUpvoted: boolean }>>(`/complaints/${id}/vote`);
    return response.data;
  },

  unvote: async (id: string): Promise<ApiResponse<{ upvoteCount: number; isUpvoted: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ upvoteCount: number; isUpvoted: boolean }>>(`/complaints/${id}/vote`);
    return response.data;
  },

  follow: async (id: string): Promise<ApiResponse<{ followerCount: number; isFollowed: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ followerCount: number; isFollowed: boolean }>>(`/complaints/${id}/follow`);
    return response.data;
  },

  unfollow: async (id: string): Promise<ApiResponse<{ followerCount: number; isFollowed: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ followerCount: number; isFollowed: boolean }>>(`/complaints/${id}/follow`);
    return response.data;
  },

  // Comment operations
  deleteComment: async (commentId: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(`/comments/${commentId}`);
    return response.data;
  },

  // Attachment operations
  uploadAttachments: async (complaintId: string, formData: FormData): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.post<ApiResponse<any[]>>(
      `/complaints/${complaintId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  getAttachments: async (complaintId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/complaints/${complaintId}/attachments`);
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/attachments/${attachmentId}`);
    return response.data;
  },
};
