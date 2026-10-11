export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'CANCELLED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REASSIGNED';

export type NotificationType =
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMPLAINT_RESOLVED'
  | 'COMPLAINT_CLOSED';

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  department: Department | string;
  defaultPriority: PriorityLevel;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department | null;
  phone?: string;
  profileImage?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  landmark?: string;
}

export interface Complaint {
  _id: string;
  complaintNumber: string;
  title: string;
  description: string;
  summary?: string;
  createdBy: User;
  category: Category;
  department: Department;
  assignedOfficer?: User | null;
  status: ComplaintStatus;
  priority: PriorityLevel;
  location: GeoLocation;
  images: string[];
  resolvedAt?: string | null;
  closedAt?: string | null;
  isPublic: boolean;
  upvoteCount: number;
  followerCount: number;
  commentCount: number;
  isUpvoted?: boolean;
  isFollowed?: boolean;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  _id: string;
  complaint: string;
  status: ComplaintStatus;
  changedBy: User;
  note?: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  complaint: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Attachment {
  _id: string;
  complaint: string;
  uploader: User | string;
  url: string;
  publicId?: string;
  fileType?: string;
  originalName?: string;
  size?: number;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  complaint?: {
    _id: string;
    complaintNumber: string;
    title: string;
  } | null;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: Array<{ field: string; message: string }>;
  code?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}
