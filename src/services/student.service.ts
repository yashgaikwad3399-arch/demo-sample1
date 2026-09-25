import api from './api';
import {
  AvailableExamsResponse,
  ExamHistoryResponse,
  ExamResultReviewResponse,
  LatestResultResponse,
  User,
} from '../types';

export interface StudentProfileResponse {
  success: boolean;
  student: User;
}

export interface ExamHistoryQueryParams {
  subject?: string;
  sort?: string;
  status?: string;
}

export const studentService = {
  /**
   * Fetch authenticated student's profile details
   */
  async getProfile(): Promise<StudentProfileResponse> {
    const response = await api.get<StudentProfileResponse>('/student/profile');
    return response.data;
  },

  /**
   * Fetch all available examination tracks (Java, SQL)
   */
  async getAvailableExams(): Promise<AvailableExamsResponse> {
    const response = await api.get<AvailableExamsResponse>('/student/exams');
    return response.data;
  },

  /**
   * Fetch examination attempts history for the authenticated student
   * Strictly returns only the logged-in student's history
   */
  async getExamHistory(params?: ExamHistoryQueryParams): Promise<ExamHistoryResponse> {
    const response = await api.get<ExamHistoryResponse>('/student/history', { params });
    return response.data;
  },

  /**
   * Fetch specific examination attempt details with question reviews for authenticated student
   */
  async getAttemptDetails(attemptId: number | string): Promise<ExamResultReviewResponse> {
    const response = await api.get<ExamResultReviewResponse>(`/student/history/${attemptId}`);
    return response.data;
  },

  /**
   * Fetch the latest exam attempt and score
   */
  async getLatestResult(): Promise<LatestResultResponse> {
    const response = await api.get<LatestResultResponse>('/student/latest-result');
    return response.data;
  },
};

