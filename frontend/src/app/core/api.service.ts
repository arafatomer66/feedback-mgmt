import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Feedback, PaginatedResponse, Comment, AnalyticsOverview } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFeedback(params: Record<string, any> = {}) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') p = p.set(k, v); });
    return this.http.get<PaginatedResponse<Feedback>>(`${this.base}/feedback`, { params: p });
  }

  getFeedbackById(id: string) {
    return this.http.get<Feedback>(`${this.base}/feedback/${id}`);
  }

  createFeedback(data: any) {
    return this.http.post<Feedback>(`${this.base}/feedback`, data);
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<Feedback>(`${this.base}/feedback/${id}/status`, { status });
  }

  assignFeedback(id: string, assignee_id: string) {
    return this.http.patch<Feedback>(`${this.base}/feedback/${id}/assign`, { assignee_id });
  }

  mergeFeedback(sourceId: string, targetId: string) {
    return this.http.post<Feedback>(`${this.base}/feedback/${sourceId}/merge`, { target_id: targetId });
  }

  toggleVote(feedbackId: string) {
    return this.http.post<{ voted: boolean }>(`${this.base}/votes/${feedbackId}`, {});
  }

  getComments(feedbackId: string) {
    return this.http.get<Comment[]>(`${this.base}/comments/${feedbackId}/all`);
  }

  getPublicComments(feedbackId: string) {
    return this.http.get<Comment[]>(`${this.base}/comments/${feedbackId}`);
  }

  addComment(feedbackId: string, body: string, is_internal = false) {
    return this.http.post<Comment>(`${this.base}/comments/${feedbackId}`, { body, is_internal });
  }

  getOverview() {
    return this.http.get<AnalyticsOverview>(`${this.base}/analytics/overview`);
  }

  getVolume(days = 30) {
    return this.http.get<Array<{ date: string; count: string }>>(`${this.base}/analytics/volume?days=${days}`);
  }

  getBreakdown() {
    return this.http.get<{ byStatus: any[]; byCategory: any[] }>(`${this.base}/analytics/breakdown`);
  }

  getTopVoted(limit = 10) {
    return this.http.get<Feedback[]>(`${this.base}/analytics/top-voted?limit=${limit}`);
  }

  getUsers() {
    return this.http.get<any[]>(`${this.base}/users`);
  }
}
