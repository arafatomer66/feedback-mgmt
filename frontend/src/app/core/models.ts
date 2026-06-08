export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar_url: string;
}

export type FeedbackStatus = 'OPEN' | 'IN_REVIEW' | 'PLANNED' | 'RESOLVED' | 'DECLINED';
export type FeedbackCategory = 'Bug Report' | 'Feature Request' | 'UX Improvement' | 'Performance' | 'Documentation' | 'Integration';

export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  rating: number;
  vote_count: number;
  author: User;
  assignee: User | null;
  created_at: string;
  updated_at: string;
  voted?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  is_internal: boolean;
  author: User;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AnalyticsOverview {
  total: number;
  open: number;
  resolved: number;
  inReview: number;
  planned: number;
  declined: number;
  avg_resolution_days: string;
  resolution_rate: string;
}
